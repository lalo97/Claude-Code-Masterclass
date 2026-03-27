# Plan: Route Protection via Layout Guards

## Context
The app has two route groups — `(public)` and `(dashboard)` — but neither layout currently enforces auth. The goal is to protect dashboard routes from unauthenticated access and redirect authenticated users away from public pages. The existing `useUser` hook already provides `{ user, loading }` from Firebase's `onAuthStateChanged`. Protection goes in the layout files so it applies automatically to every route in each group.

## Approach

Convert both group layouts to client components and add auth guard logic using `useUser` and `useRouter`. While loading, render a centered `Clock8` spinner (same icon used in the app title). Once auth state is resolved, redirect if necessary; otherwise render children.

---

## Files to Modify

### 1. `app/(public)/layout.tsx`
- Add `"use client"` directive
- Import `useUser` from `@/context/UserContext`
- Import `useRouter` from `next/navigation`
- Import `Clock8` from `lucide-react`
- Logic:
  - `loading === true` → render centered `<Clock8 className="animate-spin" />`
  - `loading === false && user !== null` → `router.replace("/heists")`
  - `loading === false && user === null` → render `<main className="public">{children}</main>`

### 2. `app/(dashboard)/layout.tsx`
- Add `"use client"` directive
- Import `useUser` from `@/context/UserContext`
- Import `useRouter` from `next/navigation`
- Import `Clock8` from `lucide-react`
- Logic:
  - `loading === true` → render centered `<Clock8 className="animate-spin" />`
  - `loading === false && user === null` → `router.replace("/login")`
  - `loading === false && user !== null` → render `<><Navbar /><main>{children}</main></>`

**Loading indicator markup (both layouts):**
```tsx
<div className="center-content">
  <Clock8 className="animate-spin" size={32} strokeWidth={2.75} />
</div>
```

---

## Files to Create

### 3. `tests/components/PublicLayout.test.tsx`
Mock `@/context/UserContext` and `next/navigation`. Test:
- Renders loader when `loading: true`
- Redirects to `/heists` when `user` is present and `loading: false`
- Renders children when `user` is null and `loading: false`

### 4. `tests/components/DashboardLayout.test.tsx`
Mock `@/context/UserContext` and `next/navigation`. Test:
- Renders loader when `loading: true`
- Redirects to `/login` when `user` is null and `loading: false`
- Renders children when `user` is present and `loading: false`

**Test pattern (based on `Navbar.test.tsx`):**
```tsx
vi.mock("@/context/UserContext", () => ({ useUser: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: vi.fn() }))

const mockReplace = vi.fn()
beforeEach(() => {
  vi.mocked(useRouter).mockReturnValue({ replace: mockReplace } as any)
})
```

---

## Key Reused Utilities
- `useUser()` — `context/UserContext.tsx:30`
- `Clock8` — `lucide-react` (already used in `app/(public)/page.tsx:5`)
- `center-content` CSS class — already defined in `globals.css`

---

## Verification
1. `npm run dev` — visit `/heists` while logged out → should redirect to `/login`
2. Visit `/login` while logged in → should redirect to `/heists`
3. Both should show a spinner briefly before redirect
4. `npx vitest run tests/components/PublicLayout.test.tsx tests/components/DashboardLayout.test.tsx`
