# Spec 3 — Navigation Layout: Plan

## Steps

1. **Create `Navbar.component.tsx`** — logo + links to `/cvs` and `/chat` with live CV count badge
2. **Update `layout.tsx`** — add shared Navbar and update metadata
3. **Create `src/app/cvs/page.tsx`** — combines `CvUploader` + `CvList`
4. **Create `src/app/chat/page.tsx`** — moves `Chatbot` here
5. **Update `src/app/page.tsx`** — `redirect('/cvs')`

---

## Routes

| Route   | Content                     |
|---------|-----------------------------|
| `/`     | Redirect to `/cvs`          |
| `/cvs`  | CvUploader + CvList         |
| `/chat` | Chatbot (existing, no changes) |

---

## File structure

```
src/app/
├── layout.tsx        ← Navbar here (shared across all routes)
├── page.tsx          ← redirect('/cvs')
├── cvs/
│   └── page.tsx      ← CvUploader + CvList
└── chat/
    └── page.tsx      ← Chatbot
```

---

## Navbar badge behavior

The badge re-fetches on every `pathname` change using `useEffect([pathname])`. This keeps the count accurate after uploading or deleting CVs from any page.

---

## Done when

- Navigating to `/` redirects to `/cvs`
- The navbar shows the CV count badge and updates after uploads and deletions
- `/cvs` shows the upload component and the CV list
- `/chat` shows the existing chatbot
