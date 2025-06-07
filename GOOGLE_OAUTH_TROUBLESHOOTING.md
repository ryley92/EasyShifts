# Google OAuth Troubleshooting Guide for EasyShifts

## 🚨 Common Issues and Solutions

### Issue 1: "The given origin is not allowed for the given client ID"

**Error Message:**
```
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

**Solution:**
You need to add your development URL to the authorized origins in Google Cloud Console.

#### Steps to Fix:
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to APIs & Services** → **Credentials**
3. **Find your OAuth 2.0 Client ID** (794306818447-4prnpg1p13a4smvnnfs7tfvkesrld9ms.apps.googleusercontent.com)
4. **Click Edit** (pencil icon)
5. **Add Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - `https://localhost:3000` (if using HTTPS)
6. **Add Authorized redirect URIs**:
   - `http://localhost:3000`
   - `http://localhost:3000/signup`
   - `http://localhost:3000/login`
7. **Click Save**

### Issue 2: "Cross-Origin-Opener-Policy policy would block the window.postMessage call"

**Error Message:**
```
Cross-Origin-Opener-Policy policy would block the window.postMessage call.
```

**Solution:**
This is usually caused by browser security policies. Try these fixes:

#### Option A: Use a different browser or incognito mode
- Try Chrome incognito mode
- Try Firefox or Safari
- Disable browser extensions temporarily

#### Option B: Update your development server
If using Create React App, make sure you're running the latest version:
```bash
cd app
npm update react-scripts
npm start
```

### Issue 3: "Provided button width is invalid: 100%"

**Error Message:**
```
[GSI_LOGGER]: Provided button width is invalid: 100%
```

**Solution:**
✅ **Already Fixed!** The button width has been changed from "100%" to a fixed width of 400px.

### Issue 4: Authentication Request Timeout

**Error Message:**
```
Google sign-up error: Authentication request timed out
```

**Causes & Solutions:**

#### Cause A: Backend not running
```bash
# Start the backend server
cd Backend
python Server.py
```

#### Cause B: WebSocket connection issues
Check that the backend is running on `localhost:8080` and WebSocket connections are working.

#### Cause C: Google OAuth popup blocked
- Allow popups for localhost:3000
- Check browser popup blocker settings

### Issue 5: "Failed to load resource: the server responded with a status of 403"

**Solution:**
This is related to Issue 1. Follow the steps to add authorized origins in Google Cloud Console.

## 🔧 Complete Setup Checklist

### ✅ Google Cloud Console Setup
1. **Project Created**: Ensure you have a Google Cloud project
2. **OAuth Consent Screen**: Configure the OAuth consent screen
3. **Credentials Created**: OAuth 2.0 Client ID created
4. **Authorized Origins Added**:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
5. **Authorized Redirect URIs Added**:
   - `http://localhost:3000`
   - `http://localhost:3000/signup`
   - `http://localhost:3000/login`

### ✅ Environment Configuration
1. **Frontend .env** (`app/.env`):
   ```
   REACT_APP_GOOGLE_CLIENT_ID=794306818447-4prnpg1p13a4smvnnfs7tfvkesrld9ms.apps.googleusercontent.com
   ```

2. **Backend .env** (`Backend/.env`):
   ```
   GOOGLE_CLIENT_ID=794306818447-4prnpg1p13a4smvnnfs7tfvkesrld9ms.apps.googleusercontent.com
   ```

### ✅ Application Setup
1. **Dependencies Installed**:
   ```bash
   cd app
   npm install @react-oauth/google
   
   cd ../Backend
   pip install google-auth google-auth-oauthlib google-auth-httplib2 python-dotenv
   ```

2. **Servers Running**:
   ```bash
   # Terminal 1: Backend
   cd Backend
   python Server.py
   
   # Terminal 2: Frontend
   cd app
   npm start
   ```

## 🧪 Testing Steps

### 1. Basic Connectivity Test
1. Open browser to `http://localhost:3000`
2. Check browser console for errors
3. Verify WebSocket connection to backend

### 2. Google OAuth Button Test
1. Navigate to `/signup`
2. Look for Google signup button
3. Check for any console errors

### 3. Google Authentication Test
1. Click "Sign up with Google" button
2. Google popup should appear
3. Complete authentication
4. Should return to EasyShifts

## 🔍 Debug Information

### Browser Console Commands
```javascript
// Check if Google Client ID is loaded
console.log('Google Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);

// Check WebSocket connection
console.log('WebSocket ready state:', window.websocket?.readyState);

// Check Google OAuth provider
console.log('Google OAuth configured:', window.google?.accounts?.id);
```

### Backend Debug
```bash
# Check if Google Client ID is loaded in backend
cd Backend
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('Backend Google Client ID:', os.getenv('GOOGLE_CLIENT_ID'))"
```

## 🆘 Still Having Issues?

### Quick Fixes to Try:
1. **Clear browser cache and cookies**
2. **Restart both frontend and backend servers**
3. **Try a different browser**
4. **Check firewall/antivirus settings**
5. **Verify internet connection**

### Advanced Debugging:
1. **Check Network tab** in browser dev tools for failed requests
2. **Check Application tab** for localStorage/sessionStorage issues
3. **Verify CORS settings** if using a custom server setup

### Contact Information:
If you continue to have issues, the most common cause is the Google Cloud Console configuration. Double-check that:
- The Client ID matches exactly
- All localhost origins are added
- The OAuth consent screen is properly configured

## 📝 Notes

- **Development vs Production**: Remember to add your production domain to Google Cloud Console when deploying
- **HTTPS Requirements**: Production deployments will require HTTPS for Google OAuth
- **Rate Limits**: Google OAuth has rate limits, but they're generous for development

---

**Most issues are resolved by properly configuring the authorized origins in Google Cloud Console!** 🎯
