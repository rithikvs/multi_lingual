# API Testing Guide - Login & Emergency Contacts

## 📌 Complete API Test Workflows

### Prerequisites
- Backend running on `http://localhost:5000`
- MongoDB Atlas connected
- Postman or curl (command line)

---

## Workflow 1: Register & Login

### Step 1: Register New User

**Endpoint:** `POST /api/auth/register`

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure123",
    "mobileNumber": "+919876543210",
    "role": "user"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "mobileNumber": "+919876543210"
  }
}
```

**Save the token for next requests!**

---

### Step 2: Login User

**Endpoint:** `POST /api/auth/login`

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secure123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "mobileNumber": "+919876543210"
  }
}
```

---

## Workflow 2: Manage Emergency Contacts

### Setup: Store Token as Variable

**For bash/Linux:**
```bash
TOKEN="your_jwt_token_here"
```

**For Windows PowerShell:**
```powershell
$TOKEN = "your_jwt_token_here"
```

---

### Step 1: Get All Emergency Contacts

**Endpoint:** `GET /api/emergency/contacts`

**Using curl:**
```bash
curl -X GET http://localhost:5000/api/emergency/contacts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "name": "Mom",
      "phone": "+919876543210",
      "mobileNumber": "+919876543210",
      "relationship": "Mother",
      "isPrimary": true,
      "isActive": true,
      "createdAt": "2026-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Step 2: Add Emergency Contact

**Endpoint:** `POST /api/emergency/contacts`

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/emergency/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Mom",
    "phone": "+919876543210",
    "relationship": "Mother",
    "isPrimary": true,
    "isActive": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "name": "Mom",
    "phone": "+919876543210",
    "mobileNumber": "+919876543210",
    "relationship": "Mother",
    "isPrimary": true,
    "isActive": true,
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
}
```

---

### Step 3: Add Multiple Contacts

**Contact 2: Brother**
```bash
curl -X POST http://localhost:5000/api/emergency/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Brother",
    "phone": "+919876543211",
    "relationship": "Brother",
    "isActive": true
  }'
```

**Contact 3: Doctor**
```bash
curl -X POST http://localhost:5000/api/emergency/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Dr. Smith",
    "phone": "+12025551234",
    "relationship": "Doctor",
    "isActive": true
  }'
```

---

### Step 4: Update Emergency Contact

**Endpoint:** `PUT /api/emergency/contacts/:id`

```bash
curl -X PUT http://localhost:5000/api/emergency/contacts/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Mom (Updated)",
    "relationship": "Mother",
    "isActive": true
  }'
```

---

### Step 5: Delete Emergency Contact

**Endpoint:** `DELETE /api/emergency/contacts/:id`

```bash
curl -X DELETE http://localhost:5000/api/emergency/contacts/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Contact deleted"
}
```

---

## Complete Bash Script - Full Workflow

Save as `test_api.sh` and run with `bash test_api.sh`:

