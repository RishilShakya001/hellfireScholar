# Quick Start Guide - Hellfire Scholar

## ✅ Current Status

### Backend Server
- ✅ **Running on port 8000**
- ✅ MongoDB connected (Atlas)
- ⚠️ **JWT secrets missing** - Authentication will fail until added

### Frontend Server  
- ✅ **Starting on port 5173**
- ✅ API configured to connect to backend on port 8000
- ✅ All dependencies installed

## ⚠️ IMPORTANT: Add JWT Secrets to Backend

Your backend `.env` file is missing JWT secrets. **Authentication will not work** until you add these.

### Quick Fix:

1. Open `backend/.env` file
2. Add these lines:

```env
ACCESS_TOKEN_SECRET=generate_a_random_32_character_string_here
REFRESH_TOKEN_SECRET=generate_another_random_32_character_string_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
NODE_ENV=development
```

3. **Generate secure random strings** by running this in PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
   Run it twice to get two different strings.

4. **Update CORS_ORIGIN** in `backend/.env`:
```env
CORS_ORIGIN=http://localhost:5173
```
   (Change from `*` to the frontend URL for security)

5. **Restart the backend server** after updating `.env`

## 🚀 Starting the Servers

### Backend (Terminal 1):
```powershell
cd backend
npm run dev
```

### Frontend (Terminal 2):
```powershell
cd frontend/hellfire
npm run dev
```

## 🔧 PowerShell Execution Policy Fix

If you get execution policy errors, run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
```

## 📝 Testing the Application

1. Open browser to `http://localhost:5173`
2. Click "Login / Signup"
3. Register a new account
4. Login with your credentials
5. View the dashboard

## 🐛 Troubleshooting

### Backend won't start:
- Check MongoDB connection string in `.env`
- Ensure JWT secrets are set
- Check if port 8000 is available

### Frontend won't connect:
- Verify backend is running on port 8000
- Check `frontend/hellfire/.env` has: `VITE_API_URL=http://localhost:8000/api/v1`
- Clear browser cache

### Authentication errors:
- **Most likely**: JWT secrets not set in backend `.env`
- Check browser console for errors
- Verify CORS_ORIGIN matches frontend URL

## 📚 Files Created/Modified

- ✅ `frontend/hellfire/src/config/api.js` - API configuration
- ✅ `frontend/hellfire/src/pages/Login.jsx` - Connected to backend
- ✅ `frontend/hellfire/src/components/Dashboard.jsx` - Fetches real data
- ✅ `frontend/hellfire/src/components/ProtectedRoute.jsx` - Auth protection
- ✅ `frontend/hellfire/.env` - Updated to port 8000
- ✅ Backend error handling improved

## Next Steps

1. ✅ Add JWT secrets to backend `.env` (CRITICAL)
2. ✅ Restart backend server
3. ✅ Test registration and login
4. ✅ Explore dashboard features

