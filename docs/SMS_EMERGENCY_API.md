# Emergency SMS and Message Sharing

## Environment Variables

Create `backend/.env` from `backend/.env.example`.

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sign_interpreter
JWT_SECRET=change_me

TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
REGISTERED_MOBILE_NUMBER=+919876543210
```

`REGISTERED_MOBILE_NUMBER` is always included in SMS recipients. If it is empty, the backend falls back to the authenticated user's `mobileNumber`.

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
2. Start backend:

```bash
cd backend
npm install
npm run dev
```

3. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

4. Log in or register, then add emergency contacts.
5. Test with Twilio test credentials first. If Twilio env vars are missing or mock-like, backend logs simulated sends instead of sending live SMS.
6. Run build verification:

```bash
cd frontend
npm run build
```

## Error Handling

The implementation handles invalid phone numbers, duplicate contacts, GPS permission denial, invalid coordinates, missing recipients, and per-recipient Twilio failures.
