# Backend .env File Setup

Your current `.env` file is missing some critical variables for authentication. Please add the following to your `backend/.env` file:

## Required Variables to Add:

```env
# JWT Configuration (REQUIRED for authentication)
ACCESS_TOKEN_SECRET=your_secure_random_string_here_min_32_characters
REFRESH_TOKEN_SECRET=your_secure_random_string_here_min_32_characters
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d

# Node Environment
NODE_ENV=development
```

## Complete .env File Should Look Like:

```env
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb+srv://Hellfire_scholar:Hellfire1234@cluster0.orlphdf.mongodb.net

# JWT Configuration
ACCESS_TOKEN_SECRET=your_secure_random_string_here_min_32_characters
REFRESH_TOKEN_SECRET=your_secure_random_string_here_min_32_characters
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
```

## How to Generate Secure Random Strings:

You can generate secure random strings using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this command twice to get two different strings for ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET.

## Important Notes:

1. **CORS_ORIGIN**:** Changed from `*` to `http://localhost:5173` for security (matches your frontend URL)
2. **JWT Secrets**: These MUST be set for authentication to work
3. **After updating .env**: Restart your backend server

## Current Status:

✅ Server is running on port 8000
✅ MongoDB connection configured
⚠️ JWT secrets missing (authentication will fail without these)

