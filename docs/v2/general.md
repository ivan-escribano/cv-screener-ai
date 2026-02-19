# CV Screener AI — v2 General Spec

## Summary

Five features to turn the project from a terminal script into a usable product.

| # | Feature | Description |
|---|---------|-------------|
| 1 | **CV Upload** | Drag & drop PDFs from the UI, no terminal needed |
| 2 | **CV List + Delete** | View and manage uploaded CVs |
| 3 | **Navigation Layout** | Two views (CVs and Chat) with a shared navbar |
| 4 | **Refactoring** | Folder structure, DTOs, routes config, English copy, toasts |
| 5 | **UI/UX** | Sortable table, upload dialog, chat empty state |

```
┌──────────────────────────────────────────────────┐
│  CV Screener AI              CVs (3)     Chat    │
├──────────────────────────────────────────────────┤
│                                                  │
│  /cvs  →  Upload dialog + CV table               │
│  /chat →  Chat with AI + sources                 │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Feature 1 — CV Upload

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│           ┌───────────────────────────┐                 │
│           │                           │                 │
│           │     Drop your CVs here    │                 │
│           │                           │                 │
│           │   or click to select      │                 │
│           │                           │
│           │   PDF only · Max 5MB      │                 │
│           └───────────────────────────┘                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Component states

```
IDLE ──► UPLOADING ──► SUCCESS
                  ──► ERROR
```

### Endpoint

```
POST /api/cvs/upload
Content-Type: multipart/form-data
Body: { cvs: File[] }
```

### Processing pipeline

```
Receive PDF (multer, memory)
      │
      ▼
Validate (type → size → duplicate → has text)
      │
      ▼
Extract text (pdf-parse)
      │
      ▼
Split into chunks           ← reuses IngestService
      │
      ▼
Generate embeddings         ← reuses IngestService
      │
      ▼
Store in Supabase           ← reuses IngestService
      │
      ▼
Return { fileId, chunks }
```

---

## Feature 2 — CV List + Delete

```
┌─────────────────────────────────────────────────────────┐
│  CVs                                      [+ Upload CV] │
│─────────────────────────────────────────────────────────│
│  File               Chunks    Date         Actions      │
│  ─────────────────────────────────────────────────────  │
│  📄 maria.pdf          12     2 hours ago      🗑        │
│  📄 juan.pdf            8     1 day ago         🗑        │
│  ─────────────────────────────────────────────────────  │
│  2 candidates                                           │
└─────────────────────────────────────────────────────────┘
```

### States

```
LOADING ──► EMPTY  (no CVs)
        ──► LIST   (has CVs)
        ──► ERROR
```

### Endpoints

```
GET    /api/cvs
DELETE /api/cvs/:fileId
```

---

## Feature 3 — Navigation Layout

```
┌──────────────────────────────────────────────────────────┐
│  CV Screener AI                     CVs (3)     Chat    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                   Dynamic content per route              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Routes

| Route   | Content                  |
|---------|--------------------------|
| `/`     | Redirect to `/cvs`       |
| `/cvs`  | CV table + upload dialog |
| `/chat` | Chat (existing)          |

---

## Feature 4 — Refactoring

| Change | Detail |
|--------|--------|
| Folder structure | Move components to `src/components/custom/` |
| DTOs | `CvListResponse` + `DeleteCvResponse` moved to `cvs.dto.ts` |
| Routes config | `src/config/routes.config.ts` — no magic strings |
| English copy | All UI messages in English |
| Toasts | Sonner toasts on upload and delete |

---

## Feature 5 — UI/UX

### CVs view

- `CvList` replaced by a sortable table (`@tanstack/react-table` + shadcn `Table`)
- `CvUploader` moved into a `Dialog` triggered by `[+ Upload CV]` button
- Default sort: date descending
- Dates shown as relative strings (`2 hours ago`)

### Chat view

- Empty state redesigned: centered with icon, title, candidate count, suggestion chips
- Sources show relevance score as percentage (`92%`)

---

## Key architectural decisions

- No separate CVs table — data is derived by grouping `cv_chunks` by `file_id`
- Shared axios instance in `api/shared/api.config.ts`
- Enum-based component states — no loose strings
- Optimistic UI for delete — list updates instantly, no re-fetch
- Service Object pattern — `CvsApi = { uploadCVs, listCVs, deleteCV }`
- DTOs live in the API layer, not in component interfaces
- Routes centralized in `src/config/routes.config.ts`
