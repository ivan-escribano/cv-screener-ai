# CV Screener AI — Overview

## What is this?

An AI assistant that reads a pile of CVs (resumes in PDF) and lets you ask questions about the candidates in plain language — like talking to a recruiter who has read every single CV.

```
 You ask:                          You get:
 "Who knows React?"        ──►    "Maria Garcia has 5 years of React
                                   experience, and Juan Lopez used it
                                   in two projects..."
```

---

## How does it work?

Think of it in 3 stages, like a library:

```
  1. FILL THE LIBRARY        2. INDEX THE BOOKS         3. ASK THE LIBRARIAN
 ┌───────────────────┐     ┌───────────────────┐      ┌───────────────────┐
 │                   │     │                   │      │                   │
 │  Generate or add  │     │  Read every CV,   │      │  You ask a        │
 │  PDF CVs to the   │────►│  break it into    │─────►│  question and     │
 │  system           │     │  pieces, and      │      │  the AI finds     │
 │                   │     │  store them in    │      │  the best matches │
 │                   │     │  a smart database │      │  and answers you  │
 └───────────────────┘     └───────────────────┘      └───────────────────┘
```

---

## Stage 1 — Fill the library

You can add your own PDF CVs, or let the system generate fake ones for testing.

The generator creates realistic candidates with different profiles — developers, designers, data scientists — each with a unique AI-generated headshot photo.

```
  AI generates data          AI creates photo         Builds the PDF
 ┌─────────────────┐      ┌─────────────────┐     ┌─────────────────┐
 │  Name, skills,  │      │  Professional   │     │  ┌─────┐        │
 │  experience,    │─────►│  headshot from   │────►│  │photo│ Name   │
 │  education...   │      │  a description   │     │  └─────┘ Skills │
 └─────────────────┘      └─────────────────┘     └─────────────────┘
```

---

## Stage 2 — Index the books

When you tell the system to "ingest" the CVs, it:

1. **Reads** each PDF and extracts the text
2. **Splits** the text into small pieces (chunks)
3. **Converts** each piece into a mathematical representation (embedding) that captures its meaning
4. **Stores** everything in a database that can search by meaning, not just keywords

```
  PDF file               Text chunks              Meaning vectors
 ┌───────────┐     ┌──────────────────┐     ┌──────────────────────┐
 │ maria.pdf │────►│ "5 years React"  │────►│ [0.021, -0.034, ...] │──► Database
 │           │     │ "Led a team..."  │     │ [0.018,  0.042, ...] │
 └───────────┘     └──────────────────┘     └──────────────────────┘
```

This is what makes it "smart" — it understands meaning. So if you ask about "frontend frameworks", it will find candidates who mention "React" or "Vue" even if they never wrote the word "frontend".

---

## Stage 3 — Ask the librarian

When you type a question:

1. Your question gets converted into the same kind of meaning vector
2. The database finds the CV pieces most similar to your question
3. Those CV pieces are sent to the AI along with your question
4. The AI reads the relevant CVs and writes a natural answer

```
  Your question               Find similar CVs           AI answers
 ┌─────────────────┐     ┌──────────────────────┐    ┌──────────────────┐
 │ "Who has        │     │ maria.pdf  (92%)     │    │ "Maria Garcia    │
 │  Python         │────►│ juan.pdf   (78%)     │───►│  has 4 years of  │
 │  experience?"   │     │ ana.pdf    (71%)     │    │  Python..."      │
 └─────────────────┘     └──────────────────────┘    └──────────────────┘
```

The answer always comes with **sources** — you can see which CVs the AI used to build its response.

---

## What can you ask?

The system works like a conversation. Some examples:

- "Which candidates have experience with React and more than 3 years of work?"
- "Compare the backend skills of all candidates"
- "Who would be the best fit for a senior full-stack role?"
- "Summarize Ana's CV"
- "Who speaks more than two languages?"

---

## What technologies are behind it?

| What                 | Technology                     |
| -------------------- | ------------------------------ |
| Server               | Express (Node.js)              |
| User interface       | Next.js (React)                |
| AI for text          | OpenAI (GPT-4o-mini)           |
| AI for photos        | Google Gemini                  |
| Smart database       | Supabase + pgvector            |
| Real-time responses  | Vercel AI SDK (streaming)      |

---

## Key takeaway

This is a **RAG** system (Retrieval-Augmented Generation). Instead of the AI guessing or hallucinating, it first **retrieves** the actual CV data from the database, then **generates** a grounded answer based only on what it found. The AI never invents information — it only works with the real CVs you provided.
