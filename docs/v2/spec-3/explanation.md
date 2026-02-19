# Spec 3 — Navigation Layout: Explanation

---

## Overview

```
src/app/layout.tsx
        │
        ├── <Navbar />         ← shared across all routes
        └── {children}
              │
              ├── /cvs   ──▶ <CvUploader /> + <CvList />
              └── /chat  ──▶ <Chatbot />
```

REMEMBER:
→ `layout.tsx` is the shell — Navbar lives here once, not in each page
→ `page.tsx` files just render the component for that route

---

## Navbar

```
┌──────────────────────────────────────────────────┐
│  CV Screener AI              CVs (3)     Chat    │
└──────────────────────────────────────────────────┘
                               ▲            ▲
                         badge with     plain link
                         live count
```

### How the badge stays in sync

```
useEffect([pathname])
        │
        ▼
CvsApi.listCVs()
        │
        ▼
setCount(res.data.total)
```

Every time the user navigates to a different route, the badge re-fetches. This covers uploads, deletions, and any other change.

REMEMBER:
→ `pathname` from `usePathname()` is the dependency — it changes on every navigation
→ No global state needed — a simple `useEffect` + `useState` is enough

---

## User flow

```
First time                  Returning user
──────────                  ──────────────

Enter /cvs                  Enter /cvs
    │                           │
    ▼                           ▼
Empty state                 See CV list
    │                           │
    ▼                           ├── Upload more CVs
Upload CVs                      │
    │                           ▼
    ▼                       Go to /chat
See list                        │
    │                           ▼
    ▼                       Ask questions
Go to /chat
    │
    ▼
Ask questions
```

---

## Summary

```
→ layout.tsx is the shell — Navbar lives here once, shared by all routes
→ /cvs combines CvUploader and CvList in one page
→ /chat moves the existing Chatbot to its own route
→ The badge re-fetches on every navigation with useEffect([pathname])
→ No global state, no context — just a simple pattern
```
