# Spec for login-form-authentication

branch: claude/feature/login-form-authentication

## Summary

Hook up the login form in `app/(public)/login` to Firebase Auth so that users can sign in with their existing credentials. On success, display a success message in place of — or alongside — the form. No redirect is needed at this stage.

The `AuthForm` component already handles the signup flow via `createUserWithEmailAndPassword`. The login branch (`type === "login"`) currently only logs to the console and needs to be wired up with `signInWithEmailAndPassword`.

## Functional Requirements

1. When the login form is submitted with valid email and password, call `signInWithEmailAndPassword` from Firebase Auth.
2. While the request is in flight, disable the submit button and show a loading indicator (matching the pattern used in the signup flow: e.g. "Logging in…").
3. On success, display a success message (e.g. "You're logged in!") to the user. The form does not need to redirect.
4. On failure, display an appropriate inline error message:
   - Wrong password or email not found → "Invalid email or password."
   - Any other Firebase error → "Something went wrong. Please try again."
5. Existing client-side validation (empty fields, invalid email format, password length) must continue to work as-is.
6. The success message should be visually distinct and accessible (e.g. use `role="status"` or similar).

## Possible Edge Cases

- User submits with correct email but wrong password.
- User submits with an email that does not exist in Firebase.
- Firebase is temporarily unreachable (network error).
- User rapidly double-submits the form — the loading state should prevent duplicate requests.
- Form is in `"login"` mode but the shared `AuthForm` component must not break the `"signup"` flow.

## Acceptance Criteria

- [ ] Submitting valid credentials calls `signInWithEmailAndPassword` and shows a success message.
- [ ] The submit button is disabled and shows a loading label while the request is in flight.
- [ ] Wrong credentials show the error "Invalid email or password."
- [ ] Other Firebase errors show "Something went wrong. Please try again."
- [ ] Existing client-side validation errors still appear correctly.
- [ ] The signup flow (`type === "signup"`) is unaffected.
- [ ] No page redirect occurs after a successful login.

## Open Questions

- What exact wording should the success message use? Login successful.
- Should the form fields be cleared or disabled after a successful login? They should be cleared.

## Testing Guidelines

Create a test file in `tests/components/` for the login functionality. Tests should cover the following cases without going too heavy:

- Submitting valid credentials triggers `signInWithEmailAndPassword` and shows a success message.
- The submit button is disabled while loading.
- An incorrect-credentials Firebase error displays "Invalid email or password."
- A generic Firebase error displays "Something went wrong. Please try again."
- Client-side validation errors still render for empty/invalid inputs.
- The signup flow is not broken by the login changes (smoke test: `type="signup"` renders without error).
