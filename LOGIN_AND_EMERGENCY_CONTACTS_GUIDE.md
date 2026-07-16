# Login & Emergency Contacts Setup Guide

## System Overview

Your application has been configured with:
- ✅ **MongoDB Atlas** - Cloud database for storing users and emergency contacts
- ✅ **JWT Authentication** - Secure token-based login
- ✅ **Emergency Contacts API** - Backend endpoints to save/manage contacts
- ✅ **Frontend Integration** - React UI to add and manage contacts

---

## Prerequisites

### 1. Backend Server Running
Start the backend server:

```bash
cd backend
npm install
npm start
```

You should see:
```
Server running on port 5000
MongoDB Connected: cluster0.dy1cheo.mongodb.net
```

### 2. Frontend Server Running
In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
VITE v4.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## Step 1: Create an Account or Register

### Option A: Register New User
1. Navigate to: `http://localhost:5173/register`
2. Fill in the registration form:
   - **Username**: Choose a unique username
   - **Email**: Your email address
   - **Password**: Strong password (min 6 characters)
   - **Mobile Number**: Your phone number (e.g., +919876543210)
3. Click **Register**
4. You'll be automatically logged in and redirected to dashboard

### Option B: Use Existing Credentials

If you already have an account, you can log in directly.

---

## Step 2: Login to Application

### Login Process
1. Navigate to: `http://localhost:5173/login`
2. Enter your credentials:
   - **Email**: Your registered email
   - **Password**: Your password
3. Click **Login**
4. You'll be redirected to the **Dashboard**

### What Happens During Login
```
POST /api/auth/login
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "user@example.com",
    "mobileNumber": "+919876543210"
  }
}
```

The token is stored in `localStorage` and used for all subsequent requests.

---

## Step 3: Access Emergency Contacts

### Navigate to Emergency Contacts Page
1. From Dashboard, click **Emergency SOS & Contacts** in the navigation
2. Or go to: `http://localhost:5173/emergency-contacts`

### You should see:
- Emergency SOS & Contacts header
- Features: GPS Tracking, SMS Alerts, Location Sharing
- **Emergency Contacts Panel** with:
  - List of existing contacts
  - Form to add new contacts
  - Edit/Delete options

---

## Step 4: Add Emergency Contacts

### Add New Contact Form

Fill in the following fields:

1. **Contact Name**
   - Example: "Mom", "Brother", "Doctor"

2. **Phone Number**
   - Format: E.164 format (international)
   - Examples:
     - India: `+919876543210`
     - USA: `+12025551234`
     - UK: `+442071963000`

3. **Relationship**
   - Example: "Mother", "Brother", "Friend", "Doctor"

4. **Active Status**
   - Toggle ON/OFF to enable/disable contact for SOS alerts

### Save Contact
1. Fill all fields
2. Click **Add Contact** button
3. Contact is saved to MongoDB

---

## Step 5: MongoDB Storage

### Where Your Data Is Stored

Your emergency contacts are stored in MongoDB Atlas:

**Database**: `sign_language`
**Collection**: `emergencycontacts`

