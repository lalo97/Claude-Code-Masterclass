# Plan: Login Form Authentication

## Context
The `AuthForm` component handles both signup and login flows. The signup branch is fully wired to Firebase Auth. The login branch currently only `console.log`s credentials. This plan wires up the login branch to `signInWithEmailAndPassword`, shows a success message ("Login successful."), clears the form fields, and adds a dedicated test file.

---

## Files to Modify

| File | Change |
|---|---|
| `components/AuthForm/AuthForm.tsx` | Implement Firebase login, add success state |
| `tests/components/AuthForm.test.tsx` | Remove stale `console.log` test, replace with success message test |
| `tests/components/AuthFormLogin.test.tsx` | New file — Firebase login integration tests |

---

## Implementation Steps

### 1. `components/AuthForm/AuthForm.tsx`

**Imports** — add `signInWithEmailAndPassword` to the existing `firebase/auth` import.

**Config** — add a `loadingText` field per type:
- `login:  { ..., loadingText: "Logging in…" }`
- `signup: { ..., loadingText: "Signing up…" }`

**State** — add:
```ts
const [successMessage, setSuccessMessage] = useState<string | null>(null);
```

**`handleSubmit` — login branch** (replace the `console.log`):
- Call `signInWithEmailAndPassword(auth, email, password)`
- On success: set `successMessage` to "Login successful.", clear `email` and `password` state
- On `auth/wrong-password`, `auth/user-not-found`, or `auth/invalid-credential`: set `authError` to "Invalid email or password."
- On any other error: set `authError` to "Something went wrong. Please try again."
- Use `loading` state + `finally` block, matching the signup pattern

**JSX changes:**
- Loading button label: `{loading ? loadingText : button}` (use config field instead of hardcoded string)
- Add success message (above submit button):
  ```tsx
  {successMessage && (
    <p role="status" className={styles.success}>
      {successMessage}
    </p>
  )}
  ```
- Add `.success` class to `AuthForm.module.css` — visually distinct from `.error` (e.g. green text)

---

### 2. `tests/components/AuthForm.test.tsx`

- Add `signInWithEmailAndPassword` to the `firebase/auth` mock
- Remove the test `"logs email and password on valid submit"` (tests old `console.log` behaviour)
- Replace it with: `"shows success message on valid login submit"` — mocks `signInWithEmailAndPassword` to resolve, submits the form, asserts `role="status"` text is "Login successful."

---

### 3. `tests/components/AuthFormLogin.test.tsx` (new file)

Mirrors the pattern of `AuthFormSignup.test.tsx`. Mocks:
- `firebase/auth` (including `signInWithEmailAndPassword`)
- `firebase/firestore`, `@/lib/firebase`, `@/lib/codename`, `next/navigation`, `next/link`

Tests:
1. Valid credentials → calls `signInWithEmailAndPassword` with correct args and shows "Login successful."
2. Valid credentials → clears email and password fields after success
3. Loading state → button disabled and shows "Logging in…" while request is in-flight
4. `auth/wrong-password` error → shows "Invalid email or password."
5. `auth/invalid-credential` error → shows "Invalid email or password."
6. Generic Firebase error → shows "Something went wrong. Please try again."
7. Smoke test → `type="signup"` renders without error (signup flow unaffected)

---

## Verification

```bash
npx vitest run tests/components/AuthForm.test.tsx
npx vitest run tests/components/AuthFormLogin.test.tsx
npm run lint
```
