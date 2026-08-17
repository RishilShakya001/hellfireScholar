# 🔥 Hellfire Scholar

**Hellfire Scholar** is a full-stack academic management platform that helps students manage their **subjects, syllabus, attendance, assignments, study plans, notes, and academic analytics** from a single dashboard.

## ✨ Features

* 🔐 JWT Authentication with Access & Refresh Tokens
* 📊 Academic Dashboard & Analytics
* 📚 Subject & Syllabus Management
* 🕐 Attendance Tracking
* 📝 Assignment Management
* 📅 Study Plan Management
* 📒 Notes & Resource Management
* ☁️ Cloudinary File Uploads
* 🛡️ Protected Routes & Token Refresh

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Axios
**Backend:** Node.js, Express.js, Mongoose
**Database:** MongoDB
**Authentication:** JWT
**Storage:** Cloudinary, Multer

## 📁 Structure

```text
HellfireScholar/
├── backend/              # Express REST API
│   └── src/
├── frontend/
│   └── hellfire/         # React + Vite application
├── SETUP.md
├── QUICK_START.md
└── README.md
```

## 🚀 Setup

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=8000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
```

Start the server:

```bash
npm run dev
```

### Frontend

```bash
cd frontend/hellfire
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Start the frontend:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

## 🔌 API Modules

```text
/api/v1/users
/api/v1/subject
/api/v1/syllabus
/api/v1/attendance
/api/v1/assignment
/api/v1/studyplan
/api/v1/analytics
/api/v1/note
/api/v1/ai
```

## 🤖 AI Study Assistant - RAG Architecture

Hellfire Scholar contains a production-quality, fully secure **Retrieval-Augmented Generation (RAG)** pipeline that lets students chat with their uploaded course materials (PDF or text notes).

### 🛠️ Key Details
- **Ingestion Pipeline**: Upload Note ➔ Cloudinary ➔ PDF Text Extraction (`pdf-parse`) ➔ Space-Aware Chunking ➔ Embedding Generation (OpenAI) ➔ MongoDB Atlas Vector Storage.
- **Pre-Filtered Retrieval**: Vector search is pre-filtered by the authenticated user's `userId` and current `subjectId` (ensuring absolute data isolation).
- **Hybrid Retrieval Strategy**: Automatically falls back to **In-Memory Cosine Similarity** matching if no MongoDB Atlas Vector Search index is configured, guaranteeing full functionality in local development out-of-the-box.
- **Citations**: Returns exact document names and page numbers used to generate answers.

*For setup instructions, vector index definitions, and architecture details, refer to the [RAG Architecture Document](file:///d:/gitHubPull/HellfireScholar/RAG_ARCHITECTURE.md).*

## 🔐 Security

* JWT-based authentication
* Protected API routes
* Access & refresh token mechanism
* Environment-based secrets
* Configurable CORS

> ⚠️ Never commit `.env` files or expose your JWT/MongoDB credentials.

⭐ **If you find Hellfire Scholar useful, consider giving the repository a star!**
