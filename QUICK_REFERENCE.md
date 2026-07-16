# Quick Reference: Login & Emergency Contacts

## 🚀 Quick Start (30 seconds)

```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

Then open: **http://localhost:5173/login**

---

## 📝 Test Credentials

**Registration Form:**
- Email: `test@example.com`
- Password: `password123`
- Mobile: `+919876543210`

---

## ✅ Login Flow

1. Go to http://localhost:5173/login
2. Enter email & password
3. Click **Login**
4. Redirected to Dashboard ✓

**What happens internally:**
- POST request to `/api/auth/login`
- JWT token received and stored in localStorage
- User data saved for session

---

## 🚨 Emergency Contacts

**Navigate to:**
- Dashboard → Emergency SOS & Contacts
- Or: http://localhost:5173/emergency-contacts

**Add Contact:**
1. Fill: Name, Phone, Relationship
2. Phone format: `+919876543210` (E.164)
3. Click **Add Contact**
4. ✓ Saved to MongoDB

**Data stored in:**
- Database: `sign_language`
- Collection: `emergencycontacts`
- MongoDB Atlas: https://cloud.mongodb.com

---

## 🔧 Phone Number Format (IMPORTANT)

✅ Correct:
- `+919876543210` (India)
- `+12025551234` (USA)
- `+442071963000` (UK)

❌ Incorrect:
- `9876543210` (missing +)
- `+91 9876543210` (spaces)
- `+91-9876543210` (dashes)

---

## 📊 API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
```

### Emergency Contacts
```
GET    /api/emergency/contacts
POST   /api/emergency/contacts
PUT    /api/emergency/contacts/:id
DELETE /api/emergency/contacts/:id
```

**All require:** `Authorization: Bearer <token>`

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Could not load contacts" | Restart backend + clear localStorage |
| "Invalid phone format" | Use E.164 format: `+919876543210` |
| "Contact already exists" | Use different phone number |
| "Failed to connect" | Check backend is running on :5000 |
| "Unauthorized" | Login again, token may have expired |

---

## 💾 MongoDB Atlas

**View your saved contacts:**
1. https://cloud.mongodb.com
2. Select Cluster0
3. Browse Collections
4. sign_language → emergencycontacts

**Sample contact document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439010",
  "name": "Mom",
  "phone": "+919876543210",
  "relationship": "Mother",
  "isPrimary": true,
  "isActive": true,
  "createdAt": "2026-01-15T10:30:00.000Z"
}
```

---

## 🎯 Full Test Checklist

- [ ] Backend running on :5000
- [ ] Frontend running on :5173
- [ ] Register new user
- [ ] Login with credentials
- [ ] Token in localStorage
- [ ] Navigate to Emergency Contacts
- [ ] Add emergency contact
- [ ] See contact in list
- [ ] Edit contact details
- [ ] Delete contact
- [ ] Verify in MongoDB Atlas

---

## 📱 Features After Login

✓ User Dashboard
✓ Emergency SOS Alerts  
✓ Save Emergency Contacts
✓ Sign Language Recognition
✓ Profile Management
✓ Activity Logs
✓ Location Tracking (if enabled)
✓ SMS Notifications (via Twilio)

---

**Ready to go! Login and save your emergency contacts.** 🎯
