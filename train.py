import os
import csv
import json
import random
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt

# -------------------------------------------------------------
# Configuration & Setup
# -------------------------------------------------------------
random_seed = 42
random.seed(random_seed)
np.random.seed(random_seed)
torch.manual_seed(random_seed)

batch_size = 32
epochs = 20
learning_rate = 0.001
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# -------------------------------------------------------------
# Dataset & Preprocessing
# -------------------------------------------------------------
class ISLDataset(Dataset):
    def __init__(self, records, transform=None):
        self.records = records
        self.transform = transform

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx):
        record = self.records[idx]
        img_path = record['image_path']
        label_id = int(record['label_id'])
        
        try:
            image = Image.open(img_path).convert('RGB')
        except Exception as e:
            print(f"Error loading image {img_path}: {e}")
            image = Image.new('RGB', (128, 128))
            
        if self.transform:
            image = self.transform(image)
            
        return image, label_id

# Load records
records = []
with open('labels.csv', mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        records.append(row)

# Shuffle and split into Train (80%) and Validation (20%)
random.shuffle(records)
split_idx = int(len(records) * 0.8)
train_records = records[:split_idx]
val_records = records[split_idx:]

print(f"Total dataset: {len(records)} images")
print(f"Training set: {len(train_records)} images")
print(f"Validation set: {len(val_records)} images")

# Load Class Mapping
with open('class_mapping.json', 'r', encoding='utf-8') as f:
    mapping_data = json.load(f)
    class_to_id = mapping_data['class_to_id']
    id_to_class = {int(k): v for k, v in mapping_data['id_to_class'].items()}
    num_classes = len(class_to_id)

# Image transforms (MobileNet standard normalization)
train_transform = transforms.Compose([
    transforms.RandomRotation(10),
    transforms.RandomAffine(degrees=0, translate=(0.05, 0.05), scale=(0.95, 1.05)),
    transforms.ColorJitter(brightness=0.15, contrast=0.15),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Data loaders
train_dataset = ISLDataset(train_records, transform=train_transform)
val_dataset = ISLDataset(val_records, transform=val_transform)

train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, drop_last=False)
val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, drop_last=False)

# -------------------------------------------------------------
# Pretrained MobileNetV3 Model Setup
# -------------------------------------------------------------
# Load model with pre-trained ImageNet weights
weights = MobileNet_V3_Small_Weights.DEFAULT
model = mobilenet_v3_small(weights=weights)

# Replace classifier head for 23 sign alphabet classes
# MobileNetV3 classifier sequence: Dropout(0.2), Linear(1024, 1024), Hardswish(), Linear(1024, num_classes)
in_features = model.classifier[3].in_features
model.classifier[3] = nn.Linear(in_features, num_classes)

model = model.to(device)
criterion = nn.CrossEntropyLoss()

# Setup Two-Stage Transfer Learning
print("Phase 1: Freezing backbone layers, training only the classifier head...")
for param in model.parameters():
    param.requires_grad = False
for param in model.classifier.parameters():
    param.requires_grad = True

# Using Adam with weight decay. Start with standard LR for classifier head.
optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=0.001, weight_decay=1e-4)
scheduler = None

# -------------------------------------------------------------
# Training & Validation Loops
# -------------------------------------------------------------
train_losses = []
val_losses = []
train_accs = []
val_accs = []

best_val_acc = 0.0
phase2_active = False