### Document Structure
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439010",
  "name": "Mom",
  "phone": "+919876543210",
  "mobileNumber": "+919876543210",
  "relationship": "Mother",
  "isPrimary": true,
  "isActive": true,
  "createdAt": "2026-01-15T10:30:00.000Z"
}
```

### View Your Data (MongoDB Atlas)
1. Go to: https://cloud.mongodb.com
2. Login with your credentials
3. Select **Cluster0**
4. Click **Browse Collections**
5. Navigate to: `sign_language` → `emergencycontacts`
6. You'll see all your saved contacts

---

## API Endpoints Reference

### Authentication
```
POST   /api/auth/register     - Create new account
POST   /api/auth/login        - Login user
GET    /api/auth/me           - Get current user (requires token)
PUT    /api/auth/profile      - Update profile
```

### Emergency Contacts
```
GET    /api/emergency/contacts        - Get all contacts (requires token)
POST   /api/emergency/contacts        - Add new contact (requires token)
PUT    /api/emergency/contacts/:id    - Update contact (requires token)
DELETE /api/emergency/contacts/:id    - Delete contact (requires token)
```

### Required Header for All Requests
```
Authorization: Bearer <your_jwt_token>
```

---

## Common Issues & Solutions

### Issue 1: "Could not load emergency contacts"
**Solution**: 
- Ensure backend is running (`npm start` in backend folder)
- Check that token is valid in localStorage
- Clear browser cache and login again

### Issue 2: "Mobile number must be in E.164 format"
**Solution**: 
- Phone format must be international (with + and country code)
- Examples: `+919876543210`, `+12025551234`
- Don't use spaces, dashes, or parentheses

### Issue 3: "Contact already exists"
**Solution**: 
- You already saved a contact with this phone number
- Edit existing contact or use different number

### Issue 4: "Log in to save emergency contacts"
**Solution**: 
- Not logged in or token expired
- Go to Login page and login again

### Issue 5: MongoDB Connection Error
**Solution**: 
```bash
# Check MongoDB URI in .env
MONGODB_URI=mongodb+srv://rithik:rithik2111@cluster0.dy1cheo.mongodb.net/sign_language?retryWrites=true&w=majority&appName=Cluster0

# Verify connection (run in backend):
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.log('❌ Error:', e.message));"
```

---

## Testing the Full Flow

### Manual Testing Checklist
- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Can register new user
- [ ] Login redirects to dashboard
- [ ] Token appears in localStorage
- [ ] Can navigate to Emergency Contacts page
- [ ] Can add emergency contact
- [ ] Contact appears in list
- [ ] Can edit contact
- [ ] Can delete contact
- [ ] Can see contacts in MongoDB Atlas

### API Testing with curl

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "mobileNumber": "+919876543210"
  }'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'

# 3. Add Emergency Contact (replace TOKEN)
curl -X POST http://localhost:5000/api/emergency/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Mom",
    "phone": "+919876543210",
    "relationship": "Mother",
    "isActive": true
  }'

# 4. Get All Contacts (replace TOKEN)
curl -X GET http://localhost:5000/api/emergency/contacts \
  -H "Authorization: Bearer TOKEN"
```

---

## Features Available After Login

### Dashboard
- View user profile
- Access all modules
- See activity logs

### Emergency SOS
- Trigger emergency alert
- Send location to contacts
- SMS notifications via Twilio

### Sign Language Recognition
- Real-time sign detection
- Webcam input
- Text-to-speech output

### Emergency Contacts Management
- Add multiple contacts
- Mark primary contact
- Toggle active status
- Edit contact details
- Delete contacts

### Profile Settings
- Update username/email
- Change mobile number
- Manage preferences

---

## Security Notes

⚠️ **Important**:
- Never share your JWT token
- JWT expires in 30 days (auto-refresh on login)
- Passwords are hashed with bcrypt
- All API calls require authentication
- Use HTTPS in production
- Change JWT_SECRET in production

---

## Next Steps

1. **Test the flow**: Register → Login → Add Contacts
2. **Test SOS**: Trigger emergency alert
3. **Verify MongoDB**: Check Atlas for saved data
4. **Deploy**: When ready, deploy to production
5. **Add features**: SMS notifications, location tracking, etc.

---

## Contact Database Structure

When you save emergency contacts, they're stored in this structure:

```javascript
EmergencyContact {
  _id: ObjectId,              // Unique ID
  userId: ObjectId,           // Links to User
  name: String,              // Contact name
  phone: String,             // Phone number (E.164)
  mobileNumber: String,      // Same as phone
  relationship: String,      // Relationship type
  isPrimary: Boolean,        // Primary contact for SOS
  isActive: Boolean,         // Enabled/disabled
  createdAt: Date            // Creation timestamp
}
```

---

## Support & Debugging

### Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for error messages
4. Check **Network** tab for API responses

### Check Backend Logs
Monitor backend terminal for:
```
POST /api/auth/login
POST /api/emergency/contacts
```

### MongoDB Query to Verify Contacts
```javascript
db.emergencycontacts.find({ userId: ObjectId("...") }).pretty()
```

---

**You're all set! Start by registering and logging in to save your emergency contacts.** 🎯
