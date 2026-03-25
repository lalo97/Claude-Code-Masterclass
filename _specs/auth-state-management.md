# Spec for auth-state-management

branch: claude/feature/auth-state-management

## Summary

Add a global auth state management layer using React Context so any component or page in the app can access the currently authenticated user via a `useUser` hook. The solution uses Firebase's `onAuthStateChanged` listener to keep user state in sync with the server in real time. The current user value is `null` when logged out, and a Firebase `User` object when logged in.

## Functional Requirements

- Create a `UserProvider` context provider that wraps the entire app and subscribes to Firebase's `onAuthStateChanged` listener.
- The listener updates the context value whenever the auth state changes (login, logout, or session restored on page load).
- Expose a `useUser` hook that returns the current user (`User | null`) and a loading flag (`boolean`) indicating whether the initial auth state check is still in progress.
- The `UserProvider` must be a Client Component since it uses a realtime Firebase listener.
- Place the `UserProvider` in the root app layout so it covers both the `(public)` and `(dashboard)` route groups.
- Any component or page must be able to call `useUser()` and receive the current auth state without any additional setup.
- If `useUser` is called outside of a `UserProvider`, it should throw a clear error to aid debugging.
- Update any existing components that should display or respond to the current user (e.g. `Navbar`, `Avatar`) to use `useUser` instead of hardcoded or placeholder values.

## Possible Edge Cases

- Initial render before the Firebase auth state is resolved: the user object is neither `null` (logged out) nor a `User` (logged in) — it is simply unknown. A `loading: true` state prevents premature UI decisions (e.g. flash of logged-out content).
- The Firebase listener must be unsubscribed when the `UserProvider` unmounts to prevent memory leaks.
- `onAuthStateChanged` fires asynchronously, even if a session already exists — components must handle the loading state gracefully.
- SSR / Next.js App Router: the `UserProvider` is a Client Component, so it cannot be placed inside a Server Component in a way that breaks the Server/Client boundary rules.

## Acceptance Criteria

- A `UserProvider` component exists and is rendered in the root layout, wrapping all routes.
- A `useUser` hook is available and returns `{ user: User | null, loading: boolean }`.
- `useUser` can be called from any page or component inside the app without errors.
- Calling `useUser` outside `UserProvider` throws a descriptive error.
- The `loading` flag is `true` until `onAuthStateChanged` fires for the first time, then becomes `false`.
- The `user` value updates in real time when auth state changes (no manual refresh required).
- Existing components that should display user data (e.g. `Navbar`, `Avatar`) are updated to consume `useUser`.
- The Firebase listener is unsubscribed when the provider unmounts.

## Open Questions

- Should the `Navbar` hide user-specific elements (e.g. avatar, logout button) while `loading` is `true`, or show a skeleton/placeholder? an skeleton/placeholder is fine you define it.
- Are there other pages or components beyond `Navbar` and `Avatar` that need to be updated to consume `useUser`? no.

## Testing Guidelines

Create a test file(s) in the `./tests` folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- `useUser` returns `{ user: null, loading: true }` on initial render before `onAuthStateChanged` fires.
- `useUser` returns `{ user: <mockUser>, loading: false }` after `onAuthStateChanged` fires with a logged-in user.
- `useUser` returns `{ user: null, loading: false }` after `onAuthStateChanged` fires with no user (logged out).
- Calling `useUser` outside of `UserProvider` throws a descriptive error.
- The Firebase `onAuthStateChanged` unsubscribe function is called when the provider unmounts.
