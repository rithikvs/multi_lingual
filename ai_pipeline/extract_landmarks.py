import os
import cv2
import json
import numpy as np
import mediapipe as mp

def extract_landmarks_from_dataset(dataset_dir="indian", output_dir="data_processed"):
    os.makedirs(output_dir, exist_ok=True)
    
    # Initialize MediaPipe Hands
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=1,
        min_detection_confidence=0.5
    )
    
    # Find all class folders
    if not os.path.exists(dataset_dir):
        print(f"Error: Dataset directory '{dataset_dir}' not found.")
        return
        
    classes = sorted([d for d in os.listdir(dataset_dir) if os.path.isdir(os.path.join(dataset_dir, d))])
    class_to_id = {cls: idx for idx, cls in enumerate(classes)}
    
    print(f"Classes found: {classes}")
    
    X = []
    y = []
    
    total_processed = 0
    extracted_count = 0
    
    for cls in classes:
        cls_dir = os.path.join(dataset_dir, cls)
        image_files = [f for f in os.listdir(cls_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        print(f"Processing class '{cls}' ({len(image_files)} images)...")
        
        for file in image_files:
            img_path = os.path.join(cls_dir, file)
            image = cv2.imread(img_path)
            if image is None:
                continue
                
            total_processed += 1
            # Convert to RGB
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = hands.process(image_rgb)
            
            if results.multi_hand_landmarks:
                hand_landmarks = results.multi_hand_landmarks[0]
                
                # Extract 21 landmarks (x, y, z)
                coords = []
                for lm in hand_landmarks.landmark:
                    coords.append([lm.x, lm.y, lm.z])
                
                coords = np.array(coords) # Shape (21, 3)
                
                # --- Normalize coordinates for Translation & Scale Invariance ---
                # 1. Translation invariance: Center at wrist (landmark 0)
                wrist = coords[0]
                coords_centered = coords - wrist
                
                # 2. Scale invariance: Divide by hand span/length (distance from wrist to middle finger MCP, landmark 9)
                mcp = coords_centered[9]
                hand_size = np.linalg.norm(mcp)
                
                if hand_size > 0:
                    coords_normalized = coords_centered / hand_size
                else:
                    coords_normalized = coords_centered
                
                # Flatten coords to 1D array of 63 elements
                flat_coords = coords_normalized.flatten()
                
                X.append(flat_coords)
                y.append(class_to_id[cls])
                extracted_count += 1
                
    # Save datasets
    X = np.array(X)
    y = np.array(y)
    
    np.save(os.path.join(output_dir, "X_data.npy"), X)
    np.save(os.path.join(output_dir, "y_data.npy"), y)
    
    # Save class mappings
    mapping = {
        "class_to_id": class_to_id,
        "id_to_class": {idx: cls for cls, idx in class_to_id.items()}
    }
    with open(os.path.join(output_dir, "class_mapping.json"), "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=4)
        
    print("\nExtraction summary:")
    print(f"  Total images processed: {total_processed}")
    print(f"  Hands successfully detected & extracted: {extracted_count} ({extracted_count/total_processed*100:.1f}%)")
    print(f"  X_data shape: {X.shape}")
    print(f"  y_data shape: {y.shape}")
    print(f"  Data saved to '{output_dir}/' folder.")
    
    hands.close()

if __name__ == "__main__":
    extract_landmarks_from_dataset()
