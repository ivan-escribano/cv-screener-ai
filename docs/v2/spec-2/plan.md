# Spec 2 — CV List + Delete: Plan

## Steps

### Phase 1 — Backend

1. **Add `listCVs` to `cvs.service.ts`** — query `cv_chunks`, group by `file_id` using `reduce()` in Node
2. **Add `deleteCV` to `cvs.service.ts`** — check the CV exists, then delete all its chunks
3. **Add `listCVs` to `cvs.controller.ts`** — returns `{ success, data: { cvs, total } }`
4. **Add `deleteCV` to `cvs.controller.ts`** — returns 404 if `CV_NOT_FOUND`
5. **Register routes in `cvs.routes.ts`** — `GET /` and `DELETE /:fileId`
6. **Test with Postman** — list CVs, delete one, try to delete a non-existent one (expect 404)

### Phase 2 — Frontend

7. **Add `listCVs` and `deleteCV` to `cvs.api.ts`**
8. **Create `CvList.interface.ts`** — `ListState` enum + `CvItem` type
9. **Create `CvList.config.ts`** — UI messages (empty state, delete confirmation, errors)
10. **Create `use-cv-list.hook.ts`** — fetches on mount, optimistic delete with `deletingId`
11. **Create `CvList.component.tsx`** — renders by state, uses shadcn `AlertDialog` for delete confirmation

---

## What NOT to touch

- `IngestService` — not modified
- `CvUploader` — not touched
- Chat — not touched

---

## Supabase queries

```sql
-- List
SELECT file_id, COUNT(*) as chunks, MIN(created_at) as created_at
FROM cv_chunks
GROUP BY file_id
ORDER BY created_at DESC;

-- Delete
DELETE FROM cv_chunks WHERE file_id = :fileId;
```

> No new table needed — all data comes from `cv_chunks`.

---

## API

```
GET    /api/cvs
DELETE /api/cvs/:fileId
```

```json
// GET response
{
  "success": true,
  "data": {
    "cvs": [
      { "fileId": "maria.pdf", "chunks": 12, "createdAt": "2026-01-09T10:00:00Z" }
    ],
    "total": 1
  }
}

// DELETE response (200)
{ "success": true, "data": { "fileId": "maria.pdf", "deletedChunks": 12 } }

// DELETE response (404)
{ "error": "CV_NOT_FOUND" }
```

---

## Done when

- The list of uploaded CVs is visible (name, chunks, date)
- A CV can be deleted with prior confirmation
- Empty state is shown when there are no CVs
- A non-existent `fileId` returns `CV_NOT_FOUND`
