# AI Study Assistant - RAG Architecture

This document describes the technical architecture, security parameters, and implementation details of the **Retrieval-Augmented Generation (RAG)** pipeline inside **Hellfire Scholar**.

---

## 📖 Introduction to RAG
**Retrieval-Augmented Generation (RAG)** is an AI framework that optimizes LLM outputs by querying a custom authoritative knowledge base (like student study notes) before generating responses. It ensures that the AI answers are factual, contextually grounded, and cited, significantly reducing general LLM hallucinations.

---

## 🛠️ Architecture Workflow

### 1. Ingestion Pipeline
```text
PDF Upload / Text Note
        ↓
Save Note Meta in DB (Status: 'processing')
        ↓
[Asynchronous Service]
        ↓
Text Extraction (pdf-parse / page-by-page)
        ↓
Text Normalization (whitespace removal)
        ↓
Paragraph/Space-Aware Chunking (Size: 800, Overlap: 150)
        ↓
OpenAI Embeddings Generation (text-embedding-3-small)
        ↓
MongoDB Vector Storage (StudyNoteChunk Collection)
        ↓
Update Note Ingestion Status (Status: 'completed')
```

### 2. Retrieval & Generation Pipeline
```text
User Question
        ↓
JWT Authentication Validation
        ↓
Generate Query Embedding Vector
        ↓
Query Similarity Search (Atlas Vector Search / In-Memory Fallback)
        ↓
Pre-Filter by userId and subjectId (Data Isolation)
        ↓
Select Top-K (RAG_TOP_K=5) Chunks & Compute Similarity
        ↓
Compare best score with Relevance Threshold (RAG_RELEVANCE_THRESHOLD=0.65)
        ↓
          ├── [Score >= Threshold]: Build Context Prompts & generate Answer with citations
          └── [Score < Threshold]: Return Grounded Fallback ("I couldn't find enough information...")
```

---

## 🚀 Key Technical Features

### 1. PDF Text Extraction & Page Preservation
- Handled page-by-page using the pure JS `pdf-parse` library.
- Custom pager renderer preserves exact page numbers in chunk metadata for accurate source citation.

### 2. Configurable Paragraph-Aware Chunking
- **Overlap Importance**: A chunk overlap (default `150` characters) ensures semantic continuity. If a sentence or concept is split exactly at the character boundary, overlap ensures the semantic context is preserved in both adjacent chunks, avoiding fragmented embeddings.
- Configurable via `RAG_CHUNK_SIZE` and `RAG_CHUNK_OVERLAP` environment variables.

### 3. MongoDB Atlas Vector Search Pre-Filtering
When `VECTOR_INDEX_NAME` is configured, it executes high-speed vector queries using the `$vectorSearch` pipeline.
#### Vector Search Index Schema Definition:
Create a Search Index named `vector_index` on the `studynotechunks` collection:
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "userId"
    },
    {
      "type": "filter",
      "path": "subjectId"
    }
  ]
}
```

### 4. Zero-Dependency Local Cosine Similarity Fallback
To run the app locally without configuring cloud indexes, if no `VECTOR_INDEX_NAME` is set or the query fails:
- It fetches the student's own chunks using a standard MongoDB query.
- Computes cosine similarity in JavaScript in memory.
- Sorts and returns the best results.
- **This ensures local development works instantly without extra configurations.**

### 5. Multi-Layer Security & Prompt Injection Defense
- **User Isolation**: Retrieval always pre-filters on `userId` (derived securely from `req.user._id` inside the JWT payload, never trust client-provided IDs).
- **Prompt Injection Defense**: Ingested notes text is treated strictly as **data** by wrapping it inside `USER QUESTION:` and `RETRIEVED CONTEXT:` separators inside system instructions, instructing the LLM to ignore any instructions inside the context.
- **Note Syncing**: Deleting a note automatically deletes all associated vector chunks from the database, preventing stale or orphan vector data.

---

## ⚙️ Environment Variables Reference
Ensure the following variables are configured in `backend/.env`:

```env
# AI & RAG Configuration
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LLM_MODEL=gemini-2.5-flash
EMBEDDING_MODEL=gemini-embedding-001

# Paid/Fallback Optional Config
OPENAI_API_KEY=
# LLM_MODEL=gpt-4o-mini
# EMBEDDING_MODEL=text-embedding-3-small

RAG_TOP_K=5
RAG_CHUNK_SIZE=800
RAG_CHUNK_OVERLAP=150
RAG_RELEVANCE_THRESHOLD=0.65
VECTOR_INDEX_NAME=vector_index
```

---

## 📚 Example Grounded Questions
- *"Summarize Unit 3 congestion control algorithm."*
- *"What is the main differences between TCP and UDP based on my class notes?"*
- *"Generate 5 practice multiple-choice questions from TCP slow start notes."*
