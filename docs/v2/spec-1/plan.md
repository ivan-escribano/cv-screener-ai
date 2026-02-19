# Spec 1 — CV Upload: Plan

## Steps

### Phase 1 — Backend

1. **Install `multer`** — `npm install multer @types/multer`
2. **Create `cvs.service.ts`** — validates the file and reuses `IngestService` to extract text, chunk, embed, and store
3. **Create `cvs.controller.ts`** — extracts `req.files`, runs all files in parallel with `Promise.allSettled`, returns result per file
4. **Create `cvs.routes.ts`** — configures multer (memory storage) and registers `POST /upload`
5. **Register in `index.ts`** — `app.use('/api/cvs', cvsRouter)`
6. **Test with Postman** — happy path, duplicate, invalid PDF, file too large

### Phase 2 — Frontend

7. **Install `react-dropzone`** — `npm install react-dropzone`
8. **Create `CvUploader.interface.ts`** — `UploadState` enum + response types
9. **Create `CvUploader.config.ts`** — max size, accepted MIME types, UI messages, error code map
10. **Create `use-cv-uploader.hook.ts`** — calls `CvsApi.uploadCVs()`, manages state, fires toasts
11. **Create `CvUploader.component.tsx`** — uses `useDropzone`, renders by state
12. **Create API layer** — `api/shared/api.config.ts` + `api/cvs/cvs.api.ts` with `CvsApi`

---

## Backend module: `cvs`

```
backend/modules/cvs/
├── cvs.config.ts     ← MAX_FILE_SIZE, ERROR_CODES, SUCCESS_MESSAGES
├── cvs.interface.ts  ← CvItem type
├── cvs.service.ts    ← validate → extract → chunk → embed → store
├── cvs.controller.ts ← Promise.allSettled over all uploaded files
└── cvs.routes.ts     ← POST /upload, GET /, DELETE /:fileId
```

### Validations (in order)

1. MIME type is `application/pdf`
2. File size under 5MB
3. File is not empty
4. Text can be extracted
5. Not a duplicate (check Supabase by `file_id`)

### API contract

```
POST /api/cvs/upload
Content-Type: multipart/form-data
Body: { cvs: File[] }
```

```json
{
  "success": true,
  "data": [
    { "fileId": "maria.pdf", "success": true, "chunks": 12 },
    { "fileId": "dupe.pdf",  "success": false, "error": "DUPLICATE_FILE" }
  ]
}
```

---

## Frontend component: `CvUploader`

```
components/custom/cv-uploader/
├── CvUploader.interface.ts   ← UploadState enum + response types
├── CvUploader.config.ts      ← limits, messages, error code map
├── use-cv-uploader.hook.ts   ← state logic + API call
├── CvUploader.component.tsx  ← pure UI, renders by state
└── CvUploader.module.css

api/
├── shared/api.config.ts      ← axios instance with baseURL
└── cvs/
    ├── cvs.config.ts         ← CVS_BASE_URL
    ├── cvs.dto.ts            ← CvListResponse, DeleteCvResponse
    └── cvs.api.ts            ← CvsApi = { uploadCVs, listCVs, deleteCV }
```

---

## What NOT to touch

- Existing `ingest` module — reuse, don't modify
- Chat — untouched
- Layout/routing — that's Feature 3

---

## Done when

- A PDF can be dragged into the UI and uploaded without touching the terminal
- All states (idle, uploading, success, error) work correctly
- Frontend and backend validations reject invalid files
- A duplicate returns `DUPLICATE_FILE` instead of being stored twice
