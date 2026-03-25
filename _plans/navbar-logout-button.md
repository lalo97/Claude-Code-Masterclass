# Plan: Navbar Logout Button

## Context
The app has Firebase Auth and a UserContext that exposes `user` and `loading` state. The Navbar currently has no auth awareness. We need to add a Logout button that is conditionally rendered when a user is logged in and calls `signOut` on click.

---

## Files to Modify

1. `components/Navbar/Navbar.tsx`
2. `components/Navbar/Navbar.module.css`
3. `tests/components/Navbar.test.tsx`

---

## Step 1 — `components/Navbar/Navbar.tsx`

Add imports:
- `signOut` from `firebase/auth`
- `auth` from `@/lib/firebase`
- `useUser` from `@/context/UserContext`

Inside the component:
- Call `const { user, loading } = useUser()`
- Add `handleLogout` async function that calls `await signOut(auth)` in a try/catch (log errors with `console.error`)
- After the "Create New Heist" `<li>`, add:
  ```
  {!loading && user && (
    <li>
      <button className={styles.logoutBtn} onClick={handleLogout}>
        Logout
      </button>
    </li>
  )}
  ```
  Using `!loading && user` guards against a flash during auth state hydration.

---

## Step 2 — `components/Navbar/Navbar.module.css`

Add `.logoutBtn` style to match the Figma outlined white button:

```css
.logoutBtn {
  background: transparent;
  border: 1px solid white;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  letter-spacing: -0.02em;
  padding: 7px 16px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logoutBtn:hover {
  opacity: 0.85;
}
```

---

## Step 3 — `tests/components/Navbar.test.tsx`

The existing tests call `render(<Navbar />)` with no provider. Once `useUser` is added to the component, these will throw because `useUser` throws if used outside `UserProvider`. The fix is to mock the module.

Add mocks at the top of the file:
- `vi.mock("@/context/UserContext", () => ({ useUser: vi.fn() }))`
- `vi.mock("firebase/auth", () => ({ signOut: vi.fn() }))`
- `vi.mock("@/lib/firebase", () => ({ auth: {} }))`
- No `next/link` mock needed — existing Navbar tests already work without it

Add imports: `useUser` from `@/context/UserContext`, `signOut` from `firebase/auth`, `userEvent` from `@testing-library/user-event`

Add `beforeEach` that sets the default mock to `{ user: null, loading: false }`.

**New tests:**
1. Logout button renders when user is logged in — mock `useUser` to return a fake user object
2. Logout button does NOT render when user is null — already covered by default mock
3. Clicking the logout button calls `signOut` — mock user, click button, assert `signOut` was called

**Existing tests** remain unchanged (they'll pass with the `beforeEach` default mock).

---

## Verification

Run the test suite:
```bash
npx vitest run tests/components/Navbar.test.tsx
```

Manual check: run `npm run dev`, log in, confirm Logout button appears in navbar. Log out, confirm it disappears.
