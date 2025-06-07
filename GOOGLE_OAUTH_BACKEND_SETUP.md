# Google OAuth Backend Implementation Guide

## 🚨 Current Issue
**Error:** "Unknown request ID: 66" when using Google Sign-In

**Cause:** The backend doesn't have handlers for Google OAuth requests (IDs 66, 67, 68)

## 🛠️ Backend Implementation Required

### 📋 Step 1: Install Dependencies

#### For Node.js Backend:
```bash
npm install google-auth-library
```

#### For Python Backend:
```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

### 📋 Step 2: Environment Configuration

Add to your backend environment variables:
```bash
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

### 📋 Step 3: Database Schema Updates

Run the SQL commands in `backend-examples/database-schema.sql` to add Google OAuth support to your database.

**Key additions:**
- `google_id` column to users table
- `google_email`, `google_name`, `google_picture_url` columns
- Indexes for performance
- Optional audit logging table

### 📋 Step 4: WebSocket Request Handlers

Add these new request ID handlers to your WebSocket message processor:

#### Request ID 66: GOOGLE_AUTH_LOGIN
**Purpose:** Verify Google token and check if user exists
**Input:**
```json
{
  "request_id": 66,
  "data": {
    "credential": "google_jwt_token",
    "clientId": "google_client_id"
  }
}
```

**Output (User Exists):**
```json
{
  "request_id": 66,
  "success": true,
  "data": {
    "user_exists": true,
    "username": "john_doe",
    "is_manager": false,
    "email": "john@example.com"
  }
}
```

**Output (User Doesn't Exist):**
```json
{
  "request_id": 66,
  "success": true,
  "data": {
    "user_exists": false,
    "google_user_info": {
      "name": "John Doe",
      "email": "john@example.com",
      "picture": "https://...",
      "sub": "google_user_id"
    }
  }
}
```

#### Request ID 67: LINK_GOOGLE_ACCOUNT
**Purpose:** Link Google account to existing EasyShifts account
**Input:**
```json
{
  "request_id": 67,
  "data": {
    "username": "existing_username",
    "password": "user_password",
    "googleData": {
      "name": "John Doe",
      "email": "john@example.com",
      "sub": "google_user_id"
    }
  }
}
```

**Output:**
```json
{
  "request_id": 67,
  "success": true,
  "data": {
    "username": "existing_username",
    "is_manager": false,
    "google_linked": true
  }
}
```

#### Request ID 68: CREATE_ACCOUNT_WITH_GOOGLE
**Purpose:** Create new EasyShifts account with Google information
**Input:**
```json
{
  "request_id": 68,
  "data": {
    "username": "new_username",
    "googleData": {
      "name": "John Doe",
      "email": "john@example.com",
      "sub": "google_user_id"
    },
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Output:**
```json
{
  "request_id": 68,
  "success": true,
  "data": {
    "username": "new_username",
    "is_manager": false,
    "google_linked": true
  }
}
```

### 📋 Step 5: Implementation Examples

#### Node.js Implementation:
See `backend-examples/nodejs-google-auth.js` for complete implementation

#### Python Implementation:
See `backend-examples/python-google-auth.py` for complete implementation

### 📋 Step 6: Security Considerations

1. **Token Verification:** Always verify Google tokens server-side
2. **Rate Limiting:** Implement rate limiting for OAuth requests
3. **Audit Logging:** Log all authentication attempts
4. **Email Verification:** Ensure Google email is verified
5. **Account Conflicts:** Handle cases where Google email matches existing user

### 📋 Step 7: Testing

1. **Test Token Verification:** Ensure Google tokens are properly validated
2. **Test User Flows:** Test all three scenarios (existing user, link account, create account)
3. **Test Error Handling:** Ensure proper error responses
4. **Test Security:** Verify no unauthorized access

### 🔧 Quick Fix for Development

If you need to disable Google OAuth temporarily while implementing backend support:

1. **Option 1:** Set `REACT_APP_GOOGLE_CLIENT_ID=disabled` in `.env`
2. **Option 2:** Comment out Google Sign-In components in Login/SignUp pages

### 📞 Support

The frontend is already fully implemented and will work immediately once the backend handlers are added. The error messages will guide users appropriately until backend support is complete.

### ✅ Verification Checklist

- [ ] Google Auth library installed
- [ ] Environment variables configured
- [ ] Database schema updated
- [ ] Request ID 66 handler implemented
- [ ] Request ID 67 handler implemented  
- [ ] Request ID 68 handler implemented
- [ ] Token verification working
- [ ] Database operations working
- [ ] Error handling implemented
- [ ] Security measures in place
- [ ] Testing completed

Once these steps are completed, Google OAuth will work seamlessly with the existing frontend implementation!
