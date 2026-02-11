# CV Screener AI — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js)                            │
│  ┌───────────┐  ┌────────────────┐  ┌────────────────────────────────┐  │
│  │ useChatbot│  │ ChatbotMessage │  │ ChatbotMessageSources         │  │
│  │ hook      │──│ (streaming)    │──│ (file, snippet, similarity)   │  │
│  └─────┬─────┘  └────────────────┘  └────────────────────────────────┘  │
│        │  @ai-sdk/react useChat()                                       │
└────────┼────────────────────────────────────────────────────────────────┘
         │  POST /api/chat  { messages }
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Express)                             │
│                                                                         │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐ │
│  │       CHAT MODULE            │  │       INGEST MODULE              │ │
│  │  POST /api/chat              │  │  POST /api/ingest                │ │
│  │                              │  │                                  │ │
│  │  1. Embed user query         │  │  1. Read PDFs from /data/cvs/   │ │
│  │  2. Similarity search (RPC)  │  │  2. Extract text (pdf-parse)    │ │
│  │  3. Fetch full CV context    │  │  3. Chunk (500c / 100c overlap) │ │
│  │  4. Stream LLM response      │  │  4. Batch embed (OpenAI)        │ │
│  │                              │  │  5. Store in Supabase           │ │
│  └──────────────┬───────────────┘  └──────────────┬───────────────────┘ │
│                 │                                  │                     │
│  ┌──────────────┴──────────────────────────────────┴───────────────────┐ │
│  │                        SERVICES LAYER                               │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │ │
│  │  │ OpenAI Service   │  │ Google GenAI     │  │ Supabase Client  │  │ │
│  │  │ - embeddings     │  │ - image gen      │  │ - vector store   │  │ │
│  │  │ - chat (gpt-4o)  │  │ - Gemini 2.5     │  │ - RPC calls      │  │ │
│  │  │ - structured out │  │   Flash          │  │                  │  │ │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL + pgvector)                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ cv_chunks                                                       │    │
│  │ ┌────┬────────────────────┬────────────────┬─────────┬────────┐ │    │
│  │ │ id │ content            │ embedding      │ file_id │ chunk  │ │    │
│  │ ├────┼────────────────────┼────────────────┼─────────┼────────┤ │    │
│  │ │ 1  │ "Maria Garcia..."  │ vector(1536)   │ maria   │ 0      │ │    │
│  │ │ 2  │ "5 years React..." │ vector(1536)   │ maria   │ 1      │ │    │
│  │ └────┴────────────────────┴────────────────┴─────────┴────────┘ │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│  RPC: match_cv_chunks(query_embedding, count, threshold)                │
│  Index: IVFFlat (cosine similarity)                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Module Breakdown

### 1. Chat Module — RAG Pipeline

The core of the application. Handles the full retrieval-augmented generation flow.

```
  User message
       │
       ▼
 ┌─────────────┐     ┌──────────────────┐     ┌────────────────────┐
 │ Extract last │────►│ Create embedding │────►│ Supabase RPC       │
 │ user query   │     │ (text-embedding- │     │ match_cv_chunks()  │
 └─────────────┘     │  3-small, 1536d) │     │ top 3, sim > 0.3   │
                      └──────────────────┘     └─────────┬──────────┘
                                                         │
                                                         ▼
 ┌─────────────┐     ┌──────────────────┐     ┌────────────────────┐
 │ Stream back │◄────│ streamText()     │◄────│ Fetch full docs    │
 │ to frontend │     │ gpt-4o-mini +    │     │ for matched CVs    │
 │ + sources   │     │ system prompt    │     │ (all chunks by     │
 └─────────────┘     └──────────────────┘     │  file_id)          │
                                               └────────────────────┘
```

**Key files:**
- `chat.controller.ts` — Express handler, orchestrates the flow
- `chat.service.ts` — Business logic: similarity search, context building, streaming
- `chat.config.ts` — Vector search params (limit: 3, threshold: 0.3)
- `prompts/system.prompt.md` — System prompt (HR specialist role), `{{CONTEXT}}` placeholder

**Context injection:** The system prompt has a `{{CONTEXT}}` placeholder that gets replaced with the full text of matched CVs, formatted as `=== filename.pdf ===\n[content]` blocks.

