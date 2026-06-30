# Emergency SMS and Message Sharing

## Environment Variables

Create `backend/.env` from `backend/.env.example`.

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sign_interpreter
JWT_SECRET=change_me

FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
ANDROID_SMS_FCM_TOKEN=your_android_companion_fcm_registration_token
ANDROID_SMS_CALLBACK_BASE_URL=https://your-public-backend.example.com
ANDROID_SMS_CALLBACK_TOKEN=replace_with_a_long_random_secret
ANDROID_SMS_CALLBACK_TIMEOUT_MS=30000
REGISTERED_MOBILE_NUMBER=+919876543210
```

`REGISTERED_MOBILE_NUMBER` is always included in SMS recipients. If it is empty, the backend falls back to the authenticated user's `mobileNumber`.

`ANDROID_SMS_CALLBACK_BASE_URL` must be reachable from the Android phone, because the phone reports SMS results to `/api/android-sms/callback`.

## SMS Provider

SMS is sent by the Android companion app in `android-sms-companion` using Android `SmsManager`.

The backend sends a Firebase Cloud Messaging data message to the companion app. The app sends the SMS from the phone's SIM card and calls back with the result.

## MongoDB Schema

Emergency contacts are stored in `EmergencyContact`:

```js
{
  userId: ObjectId,
  name: String,
  phone: String,
  mobileNumber: String,
  relationship: String,
  isPrimary: Boolean,
  isActive: Boolean,
  createdAt: Date
}
```

There is a unique index on `{ userId, phone }` to prevent duplicate contacts per user.

## Phone Number Rules

All destination numbers must use E.164 format:

```text
+<country code><number>
```

Example:

```text
+919876543210
```

## APIs

All endpoints below require:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

### GET /api/emergency/contacts

Returns all emergency contacts for the logged-in user.

### POST /api/emergency/contacts

```json
{
  "name": "Parent",
  "phone": "+919876543210",
  "relationship": "Father",
  "isActive": true
}
```

### PUT /api/emergency/contacts/:id

Updates any contact fields:

```json
{
  "name": "Parent",
  "phone": "+919876543210",
  "relationship": "Father",
  "isActive": false
}
```

### DELETE /api/emergency/contacts/:id

Deletes one contact.

### POST /api/emergency/send-sos

Sends an emergency SMS to `REGISTERED_MOBILE_NUMBER` plus selected active contacts.

```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "contactIds": ["CONTACT_OBJECT_ID"]
}
```

SMS body:

```text
EMERGENCY ALERT

The user requires immediate assistance.

Current Location:
https://maps.google.com/?q=<latitude>,<longitude>

Time: <current date and time>

Please respond immediately.
```

### POST /api/messages/send

Sends recognized speech/sign text with GPS location.

```json
{
  "text": "I need help.",
  "messageType": "sign",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "contactIds": ["CONTACT_OBJECT_ID"]
}
```

### POST /api/android-sms/callback

Used by the Android companion app only.

```http
Authorization: Bearer <ANDROID_SMS_CALLBACK_TOKEN>
Content-Type: application/json
```

```json
{
  "requestId": "uuid",
  "phoneStatus": "ready",
  "smsStatus": [
    {
      "contactName": "Parent",
      "phone": "+919876543210",
      "status": "sent"
    }
  ]
}
```

## Frontend Flow

1. Add contacts in the Emergency Contacts panel.
2. Select one or more active contacts.
3. Use `Send Message` from Speech-to-Text or Sign-to-Text output.
4. Allow browser GPS permission.
5. Confirm selected contacts in the dialog.
6. Use `Emergency SOS Alert` for emergency SMS.

The browser handles GPS with the Geolocation API. If GPS permission is denied, no live SMS is sent and the UI shows an error.

## Testing

1. Start MongoDB.
2. Configure and install the Android companion app.
3. Expose the backend to the Android phone if running locally.
4. Start backend:

```bash
cd backend
npm install
npm run dev
```

5. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

6. Log in or register, add emergency contacts, and press the existing SOS button.
7. Run build verification:

```bash
cd frontend
npm run build
```

## Error Handling

The implementation handles invalid phone numbers, duplicate contacts, GPS permission denial, invalid coordinates, missing recipients, Android permission denial, no SIM card, airplane mode, no service, SMS send timeout, and SMS send failure.
