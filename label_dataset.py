import os
import csv
import json

# Define directories
dataset_dir = "indian"
output_csv = "labels.csv"
output_json = "class_mapping.json"

if not os.path.exists(dataset_dir):
    print(f"Error: Dataset directory '{dataset_dir}' not found.")
    exit(1)

# Find all class subdirectories
classes = sorted([d for d in os.listdir(dataset_dir) if os.path.isdir(os.path.join(dataset_dir, d))])
class_to_id = {cls: idx for idx, cls in enumerate(classes)}

print(f"Found {len(classes)} classes: {classes}")

# List all image files with their class labels
dataset_records = []
for cls in classes:
    class_dir = os.path.join(dataset_dir, cls)
    files = sorted(os.listdir(class_dir))
    for file in files:
        if file.lower().endswith(('.png', '.jpg', '.jpeg')):
            # Store path using forward slashes for cross-platform compatibility
            rel_path = os.path.join(dataset_dir, cls, file).replace('\\', '/')
            dataset_records.append({
                'image_path': rel_path,
                'label': cls,
                'label_id': class_to_id[cls]
            })

# Save to CSV
with open(output_csv, mode='w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['image_path', 'label', 'label_id'])
    writer.writeheader()
    writer.writerows(dataset_records)

# Save class mapping to JSON
with open(output_json, mode='w', encoding='utf-8') as f:
    json.dump({
        'class_to_id': class_to_id,
        'id_to_class': {idx: cls for cls, idx in class_to_id.items()}
    }, f, indent=4)

print(f"Successfully labeled {len(dataset_records)} images.")
print(f"Saved database to '{output_csv}' and class mapping to '{output_json}'.")
