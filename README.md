# AI-Powered CV Screener

---

## 🎯 Overview

The goal is to build an application that allows querying a collection of PDF CVs as if it were an intelligent assistant.

### What does it do?

- The user asks questions about candidates (skills, experience, education, comparisons)
- The application semantically searches the CVs using embeddings
- Returns contextual answers with references to the source documents

### Example usage:

> "Which candidates have experience with React and more than 3 years of work?"

---

## 🎥 Demo

[Watch Demo Video](https://res.cloudinary.com/dlpvgtdlv/video/upload/v1767991719/personal/Full-Stack_AIEngineer_-_Ivan_Escribano_xhpiin.mp4)

---

## 🏗️ Architecture

### Tech Stack

| Layer               | Technology                                                             |
| ------------------- | ---------------------------------------------------------------------- |
| **Backend**         | Express + TypeScript                                                   |
| **Frontend**        | React + Next.js + shadcn/ui                                            |
| **LLMs**            | GPT-5-mini + Gemini 2.5 Flash (image generation)                       |
| **Vector Database** | PostgreSQL + Supabase (cloud store free) + pgvector (vector databases) |
| **AI Framework**    | Vercel AI SDK (UI Elements + Streaming responses)                      |

---

## 🔄 Diagrams

### CV Generator Script

```
tsx scripts/cv-generator/cv-generator.script.ts
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Generate CV Data (OpenAI + Zod)                        │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  {                                                         ││
│  │    name: "María García",                                   ││
│  │    title: "Senior Frontend Developer",                     ││
│  │    experience: [...], skills: [...], education: [...],     ││
│  │    photoURL: "Professional woman, 30s, confident..." ◀── Description ││
│  │  }                                                         ││
│  └────────────────────────────────────────────────────────────┘│
│  ⚡ Type-safe structured output guaranteed by Zod               │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Generate Headshot (Gemini 2.5 Flash)                   │
│  photoURL description ────▶ 📸 [IMAGE BUFFER]                   │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Generate PDF (pdfkit)                                  │
│  ┌──────────┐                                                  │
│  │ 📸 photo │  MARÍA GARCÍA - Senior Frontend Developer        │
│  └──────────┘  Experience • Skills • Education                 │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: Save to /data/cvs/maria_garcia.pdf ✅                  │
└─────────────────────────────────────────────────────────────────┘
```

### Store embeddings in Vector Databases (PDF → Embeddings → Vector DB)

```
POST /ingest
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Read PDFs, convert to text and chunk                   │
│  📁 /cvs                                                        │
│     ├── maria_garcia.pdf  ──▶  { fileId, chunks: [...] }        │
│     ├── juan_lopez.pdf    ──▶  { fileId, chunks: [...] }        │
│     └── ana_martinez.pdf  ──▶  { fileId, chunks: [...] }        │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Generate embeddings in batch (OpenAI)                  │
│                                                                 │
│  Chunks ──────────────────▶ Embeddings                          │
│  ["María García..."]        [0.021, -0.034, ...]                │
│  ["5 años React..."]        [0.018, 0.042, ...]                 │
│  ["Juan López..."]          [-0.011, 0.029, ...]                │
│                                                                 │
│  ⚡ Single OpenAI call for all texts                            │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Store in Supabase (pgvector)                           │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ id │ content          │ embedding      │ file_id │ chunk  ││
│  ├────┼──────────────────┼────────────────┼─────────┼────────┤│
│  │ 1  │ "María García..."│ [0.021, -0.03] │ maria   │ 0      ││
│  │ 2  │ "5 años React..."│ [0.018, 0.042] │ maria   │ 1      ││
│  │ 3  │ "Juan López..."  │ [-0.011, 0.02] │ juan    │ 0      ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Chat Flow (RAG - Semantic Search)

```
User asks: "Who knows React?"
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Create embedding of the question                            │
│     "Who knows React?" ──▶ [0.019, -0.031, ...]                 │
│                                                                 │
│  2. Search similar vectors in Supabase                          │
│     [0.019, -0.031] ≈ [0.021, -0.034]  ──▶ maria_chunk_0 ✓      │
│                                                                 │
│  3. Send context + question to LLM                              │
│     GPT-5-mini generates response with sources                  │
│                                                                 │
│  4. Stream response to frontend                                 │
│     { content: "María García has 5 years...", sources: [...] } │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

### Backend

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
│   ├── google-gen-ai/       # Gemini Google model service functions(image generation)
│   └── openai/              # OpenAI model service functions(Embeddings + LLM)
└── utils/
```

---

## ⚙️ Setup

### Environment Variables

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

### Generate Synthetic CVs (Optional)

```bash
cd backend
npm run generate:cvs
# or manually: npx tsx scripts/cv-generator/cv-generator.script.ts
```

This will generate PDF CVs with AI-generated data and headshots in `/data/cvs/`.

### Ingest CVs to Vector Database

After placing your PDFs in `/backend/data/cvs/`, run the ingest script (server must be running):

```bash
npm run ingest
# or manually: curl -X POST http://localhost:3001/api/ingest
```

This will process all PDFs, generate embeddings, and store them in Supabase.

---

## 🚀 Run Project

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Access

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

---

## 📋 Prerequisites

- **Node.js** v20.16.0 or higher
- **Next.js** v13 or higher
- **Supabase account** with vector database created (pgvector enabled)
- **OpenAI API key**
- **Google Gemini API key**

---

## 🔧 Technical Highlight

### RAG Pipeline: PDF → Text → Chunks → Embeddings → Vector DB

The most challenging and rewarding part was building the complete **RAG ingestion pipeline**:

```
PDF Files → Extract Text → Chunk Content → Generate Embeddings → Store in Supabase (pgvector)
```

I had previous experience with **ChromaDB** locally, but implementing this with **Supabase + pgvector** as a cloud-hosted vector database was a new challenge. Working with PostgreSQL's vector extension and writing the similarity search queries was really satisfying.

### AI-Powered CV Generator: Multi-Model Approach

I'm proud of the synthetic CV generation approach using **multiple LLMs**:

1. **OpenAI (Structured Output + Zod)** → Generates type-safe CV data with a `photoURL` field containing a person description
2. **Gemini 2.5 Flash** → Takes that description and generates a realistic headshot image
3. **pdfkit** → Combines everything into a professional PDF

This multi-model orchestration was fun to implement—each model doing what it does best.

### Vercel AI SDK: Fast UI Implementation

Using the **Vercel AI SDK** made the frontend implementation incredibly fast:

- Streaming responses with real-time text generation
- Rich formatting support (code blocks, tables, markdown)
- Pre-built UI components for chat interfaces

The SDK abstracted away complexity and let me focus on the user experience.

---

## 🚀 More AI Projects

Other projects where I integrate AI into real products:

### 💇 AI Barbershop - Haircut Preview

Ever struggled to explain your desired haircut to a barber? This app takes your photo and uses **Google Gemini** to generate a preview of how you'll look with different hairstyles.

[See Demo](https://www.linkedin.com/posts/ivan-escribano-dev_how-do-you-want-your-hair-cut-today-that-ugcPost-7401201682778423296-b7AW)

---

### ⚽ MCP Scout Football - Natural Language Player Search

Scraped **3,000+ football players** data, stored in **Azure SQL**, and built an **MCP Server** that connects to Claude Desktop and ChatGPT. Query players using natural language:

> "Find me a defender who's good with the ball"

[See Demo](https://www.linkedin.com/posts/ivan-escribano-dev_ai-mcp-football-ugcPost-7404880226175963137-3rca)

---

### 📊 LinkedIn Carousel Generator

AI-powered tool that generates professional LinkedIn carousels in minutes.

[See Demo](https://www.linkedin.com/posts/ivan-escribano-dev_10-minutes-thats-how-long-it-takes-to-ugcPost-7407383073828282368-91g4)

---

### 💬 Portfolio Chatbot Assistant

A chatbot embedded in my web portfolio that answers questions about my experience, skills, and projects using RAG.

[See Demo](https://www.linkedin.com/posts/ivan-escribano-dev_2020-3-meses-para-hacer-una-web-b%C3%A1sica-ugcPost-7397568041858891776-5km4)

---

## 🔗 Links

- 🌐 [Portfolio](https://www.ivanescribano.com/)
- 📝 [Substack](https://substack.com/@ivanescribano)
- ✍️ [Medium](https://medium.com/@ivanescribano)
- 💼 [LinkedIn](https://www.linkedin.com/in/ivan-escribano-dev/)