---

### 2. Ingest Module — PDF to Vectors

Processes PDF files into searchable vector embeddings.

```
  /data/cvs/*.pdf
       │
       ▼
 ┌─────────────┐     ┌──────────────────┐     ┌────────────────────┐
 │ pdf-parse   │────►│ Split into       │────►│ OpenAI batch       │
 │ extract text│     │ chunks           │     │ embeddings         │
 └─────────────┘     │ 500 chars        │     │ text-embedding-    │
                      │ 100 overlap      │     │ 3-small            │
                      └──────────────────┘     └─────────┬──────────┘
                                                         │
                                                         ▼
                                               ┌────────────────────┐
                                               │ Supabase insert    │
                                               │ content + embedding│
                                               │ + file_id + index  │
                                               └────────────────────┘
```

**Key files:**
- `ingest.controller.ts` — Orchestrates parse → embed → store
- `ingest.service.ts` — PDF parsing, chunking logic, Supabase insertion
- `ingest.config.ts` — `CHUNK_SIZE: 500`, `CHUNK_OVERLAP: 100`

**Chunking strategy:** Text is split into 500-character pieces with 100-character overlap between consecutive chunks. The overlap preserves context at chunk boundaries so sentences aren't cut mid-thought.

---

### 3. CV Generator Script

Standalone script that creates synthetic CVs for testing.

```
  npm run generate:cvs
       │
       ▼
 ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
 │ OpenAI + Zod    │────►│ Gemini 2.5      │────►│ pdfkit          │
 │ Generate CV     │     │ Flash           │     │ Build PDF       │
 │ structured data │     │ Generate photo  │     │ photo + sections│
 └─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                                                 /data/cvs/*.pdf
```

**Key files:**
- `cv-generator.script.ts` — Entry point, loops `CV_COUNT` times
- `cv-generator.service.ts` — Data generation, photo generation, PDF creation
- `cv-generator.model.ts` — Zod schema defining CV structure (name, contact, experience, skills, education, languages)
- `cv-generator.config.ts` — `CV_COUNT`, `OUTPUT_DIR`

**Structured output:** Uses OpenAI's `zodResponseFormat` to guarantee the LLM returns valid data matching the Zod schema — no parsing or validation needed.

---

### 4. Services Layer

Shared services used across modules.

```
 ┌───────────────────────────────────────────────────────────────┐
 │                      SERVICES                                 │
 │                                                               │
 │  OpenAI Service                                               │
 │  ├── createEmbedding(text)      → single vector               │
 │  ├── createEmbeddings(texts[])  → batch vectors (1 API call)  │
 │  └── generateObject(schema)     → Zod-validated structured    │
 │                                                               │
 │  Google GenAI Service                                         │
 │  └── generateImage(prompt)      → base64 image buffer         │
 │                                                               │
 │  Supabase Client                                              │
 │  └── Configured via env vars, used for vector ops + RPC       │
 └───────────────────────────────────────────────────────────────┘
```

**Models used:**
| Purpose          | Model                         | Dimensions |
| ---------------- | ----------------------------- | ---------- |
| Embeddings       | `text-embedding-3-small`      | 1536       |
| Chat             | `gpt-4o-mini`                 | —          |
| Image generation | `gemini-2.5-flash`            | —          |

---

## Frontend Architecture

```
 ┌──────────────────────────────────────────────────────────┐
 │  page.tsx                                                │
 │  └── <Chatbot />                                         │
 │       │                                                  │
 │       ├── useChatbot() hook                              │
 │       │   └── useChat() from @ai-sdk/react               │
 │       │       - POST to /api/chat                        │
 │       │       - Manages messages[], status, streaming    │
 │       │                                                  │
 │       ├── Empty state + suggestion chips                 │
 │       │                                                  │
 │       ├── ChatbotMessage (per message)                   │
 │       │   ├── Text parts (streamed response)             │
 │       │   ├── Typing indicator (during stream)           │
 │       │   └── ChatbotMessageSources                      │
 │       │       └── Collapsible list of source CVs         │
 │       │           (file name, snippet, similarity %)     │
 │       │                                                  │
 │       └── PromptInput (text input + submit)              │
 └──────────────────────────────────────────────────────────┘
```

