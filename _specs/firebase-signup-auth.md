# Spec for Firebase Signup Authentication

branch: claude/feature/firebase-signup-auth

## Summary

Hook up the existing signup form (`AuthForm` with `type="signup"`) to Firebase Authentication. On successful account creation, generate a random PascalCase displayName from three word sets and set it on the user's Firebase Auth profile. Also create a document in the Firestore `users` collection storing the user's `id` and `codename` (the generated displayName), but not their email.

## Functional Requirements

- When the signup form is submitted and client-side validation passes, call `createUserWithEmailAndPassword` using the `auth` export from `@/lib/firebase`.
- After a successful signup, generate a random displayName by picking one word from each of three distinct word sets and joining them in PascalCase (e.g. `SilentCrimsonFox`).
- Update the Firebase Auth user profile with `updateProfile` to set the generated `displayName`.
- Create a document in the Firestore `users` collection (using the `db` export from `@/lib/firebase`) with the following fields only:
  - `id` — the Firebase Auth user's UID
  - `codename` — the generated displayName
- Do NOT store the user's email in Firestore.
- Only use the Firebase web SDK (`firebase/auth`, `firebase/firestore`).
- Show a loading/pending state on the submit button while the async operation is in progress.
- Display a user-friendly error message if Firebase returns an auth error (e.g. email already in use, weak password).
- On success, redirect the user to the dashboard (heist list page).

## Possible Edge Cases

- Firebase throws an error for a duplicate email address — surface a friendly message.
- Firebase throws a weak-password error — surface a friendly message (though client-side already validates length ≥ 6).
- Network failure during signup — surface a generic error message.
- `updateProfile` or Firestore document creation fails after the user account is created — the auth account still exists; handle gracefully without crashing.
- The word sets for codename generation must be large enough to avoid frequent collisions, though uniqueness is not strictly required.

## Acceptance Criteria

- Submitting the signup form with valid credentials creates a new Firebase Auth user.
- The created user's `displayName` in Firebase Auth is set to a randomly generated PascalCase string composed of one word from each of three word sets.
- A document exists in the `users` Firestore collection with the fields `id` and `codename` matching the created user, and no `email` field.
- An appropriate error message is shown inline on the form when signup fails (duplicate email, etc.).
- The submit button is disabled or shows a loading state while the request is pending.
- On success, the user is redirected to the dashboard.
- No email address is written to Firestore at any point.

## Open Questions

- Should the three word sets be stored in a separate utility file or inline in the component/hook? new file.
- What is the exact redirect path for the dashboard after signup? should be redirected to /heists
- Should `updateProfile` failure silently swallow the error or block signup completion? only log the error.

## Testing Guidelines

Create a test file(s) in the `./tests` folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Successful signup: mocks `createUserWithEmailAndPassword`, `updateProfile`, and Firestore `setDoc`; asserts all three are called with correct arguments, and that the user is redirected on success.
- Duplicate email error: mock Firebase returning an `auth/email-already-in-use` error and assert the correct error message is displayed.
- Generic Firebase error: mock an unexpected Firebase error and assert a fallback error message is shown.
- Loading state: assert the submit button is disabled or shows a loading indicator while the async operation is pending.
- Codename generation: unit test the word-picker utility to verify it produces a PascalCase string containing one word from each set.
