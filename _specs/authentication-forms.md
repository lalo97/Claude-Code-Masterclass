# Spec for authentication-forms

branch: claude/feature/authentication-forms
figma_component (if used): N/A

## Summary

Add functional authentication forms to the `/login` and `/signup` pages. Each page renders a form with email and password fields, a toggle to show/hide the password, and a submit button. On submission, form data is logged to the console. Users can easily navigate between the two forms via a link.

## Functional Requirements

- The `/login` page renders a login form with:
  - An email input field
  - A password input field with a show/hide toggle icon
  - A "Login" submit button
  - A link to navigate to the `/signup` page
- The `/signup` page renders a signup form with:
  - An email input field
  - A password input field with a show/hide toggle icon
  - A "Sign Up" submit button
  - A link to navigate back to the `/login` page
- Clicking the hide/show password icon toggles the password field between `type="password"` and `type="text"`
- On form submission, the email and password values are logged to the console (no API call required at this stage)
- Default form submission behaviour (page reload) is prevented
- Light client-side validation runs on submit:
  - Email field must not be empty and must be a valid email format
  - Password field must not be empty and must be at least 6 characters
  - Inline error messages are shown beneath the relevant field when validation fails
  - The form does not log to the console if validation fails

## Figma Design Reference (only if referenced)

N/A

## Possible Edge Cases

- User submits form with empty fields — error messages should appear, nothing logged to console
- User toggles password visibility multiple times in succession
- User navigates between login and signup using the keyboard (tab/enter)

## Acceptance Criteria

- `/login` page displays a form with email, password, and a submit button labelled "Login"
- `/signup` page displays a form with email, password, and a submit button labelled "Sign Up"
- The password field has a clickable icon that toggles visibility between hidden and visible
- Submitting either form with valid inputs logs `{ email, password }` to the console
- Submitting with an invalid or empty email shows an error message beneath the email field
- Submitting with a missing or too-short password shows an error message beneath the password field
- Each form includes a link to switch to the other form (login ↔ signup)
- No page reload occurs on form submission

## Open Questions

- Should the toggle icon use a specific icon library already in the project, or a simple text/SVG fallback? try to use the existing one
- Should the "switch form" link be styled as a button or plain anchor text? It should be a button.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Renders the login form with email, password fields and a submit button
- Renders the signup form with email, password fields and a submit button
- Clicking the password toggle icon changes the input type from "password" to "text" and back
- Submitting with valid data calls console.log with the entered email and password
- Submitting with an empty email shows a validation error and does not log
- Submitting with an invalid email format shows a validation error and does not log
- Submitting with a password shorter than 6 characters shows a validation error and does not log
- Each form contains a link that points to the other auth page
