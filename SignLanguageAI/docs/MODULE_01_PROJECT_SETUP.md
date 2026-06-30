# Module 1: Project Setup

This module creates the base project folder, the Python virtual environment, and the dependency list.

## 1. Project Folder

The main folder is named `SignLanguageAI`.

Each subfolder has one job:

- `dataset/`: stores raw and processed sign language images.
- `dataset/ISL/`: stores Indian Sign Language data.
- `dataset/ASL/`: stores American Sign Language data.
- `preprocessing/`: contains scripts that clean and prepare data.
- `models/`: contains model architecture code.
- `training/`: contains scripts used to train the deep learning model.
- `prediction/`: contains real-time webcam prediction code.
- `frontend/`: contains the React web application.
- `backend/`: contains the Flask API.
- `speech/`: contains text-to-speech and speech-to-text code.
- `emergency/`: contains SOS, location, and SMS code.
- `saved_models/`: stores trained models.
- `utils/`: contains reusable helper functions.
- `docs/`: contains beginner-friendly documentation.
- `notebooks/`: optional experiments and visualizations.

## 2. Virtual Environment

A virtual environment is a private Python workspace for this project.

It keeps this project's packages separate from other Python projects on your computer.

Create it with:

```powershell
cd "D:\sem 7\sign\SignLanguageAI"
python -m venv .venv
```

Activate it with:

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then activate again.

## 3. Install Packages

After activating the virtual environment, install all packages:

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 4. Package Explanations

- `tensorflow`: deep learning framework used to build and train the sign recognition model.
- `mediapipe`: detects hand landmarks from webcam images.
- `opencv-python`: opens the webcam and processes video frames.
- `numpy`: handles numeric arrays, especially landmark coordinates.
- `pandas`: stores and reads CSV datasets.
- `matplotlib`: plots training accuracy, loss, and sample visualizations.
- `scikit-learn`: splits data and calculates accuracy, precision, recall, F1 score, and confusion matrix.
- `flask`: creates the Python backend API.
- `flask-cors`: allows the React frontend to safely call the Flask backend during development.
- `SpeechRecognition`: converts microphone speech into text.
- `pyttsx3`: converts text into offline speech.
- `gTTS`: converts text into speech using Google Text-to-Speech.
- `twilio`: sends emergency SMS messages.
- `geopy`: helps work with location data.
- `python-dotenv`: loads secret values from a local `.env` file.
- `requests`: sends HTTP requests, useful for APIs and location services.

## 5. Expected Output

When setup works, these commands should succeed:

```powershell
python --version
pip --version
pip list
```

You should see Python, pip, and the installed packages.

## 6. Common Errors

### `python is not recognized`

Python is not installed or not added to PATH.

Fix:

1. Install Python 3.10 or 3.11 from https://www.python.org/downloads/
2. During installation, tick `Add python.exe to PATH`.
3. Close and reopen PowerShell.
4. Run `python --version` again.

### `running scripts is disabled`

PowerShell is blocking virtual environment activation.

Fix:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### TensorFlow installation fails

TensorFlow support depends on Python version.

Fix:

Use Python 3.10 or 3.11 for this project.

## 7. Screenshots Expected

Take screenshots of:

- The `SignLanguageAI` folder structure.
- PowerShell after `python --version`.
- PowerShell after virtual environment activation.
- PowerShell after `pip install -r requirements.txt`.

