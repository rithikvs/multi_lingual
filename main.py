import os
import io
import json
import base64
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
from PIL import Image
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

app = FastAPI(title="ISL Sign Language to Text Translator")

# Ensure static and template directories exist
os.makedirs("static/css", exist_ok=True)
os.makedirs("static/js", exist_ok=True)
os.makedirs("templates", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Jinja2 templates
templates = Jinja2Templates(directory="templates")

# Load configuration and model
MODEL_PATH = "best_sign_model.pth"
MAPPING_PATH = "class_mapping.json"

if not os.path.exists(MAPPING_PATH):
    raise FileNotFoundError(f"Mapping file '{MAPPING_PATH}' not found.")

with open(MAPPING_PATH, 'r', encoding='utf-8') as f:
    mapping_data = json.load(f)
    id_to_class = {int(k): v for k, v in mapping_data['id_to_class'].items()}
    num_classes = len(id_to_class)

# Initialize Model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Web server using device: {device}")

from torchvision.models import mobilenet_v3_small
model = mobilenet_v3_small()
model.classifier[3] = nn.Linear(model.classifier[3].in_features, num_classes)

# Preprocessing transforms (224x224 input resolution)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Lazy load weights on first request or startup
model_loaded = False

def load_model_weights():
    global model_loaded
    if not model_loaded:
        if os.path.exists(MODEL_PATH):
            model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
            model.to(device)
            model.eval()
            model_loaded = True
            print("Model weights loaded successfully.")
        else:
            print(f"Warning: Model weights file '{MODEL_PATH}' not found yet. Predictions might fail until training completes.")

class PredictionRequest(BaseModel):
    image: str  # Base64 encoded JPEG image data url

@app.get("/", response_class=HTMLResponse)
async def get_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/predict")
async def predict_frame(payload: PredictionRequest):
    load_model_weights()
    if not model_loaded:
        return {"error": "Model weights not loaded yet. Please wait for training to complete."}
        
    try:
        # Decode base64 image
        header, encoded = payload.image.split(",", 1) if "," in payload.image else ("", payload.image)
        image_bytes = base64.b64decode(encoded)
        
        # Load image into PIL
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Preprocess
        tensor = transform(image).unsqueeze(0).to(device)
        
        # Run inference
        with torch.no_grad():
            outputs = model(tensor)
            probabilities = F.softmax(outputs, dim=1)[0]
            
        top_prob, top_idx = torch.max(probabilities, 0)
        confidence = top_prob.item()
        predicted_class = id_to_class[top_idx.item()]
        
        return {
            "predicted_class": predicted_class,
            "confidence": confidence,
            "probabilities": {id_to_class[i]: float(probabilities[i]) for i in range(num_classes)}
        }
    except Exception as e:
        print(f"Inference error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to process image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
