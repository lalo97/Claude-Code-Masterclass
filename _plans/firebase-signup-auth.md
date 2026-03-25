# Plan: Firebase Signup Authentication

## Context

The signup form (`AuthForm` with `type="signup"`) currently only does client-side validation and logs to the console. This plan wires it up to Firebase Auth and Firestore so new accounts are created, a random PascalCase codename is generated and set as the user's displayName, and a minimal user document (id + codename, no email) is written to the `users` Firestore collection. On success the user is redirected to `/heists`.

Spec: `_specs/firebase-signup-auth.md`
Branch: `claude/feature/firebase-signup-auth`

---

## Implementation Order

### 1. Create `lib/codename.ts` (new file)

- Define three distinct word arrays (adjectives, colors/descriptors, animals) with ~15–20 words each.
- Export `generateCodename(): string` — picks one word from each array via `Math.random()` and joins them in PascalCase (capitalize first letter, concat with no separator).
- Example output: `"SilentCrimsonFox"`

### 2. Modify `components/AuthForm/AuthForm.tsx`

**New imports:**
- `createUserWithEmailAndPassword`, `updateProfile` from `firebase/auth`
- `setDoc`, `doc` from `firebase/firestore`
- `useRouter` from `next/navigation`
- `auth`, `db` from `@/lib/firebase`
- `generateCodename` from `@/lib/codename`

**New state:**
- `loading: boolean` (default `false`)
- `authError: string | null` (default `null`)

**Add `const router = useRouter()` inside the component.**

**Update `handleSubmit`** — after existing validation passes, when `type === 'signup'`:
1. Set `loading = true`, `authError = null`.
2. `const credential = await createUserWithEmailAndPassword(auth, email, password)`.
3. `const codename = generateCodename()`.
4. Try `await updateProfile(credential.user, { displayName: codename })` — catch and `console.error` only, do not rethrow.
5. `await setDoc(doc(db, 'users', credential.user.uid), { id: credential.user.uid, codename })`.
6. `router.push('/heists')`.
7. On outer catch: map Firebase error codes to friendly strings:
   - `auth/email-already-in-use` → `"An account with this email already exists."`
   - `auth/weak-password` → `"Password must be at least 6 characters."`
   - anything else → `"Something went wrong. Please try again."`
   - Call `setAuthError(message)`.
8. `finally`: `setLoading(false)`.

**UI changes:**
- Render `authError` as `<p role="alert" className={styles.error}>{authError}</p>` above the submit button.
- Add `disabled={loading}` to the submit button.
- Change button label to `loading ? "Signing up…" : button`.

### 3. Create `tests/lib/codename.test.ts` (new file)

Mock strategy: none needed (pure function).

Tests:
- Returns a non-empty string.
- Result contains no spaces or hyphens.
- First character is uppercase (PascalCase).
- Mock `Math.random` to return `0` and assert a fully predictable output (first word from each set).

### 4. Create `tests/components/AuthFormSignup.test.tsx` (new file)

Mock strategy at top of file (before component imports):
- `vi.mock('firebase/auth', ...)` — mock `createUserWithEmailAndPassword` and `updateProfile` as `vi.fn()`.
- `vi.mock('firebase/firestore', ...)` — mock `setDoc` as `vi.fn()`, `doc` as `vi.fn(() => 'mock-doc-ref')`.
- `vi.mock('@/lib/firebase', () => ({ auth: {}, db: {} }))`.
- `vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }))`.
- `vi.mock('next/link', ...)` — same pattern as existing `AuthForm.test.tsx`.
- `vi.mock('@/lib/codename', () => ({ generateCodename: () => 'TestCodename' }))`.

Tests:
- **Success**: fill form, submit — assert `createUserWithEmailAndPassword` called with `(auth, email, password)`, `updateProfile` called with `{ displayName: 'TestCodename' }`, `setDoc` called with doc containing `{ id, codename: 'TestCodename' }` and no `email` field, and `mockPush('/heists')` called.
- **Duplicate email**: mock `createUserWithEmailAndPassword` to reject with `{ code: 'auth/email-already-in-use' }` — assert "An account with this email already exists." appears via `role="alert"`.
- **Generic error**: mock rejection with `{ code: 'auth/unknown' }` — assert fallback error message appears.
- **Loading state**: make the mock return a never-resolving promise — assert submit button is disabled after click.

---

## Critical Files

| File | Action |
|---|---|
| `components/AuthForm/AuthForm.tsx` | Modify — add Firebase signup logic |
| `lib/firebase.ts` | No change — `auth` and `db` already exported |
| `lib/codename.ts` | Create — word sets + `generateCodename()` |
| `tests/lib/codename.test.ts` | Create — unit tests |
| `tests/components/AuthFormSignup.test.tsx` | Create — Firebase integration tests |
| `context/UserContext.tsx` | No change — already tracks auth state |

---

## Verification

1. `npm run test` — all existing and new tests pass.
2. `npm run dev` — submit the signup form with a new email:
   - User appears in Firebase Auth console with `displayName` set.
   - Firestore `users` collection has a document with only `id` and `codename` fields.
   - Browser redirects to `/heists`.
3. Submit with an already-used email — inline error message appears.
