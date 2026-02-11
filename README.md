# CV Screener AI

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75B2?logo=googlegemini&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![pgvector](https://img.shields.io/badge/pgvector-336791?logo=postgresql&logoColor=white)

> An intelligent assistant that lets you query a collection of PDF CVs using natural language. Ask about candidates' skills, experience, education, or compare profiles  powered by RAG with semantic search.

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

## Supabase Setup (Required)

This application uses Supabase as a PostgreSQL database with pgvector extension for semantic search. Follow these steps to set up your Supabase project.

### 1. Create a Supabase Account and Project

1. Go to [https://supabase.com](https://supabase.com) and click **"Start your project"**
2. Sign up with GitHub, Google, or email
3. Once logged in, click **"New project"**
4. Fill in the project details:
   - **Name**: Choose a name (e.g., "cv-screener-ai")
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Select the region closest to you
   - **Pricing Plan**: Free tier is sufficient for development
5. Click **"Create new project"** and wait ~2 minutes for provisioning

### 2. Enable pgvector Extension

The application requires the pgvector extension for vector similarity search.

1. In your Supabase dashboard, navigate to the **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Run the following command:

```sql
create extension if not exists vector;
```

4. Click **"Run"** or press `Ctrl/Cmd + Enter`
5. You should see a success message: `Success. No rows returned`

### 3. Run Database Migrations

The migration file creates the necessary tables and functions for storing CV embeddings.

#### What the migration does:
- Creates `cv_chunks` table to store text chunks and their vector embeddings
- Sets up an IVFFlat index for fast similarity search
- Creates a `match_cv_chunks` function for semantic search with similarity threshold

#### Execute the migration:

In the same SQL Editor, run the following SQL:

```sql
-- Chunks table
create table cv_chunks (
  id bigserial primary key,
  content text not null,
  embedding vector(1536),
  file_id text not null,
  chunk_index integer,
  created_at timestamp with time zone default now()
);

-- Index for fast search
create index on cv_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Semantic search function with threshold
create or replace function match_cv_chunks (
  query_embedding vector(1536),
  match_count int default 10,
  match_threshold float default 0.7
)
returns table (
  id bigint,
  content text,
  file_id text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    cv_chunks.id,
    cv_chunks.content,
    cv_chunks.file_id,
    1 - (cv_chunks.embedding <=> query_embedding) as similarity
  from cv_chunks
  where 1 - (cv_chunks.embedding <=> query_embedding) >= match_threshold
  order by cv_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

**Note**: The complete migration file is available at `/backend/db/migrations/001_create_cv_chunks.sql`

### 4. Get API Keys and Connection Details

1. In your Supabase dashboard, go to **Settings** → **API** (left sidebar)
2. You'll see two important sections:

#### Project URL
- Copy the URL under **"Project URL"**
- Format: `https://xxxxxxxxxxxxx.supabase.co`
- This is your `SUPABASE_URL`

#### API Keys
- **anon/public key**: Copy this key (labeled as "anon public")
- This is your `SUPABASE_ANON_KEY`

**Security Note**: 
- ✅ Use the **anon key** for client-side and server-side applications (it respects Row Level Security policies)
- ⚠️ The **service_role key** bypasses all security rules - only use it for trusted server environments and never expose it to clients

#### Update your `.env` file

In `/backend/.env`, add your credentials:

```env
# Supabase (Vector Database)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_public_key_here

# AI APIs
OPENAI_API_KEY=your_openai_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# Server
PORT=3001
FRONTEND_URL=http://localhost:3000

# Paths
CVS_PATH=./data/cvs
```

### 5. Verify Your Setup

Before ingesting CVs, verify everything is configured correctly:

#### Check pgvector extension:
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

You should see one row with `extname = 'vector'`

#### Check tables were created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'cv_chunks';
```

You should see the `cv_chunks` table listed.

#### Check the function exists:
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'match_cv_chunks';
```

You should see `match_cv_chunks` listed.

#### Test the connection from your backend:

```bash
cd backend
npm install
npm run dev
```

If the server starts without Supabase connection errors, your setup is complete! ✅

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