print("\nStarting Training with MobileNetV3 Transfer Learning...")
for epoch in range(1, epochs + 1):
    # Transition to Phase 2: Unfreeze everything and fine-tune with a low learning rate
    if epoch == 6:
        print("\nPhase 2: Unfreezing backbone for fine-tuning...")
        for param in model.parameters():
            param.requires_grad = True
        # Re-initialize optimizer with lower learning rate for the entire model
        optimizer = optim.Adam(model.parameters(), lr=0.0001, weight_decay=1e-4)
        # Use CosineAnnealingLR for fine-tuning
        scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs - 5)
        phase2_active = True

    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    for images, targets in train_loader:
        images = images.to(device)
        targets = targets.to(device)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += targets.size(0)
        correct += predicted.eq(targets).sum().item()
        
    epoch_train_loss = running_loss / total
    epoch_train_acc = 100.0 * correct / total
    train_losses.append(epoch_train_loss)
    train_accs.append(epoch_train_acc)
    
    # Validation phase
    model.eval()
    val_running_loss = 0.0
    val_correct = 0
    val_total = 0
    
    with torch.no_grad():
        for images, targets in val_loader:
            images = images.to(device)
            targets = targets.to(device)
            
            outputs = model(images)
            loss = criterion(outputs, targets)
            
            val_running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            val_total += targets.size(0)
            val_correct += predicted.eq(targets).sum().item()
            
    epoch_val_loss = val_running_loss / val_total
    epoch_val_acc = 100.0 * val_correct / val_total
    val_losses.append(epoch_val_loss)
    val_accs.append(epoch_val_acc)
    
    # Step scheduler if fine-tuning
    if phase2_active and scheduler is not None:
        scheduler.step()
    
    print(f"Epoch [{epoch}/{epochs}] "
          f"Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc:.2f}% | "
          f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc:.2f}%")
          
    # Save Best Model
    if epoch_val_acc > best_val_acc:
        best_val_acc = epoch_val_acc
        torch.save(model.state_dict(), "best_sign_model.pth")
        print(f" => Saved new best model with Val Acc: {best_val_acc:.2f}%")

# Save final model state
torch.save(model.state_dict(), "final_sign_model.pth")
print("\nTraining completed.")
print(f"Best Validation Accuracy: {best_val_acc:.2f}%")

# -------------------------------------------------------------
# Plotting Results & Generating Confusion Matrix
# -------------------------------------------------------------
# Load Best Model for Evaluation
model.load_state_dict(torch.load("best_sign_model.pth"))
model.eval()

y_true = []
y_pred = []

with torch.no_grad():
    for images, targets in val_loader:
        images = images.to(device)
        outputs = model(images)
        _, predicted = outputs.max(1)
        y_true.extend(targets.numpy())
        y_pred.extend(predicted.cpu().numpy())

# Calculate Confusion Matrix
cm = np.zeros((num_classes, num_classes), dtype=int)
for t, p in zip(y_true, y_pred):
    cm[t, p] += 1

# Plot Training History
plt.figure(figsize=(12, 5))

# Loss plot
plt.subplot(1, 2, 1)
plt.plot(range(1, epochs + 1), train_losses, label='Train Loss', color='blue')
plt.plot(range(1, epochs + 1), val_losses, label='Val Loss', color='orange')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('Training and Validation Loss')
plt.legend()
plt.grid(True)

# Accuracy plot
plt.subplot(1, 2, 2)
plt.plot(range(1, epochs + 1), train_accs, label='Train Acc', color='blue')
plt.plot(range(1, epochs + 1), val_accs, label='Val Acc', color='orange')
plt.xlabel('Epoch')
plt.ylabel('Accuracy (%)')
plt.title('Training and Validation Accuracy')
plt.legend()
plt.grid(True)

plt.tight_layout()
plt.savefig('learning_curves.png')
plt.close()

# Plot Confusion Matrix
class_names = [id_to_class[i] for i in range(num_classes)]

plt.figure(figsize=(10, 8))
plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
plt.title('Confusion Matrix')
plt.colorbar()
tick_marks = np.arange(len(class_names))
plt.xticks(tick_marks, class_names, rotation=45)
plt.yticks(tick_marks, class_names)

# Label cells
thresh = cm.max() / 2.
for i in range(cm.shape[0]):
    for j in range(cm.shape[1]):
        if cm[i, j] > 0:
            plt.text(j, i, format(cm[i, j], 'd'),
                     horizontalalignment="center",
                     color="white" if cm[i, j] > thresh else "black")

plt.ylabel('True label')
plt.xlabel('Predicted label')
plt.tight_layout()
plt.savefig('confusion_matrix.png')
plt.close()

# Calculate per-class accuracy and print summary
print("\nEvaluation Summary:")
correct_by_class = cm.diagonal()
total_by_class = cm.sum(axis=1)

for idx, name in enumerate(class_names):
    if total_by_class[idx] > 0:
        cls_acc = 100.0 * correct_by_class[idx] / total_by_class[idx]
        print(f"  Class {name}: {correct_by_class[idx]}/{total_by_class[idx]} correct ({cls_acc:.1f}%)")
    else:
        print(f"  Class {name}: No validation samples")

overall_acc = 100.0 * np.sum(correct_by_class) / np.sum(total_by_class)
print(f"\nOverall Validation Accuracy: {overall_acc:.2f}%")
print("Saved plots: 'learning_curves.png' and 'confusion_matrix.png'.")
