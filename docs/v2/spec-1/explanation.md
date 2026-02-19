# Spec 1 — CV Upload: Explanation

---

## Frontend — CvUploader

### Overview

```
User drops/selects PDFs
        │
        ▼
CvUploader.component.tsx  ──  useDropzone handles drag & drop
        │
        ▼
use-cv-uploader.hook.ts   ──  manages state, calls the API
        │
        ▼
CvsApi.uploadCVs()        ──  HTTP request via axios
        │
        ▼
Result per file           ──  success or error shown on screen + toast
```

### Component states

```
IDLE
  │  user drops files
  ▼
UPLOADING
  │
  ├── all OK  ──▶ SUCCESS  — shows chunks per file
  └── failure ──▶ ERROR    — shows readable message

SUCCESS / ERROR
  │  click "Upload more CVs"
  ▼
IDLE  (reset)
```

REMEMBER:
→ States are an enum, not loose strings
→ The component only renders — it knows nothing about HTTP
→ The hook connects UI with the data layer

---

### API layer

```
shared/api.config.ts
  └── axios.create({ baseURL: NEXT_PUBLIC_API_BASE_URL })
              │
              ▼
cvs/cvs.api.ts     ── uses that client
cvs/cvs.config.ts  ── defines CVS_BASE_URL = "/api/cvs"
              │
              ▼
CvsApi = { uploadCVs, listCVs, deleteCV }
```

REMEMBER:
→ Change the base URL → only touch `shared/api.config.ts`
→ Add a new endpoint → add a function in `cvs.api.ts` and include it in `CvsApi`

---

## Backend — `cvs` module

### Overview

```
User uploads PDFs (one or more)
        │
        ▼
[routes.ts]      ── multer receives files in memory
        │
        ▼
[controller.ts]  ── sends all files to be processed in parallel
        │
        ├── file 1 ──▶ [service.ts] ──▶ Supabase
        ├── file 2 ──▶ [service.ts] ──▶ Supabase
        └── file 3 ──▶ [service.ts] ──▶ ERROR (duplicate)
        │
        ▼
Response with individual result per file

[config.ts]  ── rules and messages used by all layers
```

### `routes.ts` — the entry point

```
POST /api/cvs/upload
        │
multer (files in memory, never on disk)
        │
form field name: "cvs" (array)
        │
        ▼
controller.uploadCV
```

REMEMBER:
→ Files never touch disk — they stay in memory as a `Buffer`
→ The form field must be exactly `"cvs"`

---

### `controller.ts` — the coordinator

```
req.files (array of files)
        │
Any files? ──No──▶ 400 error
        │ Yes
        ▼
Promise.allSettled ──▶ processes all at once
        │
        ├── success ──▶ { fileId, success: true, chunks }
        └── failure ──▶ { fileId, success: false, error }
        │
        ▼
{ success, message, data: [...results] }
```

`Promise.allSettled` is like sending several couriers at once — if one fails, the others are not affected.

REMEMBER:
→ All files are processed in parallel
→ The response always includes the individual result for each file

---

### `service.ts` — the engine

```
Receives one file
        │
Is it PDF?          ──No──▶ INVALID_PDF
Under 5MB?          ──No──▶ FILE_TOO_LARGE
Duplicate?          ──Yes─▶ DUPLICATE_FILE
Has text?           ──No──▶ NO_TEXT_EXTRACTED
        │ All OK
        ▼
Extract text (pdf-parse)
        │
        ▼
Split into chunks (IngestService)
        │
        ▼
Generate embeddings (OpenAI)
        │
        ▼
Store in Supabase (IngestService)
        │
        ▼
{ fileId, chunks }
```

REMEMBER:
→ Validate first, process second — never the other way around
→ 90% of the logic reuses `IngestService`, nothing was duplicated

---

### `config.ts` — the rules

```
CVS_CONFIG        ──▶ MAX_FILE_SIZE: 5MB

ERROR_CODES       ──▶ INVALID_PDF
                       FILE_TOO_LARGE
                       DUPLICATE_FILE
                       NO_TEXT_EXTRACTED

SUCCESS_MESSAGES  ──▶ CV_UPLOADED
```

REMEMBER:
→ All limits and messages live here, in one place
→ To change the size limit, only touch `config.ts`

---

## Summary

```
→ The module allows uploading multiple PDFs at once via HTTP
→ Each file goes through 4 validations before processing
→ If one fails, the others continue unaffected
→ Text is stored in Supabase ready for semantic search
→ All heavy logic was reused from IngestService — no duplication
```
