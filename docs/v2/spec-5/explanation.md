# Spec 5 — UI/UX: Explanation

---

## CVs view — Sortable table

### Before vs after

```
Before                         After
──────                         ─────

Simple list of items           Sortable table
  - no sorting                   - click headers to sort
  - basic styling                - relative dates
  - inline uploader              - upload behind a dialog button
```

### Table structure

```
cvs/page.tsx
  │
  ├── header: "CVs" title + [+ Upload CV] button
  │                              │
  │                              ▼
  │                    CvUploaderDialog
  │                      └── Dialog
  │                            └── CvUploader (existing)
  │
  └── CvList (table)
        ├── columns (useMemo)
        │     ├── File   → FileText icon + fileId
        │     ├── Chunks → number
        │     ├── Date   → formatDistanceToNow()
        │     └── Actions → Trash2 + AlertDialog
        │
        └── footer: "X candidates"
```

### Why `useMemo` for columns

Columns are defined inside the component because they close over `deletingId` and `handleDelete`. Without `useMemo`, they would be recreated on every render, causing unnecessary table re-renders.

```
useMemo(
  () => [...columns],
  [deletingId, handleDelete]   ← only recalculate when these change
)
```

### Re-fetch after upload or delete

```
cvs/page.tsx
  │
  ├── useState(refreshKey)
  │
  ├── CvUploaderDialog onSuccess={() => setRefreshKey(k + 1)}
  │
  └── CvList refreshKey={refreshKey}
              │
              ▼
        useEffect([fetchCVs, refreshKey])  ← re-fetches when key changes
```

REMEMBER:
→ `refreshKey` is a simple integer — incrementing it triggers a re-fetch
→ No global state, no context, no event bus needed

---

## Chat view — Empty state redesign

### Before

```
Suggestions displayed flat in the conversation area
```

### After

```
┌──────────────────────────────────────────────────┐
│                                                  │
│                      🤖                          │
│                                                  │
│                CV Screener AI                    │
│           11 candidates available                │
│                                                  │
│     [Who knows Python?]  [Senior devs]  [...]    │
│                                                  │
└──────────────────────────────────────────────────┘
```

```
useEffect([])
      │
      ▼
CvsApi.listCVs()
      │
      ▼
setCandidateCount(res.data.total)
      │
      ▼
renders in empty state hero only
```

REMEMBER:
→ Count only shows in the empty state — not as a persistent subtitle
→ If the API call fails, the subtitle simply doesn't render (not breaking)

---

## Sources — Relevance score

```
part.providerMetadata?.custom?.score
        │
        ▼
Math.round(score * 100)   →  92
        │
        ▼
renders as "92%" next to filename
```

If `score` is `null` or `undefined`, nothing is rendered.

---

## Summary

```
→ CvList replaced by a sortable table — File, Chunks, Date, Actions
→ CvUploader moved into a Dialog — cleaner page layout
→ refreshKey pattern syncs table after upload or delete — no global state
→ Chat empty state redesigned — centered hero with icon and candidate count
→ Sources show relevance score as percentage when available
```
