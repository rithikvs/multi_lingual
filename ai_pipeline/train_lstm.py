import os
import json
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Input, Conv1D, LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

def train_model(data_dir="data_processed", output_model="sign_lstm_model.keras"):
    # Check if processed data files exist
    X_path = os.path.join(data_dir, "X_data.npy")
    y_path = os.path.join(data_dir, "y_data.npy")
    mapping_path = os.path.join(data_dir, "class_mapping.json")
    
    if not (os.path.exists(X_path) and os.path.exists(y_path)):
        print(f"Error: Processed data files not found in '{data_dir}'. Run extract_landmarks.py first.")
        return
        
    # Load datasets
    X = np.load(X_path)
    y = np.load(y_path)
    
    with open(mapping_path, 'r', encoding='utf-8') as f:
        mapping = json.load(f)
        id_to_class = {int(k): v for k, v in mapping['id_to_class'].items()}
        num_classes = len(id_to_class)
        
    print(f"Loaded X_data: {X.shape}, y_data: {y.shape}")
    
    # --- Sequence Construction & Data Augmentation ---
    # Since our dataset is based on static images, we will build sequences of length T = 5
    # by repeating the same landmark coordinates. To make the model robust to live video
    # jitters, we will add slight random Gaussian noise during sequence expansion.
    sequence_length = 5
    X_seq = []
    
    print("Constructing sequence data and adding noise augmentation...")
    for i in range(len(X)):
        frame_data = X[i] # Shape (63,)
        seq = []
        for t in range(sequence_length):
            # Add small random noise to coordinates (mean=0, std=0.005)
            noise = np.random.normal(0, 0.005, size=frame_data.shape)
            seq.append(frame_data + noise)
        X_seq.append(seq)
        
    X_seq = np.array(X_seq) # Shape (num_samples, sequence_length, 63)
    print(f"Reshaped sequential dataset: {X_seq.shape}")
    
    # Train-test split
    X_train, X_val, y_train, y_val = train_test_split(
        X_seq, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # CNN + LSTM Architecture
    model = Sequential([
        Input(shape=(sequence_length, 63)),
        # 1D Convolution over temporal steps to extract local coordinate shapes
        Conv1D(filters=64, kernel_size=3, padding='same', activation='relu'),
        BatchNormalization(),
        Dropout(0.2),
        # LSTM Layers to process the sequential inputs
        LSTM(64, return_sequences=True),
        Dropout(0.2),
        LSTM(32),
        Dropout(0.2),
        # Output Classification Layer
        Dense(32, activation='relu'),
        Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.summary()
    
    # Callbacks
    early_stop = EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True)
    reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-5)
    
    # Train
    print("\nStarting CNN-LSTM model training...")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=50,
        batch_size=32,
        callbacks=[early_stop, reduce_lr]
    )
    
    # Save model
    model.save(output_model)
    print(f"\nModel saved successfully as '{output_model}'")
    
    # Evaluation
    val_loss, val_acc = model.evaluate(X_val, y_val, verbose=0)
    print(f"\nValidation Loss: {val_loss:.4f}")
    print(f"Validation Accuracy: {val_acc*100:.2f}%")
    
    # Predict
    y_pred_probs = model.predict(X_val)
    y_pred = np.argmax(y_pred_probs, axis=1)
    
    # Generate Classification Report
    class_names = [id_to_class[i] for i in range(num_classes)]
    print("\nClassification Report:")
    report = classification_report(y_val, y_pred, target_names=class_names)
    print(report)
    
    # Save Classification Report
    with open("classification_report.txt", "w", encoding="utf-8") as f:
        f.write(report)
    
    # Plot training logs
    plt.figure(figsize=(12, 5))
    
    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Val Loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.title('Loss Curves')
    plt.legend()
    plt.grid(True)
    
    plt.subplot(1, 2, 2)
    plt.plot(history.history['accuracy'], label='Train Acc')
    plt.plot(history.history['val_accuracy'], label='Val Acc')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.title('Accuracy Curves')
    plt.legend()
    plt.grid(True)
    
    plt.tight_layout()
    plt.savefig('lstm_learning_curves.png')
    plt.close()
    
    # Plot Confusion Matrix
    cm = confusion_matrix(y_val, y_pred)
    plt.figure(figsize=(10, 8))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('LSTM Confusion Matrix')
    plt.colorbar()
    tick_marks = np.arange(len(class_names))
    plt.xticks(tick_marks, class_names, rotation=45)
    plt.yticks(tick_marks, class_names)
    
    # Label cell values
    thresh = cm.max() / 2.
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            if cm[i, j] > 0:
                plt.text(j, i, format(cm[i, j], 'd'),
                         horizontalalignment="center",
                         color="white" if cm[i, j] > thresh else "black")
                         
    plt.ylabel('True Class')
    plt.xlabel('Predicted Class')
    plt.tight_layout()
    plt.savefig('lstm_confusion_matrix.png')
    plt.close()
    
    print("Saved training logs: 'lstm_learning_curves.png' and 'lstm_confusion_matrix.png'")

if __name__ == "__main__":
    train_model()
