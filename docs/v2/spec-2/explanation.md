# Spec 2 — CV List + Delete: Explanation

---

## Frontend — CvList

### Overview

```
Component mounts
      │
      ▼
useEffect → fetchCVs → GET /api/cvs
      │
      ├── 0 CVs → ListState.Empty
      └── N CVs → ListState.List → renders rows
                        │
                  click trash icon
                        │
                        ▼
                  AlertDialog (confirm)
                        │
                  confirm delete
                        │
                        ▼
              deleteCV → removes item from local array
                        │
              if last one → ListState.Empty
```

REMEMBER:
→ The component only renders based on state — it makes no decisions
→ All logic lives in the hook
→ The dialog opens and closes without manual state management

---

### States

```
LOADING → (renders nothing, avoids flash)
        │
        ├── 0 CVs → EMPTY  — empty message + subtext
        └── N CVs → LIST   — one row per CV
                              │
        ERROR ───────────────┘  — error message
```

REMEMBER:
→ Loading renders nothing to avoid layout flashes
→ Empty and List are explicit states, not just `array.length === 0`

---

### Optimistic delete

```
Click confirm
      │
      ▼
setDeletingId(fileId)       — button shows "..." and is disabled
      │
      ▼
API DELETE /api/cvs/:fileId
      │
      ▼
setCvs(prev.filter(...))    — item removed WITHOUT re-fetch
      │
      ▼
toast.success()
      │
      ▼
setDeletingId(null)
```

Optimistic = the UI updates before the server confirms. Like crossing something off a list before being told it was actually done.

REMEMBER:
→ The item disappears instantly from the list
→ `deletingId` prevents double-clicks during deletion

---

## Backend — `listCVs` and `deleteCV`

### Why grouping?

There is no CVs table. Each CV is stored as N rows in `cv_chunks`, one per text chunk.

```
What's in the DB:              What we want to return:

maria.pdf  chunk 1             maria.pdf  → 12 chunks
maria.pdf  chunk 2   ──▶
maria.pdf  chunk 3             juan.pdf   → 8 chunks
...x12 rows
juan.pdf   chunk 1
...x8 rows
```

Think of it as a receipt book where each line is a page of a book. To know how many books you have, you need to count pages grouped by title.

### How `reduce()` works

```
Input rows:
[ maria chunk1, maria chunk2, juan chunk1, maria chunk3 ]
        │
        ▼ reduce() iterates row by row
        │
iteration 1: acc = { maria: { chunks: 1 } }
iteration 2: acc = { maria: { chunks: 2 } }
iteration 3: acc = { maria: { chunks: 2 }, juan: { chunks: 1 } }
iteration 4: acc = { maria: { chunks: 3 }, juan: { chunks: 1 } }
        │
        ▼ Object.entries() converts the object to an array
        │
[ { fileId: "maria", chunks: 3 }, { fileId: "juan", chunks: 1 } ]
        │
        ▼ .sort() orders by most recent first
```

REMEMBER:
→ `reduce()` is like keeping a tally: each row adds 1 to its CV's count
→ `Object.entries()` turns the tally into a list at the end

---

### `deleteCV`

```
DELETE /api/cvs/maria.pdf
        │
        ▼
Does any chunk exist with that file_id?
        │
No ──▶ CV_NOT_FOUND (404)
        │
Yes ──▶ DELETE FROM cv_chunks WHERE file_id = "maria.pdf"
        │
        ▼
{ fileId: "maria.pdf", deletedChunks: 12 }
```

REMEMBER:
→ Deleting a CV = deleting all its rows in `cv_chunks`
→ Check existence first to return a clear 404

---

## Summary

```
→ No CVs table — data is built by grouping cv_chunks
→ listCVs fetches all rows and groups them in Node with reduce()
→ deleteCV removes all rows for a file_id in one query
→ Controller returns 404 for not found, 500 for other errors
→ Nothing new in the DB — everything comes from the existing table
```
