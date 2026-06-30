# Multi-Lingual Sign Language Interpreter & Emergency SOS System

A complete full-stack AI platform built for real-time sign language translation (Indian Sign Language and American Sign Language), multi-lingual voice conversion, and automated GPS-based emergency broadcast messaging. Suitable for B.Tech final-year projects, IEEE paper implementations, and research publications.

---

## Features

1. **Real-Time Webcam Interpreter**: Extracts 21 hand landmarks in the browser via MediaPipe Hands, performing real-time inference using a client-side **TensorFlow.js CNN-LSTM model** alongside a robust **Geometrical Heuristics Engine** fallback.
2. **Reverse Voice Translation**: Capture a hearing person's spoken words using browser Speech-to-Text transcription, feeding into the chat logs so deaf/mute individuals can read in real-time.
3. **Multi-Lingual Text-to-Speech**: Synthesizes and reads out compiled messages using custom language models in **English, Tamil, and Hindi**.
4. **Emergency SOS Broadcaster**: Prominent red SOS alert triggers browser GPS Geolocation, compiles coordinates into a Google Maps link, and dispatches SMS alerts to guardians using Twilio.
5. **Message Sharing by SMS**: Speech-to-text and sign-to-text outputs include a Send Message action that sends recognized text plus current GPS location to your registered phone and selected active contacts.
6. **Admin Monitoring Desk**: Aggregate usage metrics, system-wide transaction logs, user registries, and emergency alert statistics.

---

## Technical Stack

- **Frontend**: React (Vite) + Tailwind CSS (v4) + Material UI (v9) + Axios + MediaPipe Hands + TensorFlow.js.
- **Backend**: Node.js + Express.js + JSON Web Tokens + Twilio SMS SDK.
- **Database**: MongoDB (Mongoose schemas).
- **AI Pipeline**: Python + MediaPipe + Keras (TensorFlow) CNN-LSTM network + Scikit-Learn evaluation + TensorFlow.js converter.

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running locally on port 27017)
- [Python](https://www.python.org/) (v3.9 - v3.11 recommended for MediaPipe/TF compatibility)

### 1. Database & Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables. Duplicate the `.env.example` file and name it `.env`:
   ```bash
   cp .env.example .env
   ```
   Modify the fields with your actual database and Twilio configuration keys:
   - `PORT`: Server listening port (default `5000`)
   - `MONGODB_URI`: Database connection string
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (Required for SMS dispatch. Leave as mock strings to run in simulation mode).
   - `REGISTERED_MOBILE_NUMBER`: Your own mobile number in E.164 format. This number is always included in SOS and message-sharing SMS recipients.
4. Start the backend:
   - Dev mode: `npm run dev`
   - Production mode: `npm start`

> [!NOTE]
   > You can verify the database integration and seed default accounts immediately by running:
   > `node test.js`
   > This inserts:
   > - Admin account: `admin@gmail.com` | password: `admin123`
   > - User account: `user@gmail.com` | password: `user123`

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Open the browser at `http://localhost:5173`.
4. Build for production compilation:
   ```bash
   npm run build
   ```

### 3. AI Training Pipeline (Python)
To train the CNN-LSTM model on your hand gesture image database:
1. Navigate to the pipeline directory:
   ```bash
   cd ../ai_pipeline
   ```
2. Set up a virtual environment and install requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Extract landmarks from your image dataset (e.g., matching the folders under `/indian`):
   ```bash
   python extract_landmarks.py
   ```
   This processes the images and saves coordinate matrices under `data_processed/X_data.npy`.
4. Train the CNN-LSTM neural network and generate metrics:
   ```bash
   python train_lstm.py
   ```
   This generates `sign_lstm_model.keras`, creates confusion matrix plots, and prints validation accuracies (expected above 95% due to scale-invariant wrist normalization).
5. Convert the model to TensorFlow.js format and export to the React frontend:
   ```bash
   python convert_model.py
   ```
   The model files (`model.json` and binary weight files) will be placed inside `frontend/public/model/` to be dynamically loaded on dashboard boot.

---

## Application Usage Guide

1. **Sign in**: Register an account or log in using the seeded credentials.
2. **Start Camera**: Click "Start" on the Sign Interpreter widget. Allow browser camera permissions.
3. **Form Words**: Place your hand in front of the lens. Hold gestures. Once detected continuously, characters compile automatically inside the Text Compiler.
4. **Speak Aloud**: Choose Tamil, Hindi, or English and tap "Speak Aloud" to read compiled text.
5. **Speech Translation**: Tap "Listen" under the microphone section, speak a sentence, and send it to the chat logs.
6. **Trigger SOS**: Click the glowing red SOS button to broadcast GPS maps location link to contacts.
7. **Share recognized text**: Use "Send Message" in the sign compiler or speech transcriber, select contacts, allow GPS permission, and send the recognized text with a Google Maps link through Twilio.

Detailed SMS API documentation is available at [`docs/SMS_EMERGENCY_API.md`](docs/SMS_EMERGENCY_API.md).

---

## Deployment Instructions

### Production Database
Use a hosted MongoDB instance (like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)) and swap the local connection URI in `backend/.env`.

### Express API Server
Deploy the Node server using process control monitors like `pm2`:
```bash
npm install -g pm2
pm2 start server.js --name "sign-api"
```
You can host the backend on cloud servers like AWS EC2, Heroku, or Render.

### React Client
Deploy the built `dist/` directory resulting from `npm run build` using static hosts like Vercel, Netlify, or Amazon S3. Ensure the browser endpoints points to your deployed backend URL.
