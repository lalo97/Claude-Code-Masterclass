# Spec for route-protection

branch: claude/feature/route-protection

## Summary

Add route protection to the application so that unauthenticated users cannot access dashboard pages and authenticated users are redirected away from public pages (splash, login, signup, preview). Protection is implemented in the layout files for each route group using the existing `useUser` hook. While Firebase resolves the current auth state, a simple loading indicator is shown to prevent a flash of the wrong content.

## Functional Requirements

1. The `(public)` group layout should redirect authenticated users away to the dashboard (e.g. `/heists`) so they do not see the login/signup pages again after signing in.
2. The `(dashboard)` group layout should redirect unauthenticated users to the login page (`/login`) so protected pages cannot be accessed without a session.
3. Both layouts must use the `useUser` hook to read the current user and auth loading state.
4. While the auth state is being resolved (loading), both layouts should render a simple, centered loading indicator instead of the page content.
5. Once auth state is known, the redirect (if needed) should fire immediately before the page content is rendered.
6. The loader should be minimal — no complex animation or branded styling required.

## Possible Edge Cases

- Firebase takes longer than expected to resolve auth state — the loader must remain visible until loading is complete to avoid a brief flash of protected content.
- A user manually navigates to `/login` while already authenticated — they should be immediately redirected to the dashboard.
- A user manually navigates to `/heists` while unauthenticated — they should be immediately redirected to `/login`.
- The `useUser` hook returns a loading state on first render before Firebase has responded — this must not cause a redirect to fire prematurely.
- Layouts wrap all child pages in the group, so protection applies automatically to any new routes added to the group.

## Acceptance Criteria

- [ ] Unauthenticated users visiting any `(dashboard)` route are redirected to `/login`.
- [ ] Authenticated users visiting any `(public)` route are redirected to the dashboard (`/heists`).
- [ ] A loading indicator is shown in both group layouts while `useUser` is resolving.
- [ ] No flash of protected content occurs before auth state is known.
- [ ] The existing `useUser` hook is used — no new auth logic is introduced.
- [ ] The loader is simple and visually acceptable (e.g. centered spinner or text).

## Open Questions

- Should authenticated users on public pages redirect to `/heists` specifically, or to a configurable dashboard root? You decide.
- What should the loader look like — a spinner, a pulsing placeholder, or plain text? let's make it an spinner, using the clock icon from the title.

## Testing Guidelines

Create a test file(s) in the `./tests` folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- `(dashboard)` layout renders the loader while auth state is loading.
- `(dashboard)` layout redirects to `/login` when user is null and loading is false.
- `(dashboard)` layout renders children when user is present and loading is false.
- `(public)` layout renders the loader while auth state is loading.
- `(public)` layout redirects to `/heists` when user is present and loading is false.
- `(public)` layout renders children when user is null and loading is false.
