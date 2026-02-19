# Spec 4 — Refactoring: Explanation

---

## Overview

Six improvements applied to clean up the codebase before continuing with new features.

```
src/app/navbar/          src/components/custom/navbar/
src/app/cv-list/    ──▶  src/components/custom/cv-list/
src/app/cv-uploader/     src/components/custom/cv-uploader/
src/app/chatbot/         src/components/custom/chatbot/
```

---

## 1. Folder structure

### Before

```
src/app/
├── navbar/
├── cv-list/
├── cv-uploader/
├── chatbot/
├── cvs/page.tsx
└── chat/page.tsx
```

### After

```
src/
├── app/
│   ├── cvs/page.tsx
│   └── chat/page.tsx
├── components/
│   └── custom/
│       ├── navbar/
│       ├── cv-list/
│       ├── cv-uploader/
│       └── chatbot/
└── config/
    └── routes.config.ts
```

REMEMBER:
→ `src/app/` is only for Next.js routing (pages and layouts)
→ Reusable components belong in `src/components/`

---

## 2. DTOs in the API layer

### Before

`CvListResponse` and `DeleteCvResponse` were defined in `CvList.interface.ts` — a component file.

### After

They live in `src/api/cvs/cvs.dto.ts` — the API layer.

```
cvs.dto.ts  ──  CvListResponse, DeleteCvResponse
      │
      ▼
cvs.api.ts  ──  imports from cvs.dto.ts
      │
      ▼
use-cv-list.hook.ts  ──  imports CvItem from CvList.interface (still in component)
```

REMEMBER:
→ Types that describe API responses belong in the API layer, not in components
→ Component interfaces only define what the component itself needs

---

## 3. Routes config

### Before

```ts
href="/cvs"
href="/chat"
```

Magic strings scattered across the codebase.

### After

```ts
// src/config/routes.config.ts
export const ROUTES = {
  cvs: '/cvs',
  chat: '/chat',
};

// Navbar.component.tsx
href={ROUTES.cvs}
href={ROUTES.chat}
```

REMEMBER:
→ One place to change routes — no hunting across multiple files

---

## 4. Toasts

```
Upload flow                Delete flow
──────────                 ───────────

uploadCVs()                deleteCV()
    │                          │
    ▼                          ▼
per file:              toast.success("CV deleted")
  success → toast.success()       or
  error   → toast.error()   toast.error("Failed to delete")
```

`<Toaster />` added to `layout.tsx` once — available everywhere.

---

## Summary

```
→ Components moved to src/components/custom/ — cleaner separation
→ DTOs in the API layer — types live where they belong
→ ROUTES config — no more magic strings
→ Everything in English — consistent copy
→ Sonner toasts — feedback on every user action
```
