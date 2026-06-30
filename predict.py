import os
import sys
import json
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from torchvision.models import mobilenet_v3_small
from PIL import Image

def predict(image_path, model_path="best_sign_model.pth", mapping_path="class_mapping.json"):
    # Check if files exist
    if not os.path.exists(image_path):
        print(f"Error: Image file '{image_path}' not found.")
        return
    if not os.path.exists(model_path):
        print(f"Error: Model file '{model_path}' not found. Please train the model first.")
        return
    if not os.path.exists(mapping_path):
        print(f"Error: Mapping file '{mapping_path}' not found.")
        return

    # Load mapping
    with open(mapping_path, 'r', encoding='utf-8') as f:
        mapping_data = json.load(f)
        id_to_class = {int(k): v for k, v in mapping_data['id_to_class'].items()}
        num_classes = len(id_to_class)

    # Initialize MobileNetV3 model architecture
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = mobilenet_v3_small()
    
    # Modify classifier to match train.py
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, num_classes)
    
    # Load weights
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()

    # Preprocess image
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    try:
        image = Image.open(image_path).convert('RGB')
    except Exception as e:
        print(f"Error loading image: {e}")
        return

    image_tensor = transform(image).unsqueeze(0).to(device) # Add batch dimension

    # Run inference
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = F.softmax(outputs, dim=1)[0]

    # Get top predictions
    top_probs, top_indices = torch.topk(probabilities, k=min(3, num_classes))

    print(f"\nPredictions for '{image_path}':")
    for i in range(len(top_probs)):
        class_id = top_indices[i].item()
        prob = top_probs[i].item() * 100.0
        class_name = id_to_class[class_id]
        print(f"  {i+1}. {class_name} ({prob:.2f}%)")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python predict.py <path_to_image>")
        # Try to find a default image to test with
        default_img = "indian/A/A (1).jpg"
        if os.path.exists(default_img):
            print(f"Using default image: {default_img}")
            predict(default_img)
        else:
            print("Please specify an image path.")
    else:
        predict(sys.argv[1])
