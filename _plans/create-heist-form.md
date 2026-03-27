# Plan: Create Heist Form

## Context

The `app/(dashboard)/heists/create/page.tsx` page is currently a skeleton with only a heading. This plan implements the full form to create a new heist document in Firestore, with a searchable assignee dropdown, save-as-draft support, and redirect to `/heists` on success.

---

## Files to Modify

- `types/firestore/heist.ts` — extend types
- `types/firestore/index.ts` — add `USERS` collection constant and `UserProfile` interface
- `app/(dashboard)/heists/create/page.tsx` — mount the new component

## Files to Create

- `components/CreateHeistForm/CreateHeistForm.tsx`
- `components/CreateHeistForm/CreateHeistForm.module.css`
- `components/CreateHeistForm/index.ts`
- `tests/components/CreateHeistForm.test.tsx`

---

## Step 1 — Update types

**`types/firestore/heist.ts`:**
- Add `status: "active" | "draft"` to both `Heist` and `CreateHeistInput`
- `heistConverter` needs no change (spread picks up new field automatically)

**`types/firestore/index.ts`:**
- Add `USERS: "users"` to `COLLECTIONS`
- Add `UserProfile` interface: `{ id: string; codename: string }` (matches the shape written during signup via `setDoc`)

---

## Step 2 — Create `CreateHeistForm.module.css`

Open with `@reference "../../app/globals.css"` (same as `AuthForm.module.css`).

Classes to define (mirror `AuthForm.module.css` conventions):
- `.form` — `flex flex-col gap-4 w-full max-w-lg mx-auto` (wider than AuthForm due to more fields)
- `.fieldGroup`, `.label`, `.input`, `.error` — identical to `AuthForm.module.css`
- `.textarea` — same as `.input` plus `resize-y` and a min-height
- `.comboboxWrapper` — `position: relative`
- `.comboboxList` — `position: absolute`, full-width, `z-index: 10`, `bg-lighter`, `border border-lighter`, `rounded-lg`, `mt-1`, `max-h-48 overflow-y-auto`
- `.comboboxOption` — `px-3 py-2 cursor-pointer` with hover state using `bg-light`
- `.buttonRow` — `flex gap-3 justify-end mt-2`
- `.btnDraft` — border-only variant (no gradient): `border border-primary text-primary rounded-lg px-4 py-2`

---

## Step 3 — Build `CreateHeistForm.tsx`

**Directive:** `"use client"`

**State:**

| State var | Type | Purpose |
|---|---|---|
| `title` | `string` | Controlled text input |
| `description` | `string` | Controlled textarea |
| `assignedToId` | `string` | UID of confirmed combobox selection |
| `assignedToCodename` | `string` | Codename of confirmed selection |
| `comboboxQuery` | `string` | Current text in combobox input (drives filtering) |
| `isComboboxOpen` | `boolean` | Dropdown visibility |
| `deadline` | `string` | Date input value (`YYYY-MM-DD`) |
| `users` | `UserProfile[]` | Fetched from Firestore on mount |
| `usersLoading` | `boolean` | True while users are being fetched |
| `submitting` | `boolean` | True while Firestore write is in flight |
| `errors` | `object` | Field validation errors keyed by field name |
| `submitError` | `string \| null` | Async error from a failed write |

**`useEffect` on mount:** Call `getDocs(collection(db, COLLECTIONS.USERS))`, map `snapshot.docs` to `UserProfile[]` via `{ id: doc.id, ...doc.data() }`, set `users` and `usersLoading: false`. On catch, set `submitError`.

**Combobox filtering:** Derived value (not state) — filter `users` where `codename.toLowerCase().includes(comboboxQuery.toLowerCase())`.

**Combobox interaction:**
- `onFocus` → `setIsComboboxOpen(true)`
- `onChange` → update `comboboxQuery`, open dropdown, clear `assignedToId` / `assignedToCodename`
- Option `onMouseDown` (not `onClick` — fires before input `onBlur`) → set selection state, set `comboboxQuery` to chosen codename, close dropdown
- Input `onBlur` → `setTimeout(() => setIsComboboxOpen(false), 150)` so option mouse-down events can fire first; reset `comboboxQuery` to confirmed codename (or empty if no selection confirmed)

**Dropdown empty/loading states:**
- Show "Loading users…" while `usersLoading`
- Show "No matching agents found." when `filteredUsers.length === 0`

**`handleSubmit(status: "active" | "draft")`:**
1. Client-side validation — check `title`, `description`, `assignedToId`, `deadline` are non-empty; set `errors` and return early if any fail
2. Guard `if (!user) return`
3. `setSubmitting(true)`, clear `submitError`
4. Build `CreateHeistInput`: `createdAt: serverTimestamp()`, all form fields, `createdBy: user.uid`, `createdByCodename: user.displayName ?? ""`, `deadline: new Date(deadline)`, `finalStatus: null`, `status`
5. `await addDoc(collection(db, COLLECTIONS.HEISTS), heistData)`
6. Success → `router.push("/heists")`
7. Catch → `setSubmitError("Failed to create heist. Please try again.")`
8. Finally → `setSubmitting(false)`

**Two buttons** (both `type="button"`, call `handleSubmit` directly from `onClick`):
- "Save as Draft" → `handleSubmit("draft")`, style `.btnDraft`
- "Create Heist" → `handleSubmit("active")`, style global `.btn`; label changes to "Creating…" while `submitting`
- Both `disabled={submitting}`

---

## Step 4 — Update `app/(dashboard)/heists/create/page.tsx`

Keep as a server component. Replace the placeholder `<h2>` with `<CreateHeistForm />`. The `center-content` and `page-content` wrappers stay as-is.

---

## Step 5 — Write `tests/components/CreateHeistForm.test.tsx`

**Mocks at top of file:**
- `vi.mock("firebase/firestore", ...)` — mock `addDoc`, `getDocs`, `collection`, `serverTimestamp`
- `vi.mock("@/lib/firebase", () => ({ db: {} }))`
- `vi.mock("next/navigation", () => ({ useRouter: vi.fn() }))`
- `vi.mock("@/context/UserContext", () => ({ useUser: vi.fn() }))`

**`beforeEach`:** Wire `useUser` → `{ user: { uid: "user-123", displayName: "SilentFox" }, loading: false }`. Wire `useRouter` → `{ push: mockPush }`. Wire `getDocs` → `{ docs: [{ id: "u1", data: () => ({ id: "u1", codename: "ShadowWolf" }) }, { id: "u2", data: () => ({ id: "u2", codename: "IronFox" }) }] }`.

**Test cases:**
1. Renders all form fields (title, description, assignee combobox, deadline)
2. Assignee dropdown shows user codenames after `getDocs` resolves
3. Submitting calls `addDoc` with correct `CreateHeistInput` payload (`status: "active"`)
4. Redirects to `/heists` after successful submission
5. Disables submit button while submitting (mock `addDoc` with never-resolving promise)
6. Shows error message when `addDoc` rejects
7. "Save as Draft" calls `addDoc` with `status: "draft"`

---

## Verification

1. `npm run dev` → navigate to `/heists/create`, fill all fields, click "Create Heist" → redirected to `/heists`, new document visible in Firestore
2. Click "Save as Draft" → document created with `status: "draft"`
3. `npx vitest run tests/components/CreateHeistForm.test.tsx` — all 7 tests pass
4. `npm run lint` — no TypeScript or ESLint errors
