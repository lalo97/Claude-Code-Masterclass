# Spec for use-heists-hook

branch: claude/feature/use-heists-hook

## Summary

Create a `useHeists` custom hook that subscribes to real-time Firestore data from the heists collection. The hook accepts a single `mode` argument (`'active'`, `'assigned'`, or `'expired'`) and returns a typed array of `Heist` objects matching that mode's query constraints. Once the hook is in place, use it on the heists dashboard page to display the titles of all three result sets.

## Functional Requirements

- The hook is named `useHeists` and lives in `hooks/useHeists/`.
- It accepts one required argument: `mode: 'active' | 'assigned' | 'expired'`.
- It returns a `Heist[]` array that updates in real-time via a Firestore `onSnapshot` listener.
- Query logic per mode:
  - **`active`** — heists where `assignedTo` equals the current authenticated user's UID, and `deadline` is greater than today (not yet passed).
  - **`assigned`** — heists where `createdBy` equals the current authenticated user's UID, and `deadline` is greater than today (not yet passed).
  - **`expired`** — heists where `deadline` is less than or equal to today (passed), AND `finalStatus` is **not** null. No user filter applies.
- The hook must use the existing `heistConverter` so returned objects conform to the `Heist` type.
- The Firestore listener must be cleaned up (unsubscribed) when the component unmounts or when `mode` changes.
- The hook should read the current user from the existing auth context/session.
- On the heists dashboard page (`app/(dashboard)/heists/page.tsx`), call `useHeists` three times — once per mode — and render only the `title` of each result underneath its corresponding section heading.

## Possible Edge Cases

- The current user is not authenticated when the hook runs (should return an empty array and not attempt a Firestore query).
- A mode's query returns zero results (render an empty list gracefully with no errors).
- The `deadline` field comparison must use a Firestore `Timestamp` for the "now" boundary, not a plain JS `Date`, to ensure correct server-side comparisons.
- `mode` changing at runtime (e.g. tab switching) must tear down the previous listener before establishing a new one.

## Acceptance Criteria

- `useHeists('active')` returns only heists where `assignedTo` is the current user and the deadline is in the future.
- `useHeists('assigned')` returns only heists where `createdBy` is the current user and the deadline is in the future.
- `useHeists('expired')` returns only heists where the deadline has passed and `finalStatus` is not null.
- All three result sets update in real time without a page refresh.
- The heists dashboard page renders each heist's `title` under the correct section heading for all three modes.
- No Firestore listener leak occurs when the component unmounts.

## Open Questions

- Should the hook also expose a `loading` boolean so the UI can show a skeleton/spinner while the initial snapshot loads? yes.
- Should `expired` heists be filtered by the current user at all, or remain a global view as currently specified? they should remain as global view.
- Are there Firestore composite index requirements for the `assignedTo` + `deadline` and `createdBy` + `deadline` compound queries that need to be created manually? no there are no requirements.

## Testing Guidelines

Create a test file in `tests/` for the new hook and cover the following cases, without going too heavy:

- Returns an empty array when there is no authenticated user.
- Returns an empty array when the Firestore query yields no results.
- Returns the correctly shaped `Heist[]` for each mode using mocked snapshot data.
- Unsubscribes from the Firestore listener when the hook unmounts.
- Re-subscribes with the correct query when the `mode` argument changes.
