# Spec 4 — Refactoring: Plan

Six improvements applied before continuing with new features.

## Changes

### 1. Move components to `src/components/custom/`

Move these folders out of `src/app/`:

```
src/app/navbar/      →  src/components/custom/navbar/
src/app/cv-list/     →  src/components/custom/cv-list/
src/app/cv-uploader/ →  src/components/custom/cv-uploader/
src/app/chatbot/     →  src/components/custom/chatbot/
```

Update imports in `layout.tsx`, `cvs/page.tsx`, and `chat/page.tsx`.

### 2. Trash icon — replace emoji with lucide icon

Replace `🗑️` with `<Trash2 size={16} />` from `lucide-react` inside a shadcn `Button variant="ghost" size="icon"`.

### 3. Move DTOs to `cvs.dto.ts`

Create `src/api/cvs/cvs.dto.ts` with:
- `CvListResponse`
- `DeleteCvResponse`

Remove them from `CvList.interface.ts`. Update imports in `cvs.api.ts` and `use-cv-list.hook.ts`.

### 4. Centralize routes

Create `src/config/routes.config.ts`:

```ts
export const ROUTES = {
  cvs: '/cvs',
  chat: '/chat',
};
```

Replace magic strings in `Navbar.component.tsx`.

### 5. English copy

Translate all UI messages to English:
- `CvUploader.config.ts`
- `CvList.config.ts`
- Reset button in `CvUploader.component.tsx`
- Metadata description in `layout.tsx`

### 6. Toasts

Install `sonner`. Add toasts for:
- Upload: one toast per file (success or error)
- Delete: success or error toast

Add `<Toaster />` to `layout.tsx`.

---

## Files affected

```
src/components/custom/           ← new home for all custom components
src/api/cvs/cvs.dto.ts           ← new file
src/config/routes.config.ts      ← new file
src/components/custom/cv-list/
  CvList.interface.ts            ← remove DTOs
  CvList.config.ts               ← English
  use-cv-list.hook.ts            ← add toasts
  CvList.component.tsx           ← Trash2 icon
src/components/custom/cv-uploader/
  CvUploader.config.ts           ← English
  CvUploader.component.tsx       ← English reset button
  use-cv-uploader.hook.ts        ← add toasts
src/components/custom/navbar/
  Navbar.component.tsx           ← use ROUTES
src/app/layout.tsx               ← English metadata + <Toaster />
```
