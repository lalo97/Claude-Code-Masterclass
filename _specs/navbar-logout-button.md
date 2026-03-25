# Spec for navbar-logout-button

branch: claude/feature/navbar-logout-button
figma_component: LogoutButton — https://www.figma.com/design/lW5tlirDWRVczVrdQMecMg/Page-Designs?node-id=57-18

## Summary

Add a Logout button to the `Navbar` component. When clicked, it signs the current user out via Firebase Auth. The button is only rendered when a user is authenticated (i.e. `user` is non-null in `UserContext`). No redirect behaviour is required at this stage.

## Functional Requirements

- Render a "Logout" button inside the `Navbar` component.
- Use the `useUser` hook to access the current `user` from `UserContext`.
- Only show the button when `user` is not null (i.e. user is logged in).
- On click, call Firebase Auth's `signOut` to sign the user out.
- No redirect or navigation should occur after logout at this stage.

## Figma Design Reference

- File: Page-Designs — https://www.figma.com/design/lW5tlirDWRVczVrdQMecMg/Page-Designs?node-id=57-18
- Component name: LogoutButton
- Key visual constraints:
  - Outlined button style: transparent background with a 1px solid white border
  - Rounded corners: 10px border radius
  - Dimensions: approx. 127px wide × 38px tall
  - Label: "Logout" — white text, Inter Regular, 16px, letter-spacing -0.31px, centered
  - Sits on the dark navbar background

## Possible Edge Cases

- `signOut` throws an error (e.g. network issue) — should not crash the UI; log the error at minimum.
- Button briefly visible during auth state hydration before `user` is confirmed — ensure the button is hidden until the auth state is resolved.

## Acceptance Criteria

- The Logout button is visible in the `Navbar` when a user is logged in.
- The Logout button is NOT visible in the `Navbar` when no user is logged in.
- Clicking the button calls Firebase Auth `signOut`.
- After clicking, the button disappears (because `user` becomes null and the condition hides it).
- The button matches the Figma design: outlined white border, rounded, white "Logout" label.

## Open Questions

- Should an error state (toast, alert) be shown if `signOut` fails? Just log it.
- Will a redirect be added in a follow-up spec, or as part of this one? No.

## Testing Guidelines

Create a test file in `./tests` for the Logout button behaviour. Focus on the following cases without going too heavy:

- Button renders in the `Navbar` when a logged-in user is present in context.
- Button does NOT render in the `Navbar` when no user is in context.
- Clicking the button calls `signOut` from Firebase Auth.
