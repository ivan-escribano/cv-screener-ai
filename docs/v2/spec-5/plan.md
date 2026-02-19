# Spec 5 — UI/UX: Plan

Two views updated: CVs and Chat.

---

## CVs view

### What changes

- `CvList.component.tsx` → replaced by a sortable table (`@tanstack/react-table` + shadcn `Table`)
- `CvUploader` → moved into a `Dialog`, triggered by `[+ Upload CV]` button
- `cvs/page.tsx` → new layout: header with title + button, table, footer with count

### Table columns

| Column  | Sortable | Content |
|---------|----------|---------|
| File    | Yes      | `FileText` icon + fileId |
| Chunks  | Yes      | number |
| Date    | Yes      | relative string (date-fns) |
| Actions | No       | `Trash2` button → `AlertDialog` |

### Steps

1. Install `@tanstack/react-table` and `date-fns`
2. Rewrite `CvList.component.tsx` with `useReactTable` + `useMemo` for columns
3. Create `CvUploaderDialog.component.tsx` — wraps `CvUploader` in a shadcn `Dialog`
4. Update `cvs/page.tsx` — header with title + button, `refreshKey` state to trigger re-fetch

### No backend changes needed

The existing API (`GET /api/cvs`, `DELETE /api/cvs/:fileId`) covers everything.

---

## Chat view

### What changes

- `Chatbot.component.tsx` → empty state redesigned with centered hero + candidate count
- `ChatbotMessageSources.component.tsx` → shows relevance score as percentage if available

### Steps

5. Update `Chatbot.component.tsx` — fetch candidate count on mount, show in empty state hero
6. Update `ChatbotMessageSources.component.tsx` — read `metadata?.score`, display as `%`

---

## Files affected

```
src/components/custom/cv-list/
  CvList.component.tsx              ← rewrite (sortable table)
  use-cv-list.hook.ts               ← accept refreshKey prop

src/components/custom/cv-uploader/
  CvUploaderDialog.component.tsx    ← new file
  CvUploader.component.tsx          ← accept onSuccess callback

src/components/custom/chatbot/
  Chatbot.component.tsx             ← new empty state design
  sub-components/chatbot-message-sources/
    ChatbotMessageSources.component.tsx  ← score display

src/app/cvs/
  page.tsx                          ← new layout
  cvs.module.css                    ← new file
```
