# Spec for Create Heist Form

branch: claude/feature/create-heist-form

## Summary

Add a form to `app/(dashboard)/heists/create/page.tsx` that allows authenticated users to create a new heist. On submission, the form writes a new document to the Firestore `heists` collection using the `CreateHeistInput` interface and redirects the user to `/heists`. The form fetches all users from the `users` collection so the creator can assign the heist to any team member by selecting their codename. `createdAt` (server timestamp) and `deadline` (computed from a date input) are set programmatically, not entered directly by the user.

## Functional Requirements

- The page renders a form with the following user-facing fields:
  - **Title** — text input, required
  - **Description** — textarea, required
  - **Assigned To** — dropdown/select populated from the `users` Firestore collection, displaying each user's codename; stores both `assignedTo` (uid) and `assignedToCodename`
  - **Deadline** — date picker/input, required
- On page load, fetch all documents from the `users` Firestore collection to populate the assignee dropdown with codenames and their corresponding user IDs
- The currently authenticated user's uid and codename are used for `createdBy` and `createdByCodename` fields
- On submit:
  - `createdAt` is set using Firestore `serverTimestamp()`
  - `deadline` is constructed as a `Date` from the date input value
  - `finalStatus` is initialised to `null`
  - A new document is added to the `heists` collection using `addDoc` and the `CreateHeistInput` shape
  - On success, the user is redirected to `/heists`
- While the form is submitting, the submit button should be disabled to prevent double submissions
- Display an error message if the Firestore write fails

## Possible Edge Cases

- Users collection is empty — the assignee dropdown should still render (possibly with a placeholder/disabled option)
- The currently authenticated user has no codename stored — handle gracefully (fallback to empty string or uid)
- Firestore write fails mid-submission — show an inline error and re-enable the form
- User navigates away before form is submitted — no partial document should be written

## Acceptance Criteria

- [ ] Form renders all required fields: title, description, assigned-to dropdown, deadline
- [ ] Assignee dropdown is populated from the `users` Firestore collection
- [ ] Submitting a valid form creates a document in the `heists` collection with the correct shape matching `CreateHeistInput`
- [ ] `createdAt` uses Firestore `serverTimestamp()` and `finalStatus` is `null` on creation
- [ ] `deadline` is stored as a `Date` derived from the date picker value
- [ ] After successful creation the user is redirected to `/heists`
- [ ] Submit button is disabled while the form is being submitted
- [ ] An error message is shown if the Firestore write fails

## Open Questions

- Should the deadline have a minimum date constraint (e.g., cannot be in the past)? No.
- Is the assignee dropdown searchable/filterable for large teams, or a simple `<select>`? yes it should be searchable and filterable.
- Should the form support a "Save as draft" state or only a single submit action? yes lets add that support to "Save as draft".

## Testing Guidelines

Create a test file in `./tests/components/` for the create heist form, covering the following cases without going too heavy:

- Renders all form fields (title, description, assignee select, deadline)
- Assignee dropdown is populated after users are fetched from Firestore
- Submitting the form calls `addDoc` with the correct payload shape (mocked Firestore)
- Redirects to `/heists` after a successful submission
- Disables the submit button while the form is submitting
- Shows an error message when the Firestore write rejects
