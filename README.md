# CV Screener AI

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75B2?logo=googlegemini&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![pgvector](https://img.shields.io/badge/pgvector-336791?logo=postgresql&logoColor=white)

> An intelligent assistant that lets you query a collection of PDF CVs using natural language. Ask about candidates' skills, experience, education, or compare profiles — powered by RAG with semantic search.

---

## Tech Stack

| Layer            | Technology                                        |
| ---------------- | ------------------------------------------------- |
| **Backend**      | Express + TypeScript                              |
| **Frontend**     | React + Next.js + shadcn/ui                       |
| **LLMs**         | GPT-4o-mini + Gemini 2.5 Flash (image generation) |
| **Vector DB**    | PostgreSQL + Supabase + pgvector                  |
| **AI Framework** | Vercel AI SDK (streaming + UI components)         |

---

## Architecture

### CV Generator Script

```
tsx scripts/cv-generator/cv-generator.script.ts
     |
     v
+------------------------------------------------------------------+
|  STEP 1: Generate CV Data (OpenAI + Zod)                          |
|  +--------------------------------------------------------------+ |
|  |  {                                                            | |
|  |    name: "Maria Garcia",                                      | |
|  |    title: "Senior Frontend Developer",                        | |
|  |    experience: [...], skills: [...], education: [...],        | |
|  |    photoURL: "Professional woman, 30s, confident..."          | |
|  |  }                                                            | |
|  +--------------------------------------------------------------+ |
|  Type-safe structured output guaranteed by Zod                    |
+------------------------------------------------------------------+
     |
     v
+------------------------------------------------------------------+
|  STEP 2: Generate Headshot (Gemini 2.5 Flash)                     |
|  photoURL description ------> [IMAGE BUFFER]                      |
+------------------------------------------------------------------+
     |
     v
+------------------------------------------------------------------+
|  STEP 3: Generate PDF (pdfkit)                                    |
|  +----------+                                                     |
|  |  photo   |  MARIA GARCIA - Senior Frontend Developer           |
|  +----------+  Experience - Skills - Education                    |
+------------------------------------------------------------------+
     |
     v
+------------------------------------------------------------------+
|  STEP 4: Save to /data/cvs/maria_garcia.pdf                      |
+------------------------------------------------------------------+
```

### Store Embeddings (PDF to Vector DB)

```
POST /ingest
     |
     v
+------------------------------------------------------------------+
|  STEP 1: Read PDFs, convert to text and chunk                     |
|  /cvs                                                             |
|     |- maria_garcia.pdf  -->  { fileId, chunks: [...] }           |
|     |- juan_lopez.pdf    -->  { fileId, chunks: [...] }           |
|     |- ana_martinez.pdf  -->  { fileId, chunks: [...] }           |
+------------------------------------------------------------------+
     |
     v
+------------------------------------------------------------------+
|  STEP 2: Generate embeddings in batch (OpenAI)                    |
|                                                                   |
|  Chunks ----------------------> Embeddings                        |
|  ["Maria Garcia..."]           [0.021, -0.034, ...]               |
|  ["5 years React..."]          [0.018, 0.042, ...]                |
|  ["Juan Lopez..."]             [-0.011, 0.029, ...]               |
|                                                                   |
|  Single OpenAI call for all texts                                 |
+------------------------------------------------------------------+
     |
     v
+------------------------------------------------------------------+
|  STEP 3: Store in Supabase (pgvector)                             |
|  +--------------------------------------------------------------+ |
|  | id | content           | embedding      | file_id | chunk    | |
|  |----+-------------------+----------------+---------+----------| |
|  | 1  | "Maria Garcia..." | [0.021, -0.03] | maria   | 0        | |
|  | 2  | "5 years React..."| [0.018, 0.042] | maria   | 1        | |
|  | 3  | "Juan Lopez..."   | [-0.011, 0.02] | juan    | 0        | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Chat Flow (RAG - Semantic Search)

```
User asks: "Who knows React?"
     |
     v
+------------------------------------------------------------------+
|  1. Create embedding of the question                              |
|     "Who knows React?" --> [0.019, -0.031, ...]                   |
|                                                                   |
|  2. Search similar vectors in Supabase                            |
|     [0.019, -0.031] ~ [0.021, -0.034]  --> maria_chunk_0         |
|                                                                   |
|  3. Send context + question to LLM                                |
|     GPT-4o-mini generates response with sources                   |
|                                                                   |
|  4. Stream response to frontend                                   |
|     { content: "Maria Garcia has 5 years...", sources: [...] }    |
+------------------------------------------------------------------+
```

---

## Project Structure

```
backend/
├── index.ts                 # Express server entry point
├── config/                  # Environment & service configs
├── data/cvs/                # PDF CVs storage
├── db/migrations/           # Supabase vector DB setup
├── modules/
│   ├── chat/                # RAG chat endpoint
│   └── ingest/              # PDF parsing + embeddings + vector storage
├── scripts/cv-generator/    # Synthetic CV generation
├── services/
│   ├── google-gen-ai/       # Gemini (image generation)
│   └── openai/              # OpenAI (embeddings + LLM)
└── utils/
```

---

## Prerequisites

- **Node.js** v20.16.0 or higher
- **Supabase account** with pgvector enabled
- **OpenAI API key**
- **Google Gemini API key**

---

## Quick Start

### 1. Clone and configure

```bash
git clone https://github.com/yourusername/cv-screener-ai.git
cd cv-screener-ai
```

Create a `.env` file in the `backend/` folder:

```env
# Supabase (Vector Database)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI APIs
OPENAI_API_KEY=your_openai_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# Server
PORT=3001
FRONTEND_URL=http://localhost:3000

# Paths
CVS_PATH=./data/cvs
```

### 2. Run backend

```bash
cd backend
npm install
npm run dev
```

### 3. Run frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Ingest CVs into Vector DB

Place your PDFs in `/backend/data/cvs/`, then:

```bash
npm run ingest
```

### 5. (Optional) Generate synthetic CVs

```bash
cd backend
npm run generate:cvs
```

This generates PDF CVs with AI-created data and headshots.

### Access

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

---

## Design Decisions

| Decision                          | Why                                                       |
| --------------------------------- | --------------------------------------------------------- |
| Supabase + pgvector over ChromaDB | Cloud-hosted, zero infra management, free tier available  |
| Multi-model (OpenAI + Gemini)     | Each model for its strength: structured text vs image gen |
| Zod structured output             | Type-safe LLM responses, eliminates parsing errors        |
| Vercel AI SDK                     | Native streaming + React hooks, fast UI implementation    |
| Batch embedding ingestion         | Single API call for all chunks, reduces cost and latency  |

---

## Example Usage

> "Which candidates have experience with React and more than 3 years of work?"

> "Compare the backend skills of all candidates"

> "Who would be the best fit for a senior full-stack role?"

---

## License

MIT
