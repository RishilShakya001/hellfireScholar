# 🔥 Hellfire Scholar

> **AI-Powered Academic Management & Study Assistant**

Hellfire Scholar is a full-stack academic management platform designed to help students manage their **subjects, syllabus, attendance, assignments, study plans, notes, and academic analytics** from a single dashboard.

It also includes an **AI Study Assistant powered by Retrieval-Augmented Generation (RAG)** that allows students to ask questions about their own uploaded study materials and receive context-aware answers with source references.

---

## 🚀 Features

### 📊 Academic Dashboard
- Unified academic overview
- Subject-wise progress
- Attendance statistics
- Upcoming assignments
- Syllabus completion
- Study-hour analytics
- Study streak tracking

### 📚 Subject & Syllabus Management
- Create and manage subjects
- Track syllabus units
- Mark units as completed
- Monitor overall syllabus progress

### 📝 Assignment Management
- Create assignments, quizzes and labs
- Set deadlines
- Track pending/completed/missed assignments
- View upcoming deadlines

### 🕐 Attendance Tracker
- Track attended and total classes
- Automatic attendance percentage calculation
- Configurable minimum attendance requirement
- Low-attendance warnings

### 📅 Study Planner
- Generate personalized study schedules
- Subject-based study slots
- Track study progress
- Manage daily study activities

### 📄 Notes & PDF Management
- Upload academic PDFs
- Add titles and tags
- Store files securely using Cloudinary
- Access uploaded study material from the dashboard

### 🤖 AI Study Assistant — RAG

The AI Study Assistant allows students to ask questions based on their uploaded academic documents.

Example questions:

- "Explain TCP congestion control from my notes."
- "Summarize Unit 3."
- "Generate 10 MCQs from this document."
- "What are the important topics in this chapter?"
- "Explain this concept in simple language."

The system uses:

```text
PDF
 ↓
Text Extraction
 ↓
Chunking
 ↓
Embeddings
 ↓
Vector Search
 ↓
Relevant Context
 ↓
LLM
 ↓
Grounded Answer
 ↓
Source References