```bash
#!/bin/bash

set -e

echo "=== Sign Language App - API Test Suite ==="
echo ""

BASE_URL="http://localhost:5000/api"

# Step 1: Register
echo "📝 Step 1: Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser_'$(date +%s)'",
    "email": "test_'$(date +%s)'@example.com",
    "password": "test12345",
    "mobileNumber": "+919876543210"
  }')

echo "$REGISTER_RESPONSE" | jq '.'
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')

echo "✅ Registered! Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Add Emergency Contact 1
echo "📞 Step 2: Adding Emergency Contact #1 (Mom)..."
CONTACT1=$(curl -s -X POST $BASE_URL/emergency/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Mom",
    "phone": "+919876543210",
    "relationship": "Mother",
    "isPrimary": true,
    "isActive": true
  }')

echo "$CONTACT1" | jq '.'
CONTACT1_ID=$(echo "$CONTACT1" | jq -r '.data._id')
echo "✅ Contact 1 Added: $CONTACT1_ID"
echo ""

# Step 3: Add Emergency Contact 2
echo "📞 Step 3: Adding Emergency Contact #2 (Brother)..."
CONTACT2=$(curl -s -X POST $BASE_URL/emergency/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Brother",
    "phone": "+919876543211",
    "relationship": "Brother",
    "isActive": true
  }')

echo "$CONTACT2" | jq '.'
CONTACT2_ID=$(echo "$CONTACT2" | jq -r '.data._id')
echo "✅ Contact 2 Added: $CONTACT2_ID"
echo ""

# Step 4: Get All Contacts
echo "📋 Step 4: Getting all contacts..."
GET_ALL=$(curl -s -X GET $BASE_URL/emergency/contacts \
  -H "Authorization: Bearer $TOKEN")

echo "$GET_ALL" | jq '.'
echo "✅ Retrieved all contacts"
echo ""

# Step 5: Update Contact
echo "✏️  Step 5: Updating Contact #1..."
UPDATE=$(curl -s -X PUT $BASE_URL/emergency/contacts/$CONTACT1_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Mom (Updated)",
    "relationship": "Mother"
  }')

echo "$UPDATE" | jq '.'
echo "✅ Contact updated"
echo ""

# Step 6: Delete Contact
echo "🗑️  Step 6: Deleting Contact #2..."
DELETE=$(curl -s -X DELETE $BASE_URL/emergency/contacts/$CONTACT2_ID \
  -H "Authorization: Bearer $TOKEN")

echo "$DELETE" | jq '.'
echo "✅ Contact deleted"
echo ""

# Step 7: Get Final List
echo "📋 Step 7: Final contact list..."
FINAL=$(curl -s -X GET $BASE_URL/emergency/contacts \
  -H "Authorization: Bearer $TOKEN")

echo "$FINAL" | jq '.'
FINAL_COUNT=$(echo "$FINAL" | jq '.count')
echo "✅ Final count: $FINAL_COUNT contacts"
echo ""

echo "=== ✅ All tests completed successfully! ==="
```

---

## Using Postman

### 1. Import Collection

Create a new Postman collection with these requests:

**Collection: Sign Language App**

#### Request 1: Register
```
POST http://localhost:5000/api/auth/register
Body (JSON):
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure123",
  "mobileNumber": "+919876543210"
}
```

#### Request 2: Login
```
POST http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "john@example.com",
  "password": "secure123"
}
```

#### Request 3: Add Contact
```
POST http://localhost:5000/api/emergency/contacts
Headers:
  Authorization: Bearer {{token}}
Body (JSON):
{
  "name": "Mom",
  "phone": "+919876543210",
  "relationship": "Mother",
  "isPrimary": true
}
```

#### Request 4: Get Contacts
```
GET http://localhost:5000/api/emergency/contacts
Headers:
  Authorization: Bearer {{token}}
```

#### Request 5: Update Contact
```
PUT http://localhost:5000/api/emergency/contacts/{{contactId}}
Headers:
  Authorization: Bearer {{token}}
Body (JSON):
{
  "name": "Mom (Updated)"
}
```

#### Request 6: Delete Contact
```
DELETE http://localhost:5000/api/emergency/contacts/{{contactId}}
Headers:
  Authorization: Bearer {{token}}
```

---

## Error Handling

### Common Error Responses

**400 - Bad Request (Invalid phone format)**
```json
{
  "success": false,
  "message": "Mobile number must be in E.164 format, for example +919876543210."
}
```

**401 - Unauthorized (Invalid credentials)**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**409 - Conflict (Duplicate contact)**
```json
{
  "success": false,
  "message": "A contact with this mobile number already exists."
}
```

**500 - Server Error**
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Testing Checklist

- [ ] Register new user successfully
- [ ] Login with registered credentials
- [ ] Receive valid JWT token
- [ ] Add first emergency contact
- [ ] Add multiple contacts with different countries
- [ ] Retrieve all contacts
- [ ] Update contact details
- [ ] Delete contact
- [ ] Verify MongoDB contains all data
- [ ] Test invalid phone format error
- [ ] Test duplicate contact error
- [ ] Test unauthorized access (no token)

---

## Performance Notes

- Token expires in 30 days
- Each contact requires valid E.164 phone format
- MongoDB queries are indexed on userId for fast retrieval
- Maximum recommended contacts per user: ~50

---

## Next Steps

1. Run the test scripts above
2. Verify data appears in MongoDB Atlas
3. Test through the web UI
4. Deploy to production with environment variables
5. Set up monitoring for API endpoints

