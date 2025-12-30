# Hellfire Scholar - Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas connection string)
- npm or yarn

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=8001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_access_token_secret_key_here_change_in_production
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here_change_in_production
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
```

**Important:** Replace the JWT secrets with secure random strings in production.

4. Start MongoDB (if running locally):
```bash
# On Windows (if MongoDB is installed as a service, it should start automatically)
# Or use MongoDB Atlas and update MONGODB_URI

# On macOS/Linux:
mongod
```

5. Start the backend server:
```bash
npm run dev
# or
npm start
```

The backend will run on `http://localhost:8001`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend/hellfire
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `frontend/hellfire` directory:
```env
VITE_API_URL=http://localhost:8001/api/v1
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Features Connected

✅ User Authentication (Login/Register)
✅ Protected Routes
✅ Dashboard with real-time data
✅ API Integration
✅ Token-based authentication
✅ CORS configured

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/users/logout` - Logout user
- `GET /api/v1/users/dashboard` - Get dashboard data (protected)
- `GET /api/v1/users/current-user` - Get current user (protected)

### Other endpoints available:
- `/api/v1/subject` - Subject management
- `/api/v1/syllabus` - Syllabus management
- `/api/v1/attendance` - Attendance tracking
- `/api/v1/assignment` - Assignment management
- `/api/v1/studyplan` - Study plan management
- `/api/v1/analytics` - Analytics data
- `/api/v1/note` - Notes management

## Troubleshooting

### Backend Issues
- Ensure MongoDB is running
- Check that the `.env` file exists and has correct values
- Verify the port 8001 is not in use

### Frontend Issues
- Ensure the backend is running
- Check that `.env` file has the correct API URL
- Clear browser cache and localStorage if authentication issues occur

### CORS Issues
- Ensure `CORS_ORIGIN` in backend `.env` matches your frontend URL
- Default is `http://localhost:5173` for Vite

## Next Steps

1. Test the login/register functionality
2. Explore the dashboard
3. Add more features by connecting other pages to backend APIs
4. Customize the UI as needed