**UI stack:** shadcn/ui components + custom `ai-elements` components (conversation, message, prompt-input, sources) built on Radix UI primitives.

**Streaming:** The `useChat` hook from Vercel AI SDK handles server-sent events. The response streams token-by-token into the UI. Source metadata is written to the stream separately and rendered after the text completes.

---

## Database Schema

```sql
-- Extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Table
cv_chunks (
  id           BIGSERIAL PRIMARY KEY,
  content      TEXT NOT NULL,           -- raw text chunk
  embedding    VECTOR(1536),            -- OpenAI embedding
  file_id      TEXT NOT NULL,           -- source PDF filename
  chunk_index  INTEGER,                 -- position in document
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index (fast approximate nearest-neighbor search)
IVFFlat INDEX on embedding (cosine similarity), lists = 100

-- RPC function
match_cv_chunks(query_embedding, match_count, match_threshold)
  → returns { id, content, file_id, similarity }
  → filters by similarity >= threshold
  → ordered by cosine distance
```

Full migration: [`backend/db/migrations/001_create_cv_chunks.sql`](../backend/db/migrations/001_create_cv_chunks.sql)

---

## Project Structure

```
backend/
├── index.ts                          # Express server entry point
├── config/
│   ├── env-variables/env.config.ts   # Environment variables
│   ├── openai/openai.config.ts       # OpenAI client init
│   ├── google-gen-ai/                # Gemini client init
│   └── supabase/supabase.config.ts   # Supabase client init
├── modules/
│   ├── chat/
│   │   ├── chat.controller.ts        # POST /api/chat handler
│   │   ├── chat.service.ts           # RAG: search + context + stream
│   │   ├── chat.routes.ts            # Route definition
│   │   ├── chat.config.ts            # Search params & error messages
│   │   ├── chat.interface.ts         # TypeScript interfaces
│   │   └── prompts/system.prompt.md  # LLM system prompt
│   └── ingest/
│       ├── ingest.controller.ts      # POST /api/ingest handler
│       ├── ingest.service.ts         # PDF parse + chunk + embed + store
│       ├── ingest.routes.ts          # Route definition
│       └── ingest.config.ts          # Chunk size & overlap
├── scripts/cv-generator/
│   ├── cv-generator.script.ts        # Entry: npm run generate:cvs
│   ├── cv-generator.service.ts       # Data + photo + PDF generation
│   ├── cv-generator.model.ts         # Zod CV schema
│   └── prompts/                      # LLM prompts for generation
├── services/
│   ├── openai/openai.service.ts      # Embeddings + structured output
│   └── google-gen-ai/                # Image generation
├── utils/load-prompt.util.ts         # Prompt template loader
├── data/cvs/                         # PDF storage
└── db/migrations/                    # Supabase SQL setup

frontend/
├── src/app/
│   ├── page.tsx                      # Root → <Chatbot />
│   └── chatbot/
│       ├── Chatbot.component.tsx     # Main UI
│       ├── Chatbot.hooks.ts          # useChatbot (useChat wrapper)
│       ├── Chatbot.config.ts         # API URL, suggestions
│       └── sub-components/
│           ├── chatbot-message/      # Message rendering
│           ├── chatbot-message-sources/  # Source display
│           └── chatbot-typing-indicator/ # Streaming indicator
├── src/components/
│   ├── ui/                           # shadcn/ui (button, card, etc.)
│   └── ai-elements/                  # AI-specific UI components
└── src/lib/utils.ts                  # Utility functions
```

---

## API Endpoints

| Method | Path          | Description                                      |
| ------ | ------------- | ------------------------------------------------ |
| POST   | `/api/chat`   | Send messages, get streamed RAG response + sources |
| POST   | `/api/ingest` | Parse all PDFs in `/data/cvs/`, embed and store   |

---

## Environment Variables

```env
SUPABASE_URL=               # Supabase project URL
SUPABASE_ANON_KEY=          # Supabase anon/public key
OPENAI_API_KEY=             # OpenAI API key
GOOGLE_GENERATIVE_AI_API_KEY= # Google Gemini API key
PORT=3001                   # Backend port
FRONTEND_URL=http://localhost:3000
CVS_PATH=./data/cvs         # PDF storage path
```
