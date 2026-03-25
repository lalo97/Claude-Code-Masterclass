# Plan: Auth State Management with useUser Hook

## Context

The app has Firebase Auth initialized (`lib/firebase.ts` exports `auth`) but no mechanism to track the signed-in user globally. Components have no way to know who is logged in. This plan wires up a React Context provider around `onAuthStateChanged` so any component can call `useUser()` and get `{ user, loading }` in real time.

Spec: `_specs/auth-state-management.md`
Branch: `claude/feature/auth-state-management`

---

## Implementation Order

### 1. Create `context/UserContext.tsx` (new file)

- Add `"use client"` at top
- Define `UserContextType = { user: User | null; loading: boolean }` (import `User` from `firebase/auth`)
- `const UserContext = createContext<UserContextType | undefined>(undefined)` — `undefined` default lets `useUser` detect missing provider
- `UserProvider` component:
  - State: `user: User | null` (initial `null`), `loading: boolean` (initial `true`)
  - `useEffect` with empty deps: call `onAuthStateChanged(auth, (firebaseUser) => { setUser(firebaseUser); setLoading(false) })` — store return value and call it in cleanup
  - Render `<UserContext.Provider value={{ user, loading }}>{children}</UserContext.Provider>`
- `useUser` hook (named export): calls `useContext(UserContext)`, throws `new Error("useUser must be used within a UserProvider")` if result is `undefined`, otherwise returns value
- Export: `UserProvider` and `useUser` as named exports; `UserContext` stays private
- `auth` imported from `@/lib/firebase`

### 2. Create `tests/components/UserContext.test.tsx` (new file)

Mock strategy at top of file:
- `vi.mock("firebase/auth", ...)` — mock `onAuthStateChanged` as `vi.fn()` that captures callbacks without calling them by default; returns a mock unsubscribe `vi.fn()`
- `vi.mock("@/lib/firebase", ...)` — export `auth: {}` stub

Five test cases using `renderHook(() => useUser(), { wrapper: UserProvider })` from `@testing-library/react`:
1. `loading: true, user: null` on initial render (before `onAuthStateChanged` callback fires)
2. `loading: false, user: mockUser` after callback fires with a user object
3. `loading: false, user: null` after callback fires with `null`
4. Throws `"useUser must be used within a UserProvider"` when called without provider
5. Unsubscribe function is called on `unmount()`

Follow existing patterns: `beforeEach(() => vi.restoreAllMocks())`, globals enabled.

### 3. Modify `app/layout.tsx`

- Import `UserProvider` from `@/context/UserContext`
- Wrap `{children}` inside `<UserProvider>`:
  `<body><UserProvider>{children}</UserProvider></body>`
- No other changes — `metadata` export and Server Component nature are unaffected (importing a Client Component into a Server Component is valid in Next.js App Router)

### 4. Modify `components/Navbar/Navbar.tsx` and `Navbar.module.css`

**Navbar.tsx:**
- Add `"use client"` as first line
- Import `useUser` from `@/context/UserContext`
- Import `Avatar` from `@/components/Avatar`
- Destructure `{ user, loading }` from `useUser()` inside the component
- Add an avatar area alongside the existing `<ul>`:
  - `loading === true` → render `<div className={styles.avatarSkeleton} />`
  - `user !== null` → render `<Avatar name={user.displayName ?? user.email ?? "User"} />`
  - otherwise → render nothing (logged-out state in dashboard)

**Navbar.module.css:**
- Add `.avatarSkeleton` class: `48×48px`, `border-radius: 9999px`, subtle background color, `animation: pulse`
- Add `@keyframes pulse` (0%/100% opacity 1, 50% opacity 0.4)

### 5. Modify `tests/components/Navbar.test.tsx`

- Add `vi.mock("@/context/UserContext", () => ({ useUser: () => ({ user: null, loading: false }) }))` at the top
- Existing two test assertions remain unchanged

---

## Critical Files

| File | Action |
|------|--------|
| `context/UserContext.tsx` | Create — core of the feature |
| `app/layout.tsx` | Modify — add `UserProvider` wrapper |
| `components/Navbar/Navbar.tsx` | Modify — add `"use client"`, `useUser`, Avatar/skeleton |
| `components/Navbar/Navbar.module.css` | Modify — add `.avatarSkeleton` styles |
| `tests/components/UserContext.test.tsx` | Create — 5 test cases for hook/provider |
| `tests/components/Navbar.test.tsx` | Modify — add `useUser` mock to fix existing tests |

---

## Verification

1. Run `npm run test` — all existing tests pass, new `UserContext.test.tsx` tests pass (5 cases)
2. Run `npm run dev` and open the app — no console errors about missing provider
3. Run `npm run lint` — no TypeScript or ESLint errors

## Out of Scope
These are explicity NOT included:
- Login/Signup/Logout flow implementation.
- Firebase auth integration in LoginForm/SignupForm.
- Logout button or user menu.
- Only create the hook and implement it in the Navbar (with their respective tests), hook should NOT be implemented anywhere else.