# Spec for Heist Card Component

branch: claude/feature/heist-card-component
figma_component: HeistCard (node 14:23)

## Summary

Build a `HeistCard` component that displays a summary of a single heist. Cards are shown on the `/heists` page in a **2-column grid** for `active` and `assigned` heists. Below those sections, a **Heist History** list shows expired heists in a flat table-style layout with SUCCESS/FAILED status badges. The heist title links to the detail page (`/heists/:id`), though no content is added to the detail page yet. A `HeistCardSkeleton` component occupies the same grid layout while data is loading.

## Functional Requirements

- The `/heists` page has three sections in order: **Active Heists**, **Assigned Heists**, **Heist History**.
- **Active Heists** and **Assigned Heists**: render `HeistCard` components in a 2-column responsive grid.
- **Heist History**: renders expired heists in a flat list (not a card grid), one row per heist.
- Each `HeistCard` renders:
  - Heist title — clickable link to `/heists/[id]`
  - A clock icon (~16px, primary color) pinned to the top-right of the title row
  - Assignee row: person icon + "To:" label + `@codename` value
  - Creator row: person icon + "By:" label + `@codename` value
  - Deadline row: calendar icon + formatted date/time + bullet separator + time remaining or "Overdue"
- The time remaining display:
  - If the deadline is in the past (server-provided field): show `• Overdue` in primary color
  - If the deadline is in the future: show `• Xh Ym` or `• Xd Yh` in primary color
- Each **Heist History row** renders:
  - Left: heist title (white)
  - Center: calendar icon + formatted date/time (body color)
  - Right: status badge — "SUCCESS" (green, using `var(--color-success)`) or "FAILED" (red, using `var(--color-error)`)
  - Second line: person icon + "To: @codename" + person icon + "By: @codename" (body color labels, primary/secondary codename values)
  - Rows separated by a subtle horizontal border
- Section headers each have a small icon in a circular outline + section title:
  - Active Heists: clock icon, primary color (`var(--color-primary)`)
  - Assigned Heists: target/crosshair icon, secondary color (`var(--color-secondary)`)
  - Heist History: archive icon, body color (`var(--color-body)`)
- `HeistCardSkeleton` mirrors the card dimensions and is shown in the same 2-column grid while data loads.
- When a section has no heists, show a short empty state message in gray (`var(--color-body)`).
- The `/heists/[id]` route must exist and be reachable from the title link; its content can be empty.
- Usernames are always displayed with an `@` prefix (e.g. `@SecretSauceAgent`).

## Visual Reference (Screenshots)

The following screenshots were provided by the user and show the intended design:

### Card layout (Active + Assigned sections)
- 2-column grid of cards per section
- Card: dark background, subtle border, rounded corners, title + clock icon top-right, 3 metadata rows
- "Overdue" or time remaining ("4h 42m", "1d 0h", "2d 0h") shown inline after a bullet separator in primary color

### Full page layout
- Navbar at top (existing)
- Active Heists → 2-col card grid
- Assigned Heists → 2-col card grid
- Heist History → full-width list rows, each row: title | date | badge; secondary line: To / By

### Heist History row example
```
Reorganize the snack drawer by color    [calendar] Dec 3, 02:30 PM    [SUCCESS]
[person] To: @SilentNinja  [person] By: @WhisperKing
```

## Figma Design Reference

- File: [Page Designs — HeistCard](https://www.figma.com/design/lW5tlirDWRVczVrdQMecMg/Page-Designs?node-id=14-23)
- Component name: HeistCard (node 14:23)
- Key visual constraints:
  - Card background: `#101828` (`var(--color-lighter)`); border: 1px solid `#1e2939` (new token `--color-border` needed in `globals.css`); `border-radius: 10px`
  - Card padding: ~21px top/sides; internal gap ~12px between title area and metadata rows
  - Title text: white (`var(--color-heading)`), Inter Regular 16px, line-height 24px, letter-spacing -0.31px
  - Clock icon: ~16px, `var(--color-primary)` (purple `#C27AFF`), pinned top-right
  - Metadata rows: three rows stacked with ~8px gap; each row has a ~12px line icon + label + value; label text uses `var(--color-body)` (`#99A1AF`), 14px Regular
  - Assignee value: `var(--color-primary)`; Creator value: `var(--color-secondary)` (`#FB64B6`)
  - Deadline date/time: `var(--color-body)`; "Overdue" and time remaining use `var(--color-primary)` inline
  - No shadows or blur effects; card elevation is defined by background contrast + border only

## Possible Edge Cases

- A heist has no assignee — "To:" row should handle a null/undefined `assignedToCodename` gracefully (omit row or show a fallback).
- A heist deadline is exactly now — treat as overdue if `deadline <= now`.
- Uneven card counts — 2-column grid handles orphan cards in the last row naturally.
- Data fetch is slow — skeleton fills the same 2-column grid to prevent layout shift.
- No heists in a section — show a short empty state message in `var(--color-body)` gray.
- Heist History item has no `finalStatus` — skip or show a neutral badge.

## Acceptance Criteria

- [ ] Active and Assigned heists are displayed in separate 2-column card grids.
- [ ] Each card displays title (as link), clock icon, assignee, creator, and deadline with time remaining or "Overdue".
- [ ] The heist title links to `/heists/[id]`.
- [ ] Cards with a past deadline show `• Overdue` in primary color.
- [ ] Cards with a future deadline show `• Xh Ym` or `• Xd Yh` in primary color.
- [ ] Usernames are shown with `@` prefix.
- [ ] `HeistCardSkeleton` matches the card dimensions and appears in the same 2-column grid during loading.
- [ ] Heist History section shows expired heists in a flat list with SUCCESS/FAILED badges.
- [ ] Section headers use the correct icon and color (clock/primary, target/secondary, archive/body).
- [ ] Empty sections show a gray fallback message instead of an empty grid.
- [ ] The `/heists/[id]` route exists and renders without errors (content can be empty).
- [ ] Missing assignee does not cause a render error.

## Resolved Questions

- **Expired heists**: shown in a "Heist History" list below the card sections (not hidden).
- **"Overdue" source**: derived server-side — the `deadline` Date comes from the server; the comparison with `now` is client-side. If a dedicated `isOverdue` server field is added later, prefer that.
- **Responsive grid**: collapse the 2-column grid to 1 column on narrow viewports (mobile-first).
- **Empty state**: short message in `var(--color-body)` gray.

## Testing Guidelines

Create a test file in `tests/components/` for `HeistCard` and `HeistCardSkeleton`. Cover the following cases without going too heavy:

- Renders the heist title as a link to the correct `/heists/[id]` path
- Renders `@codename` for assignee and creator
- Shows `• Overdue` when the deadline is in the past
- Shows time remaining (e.g. `4h 42m`) when the deadline is in the future
- Handles a missing assignee without throwing
- `HeistCardSkeleton` renders without errors
- The `/heists` page renders Active, Assigned, and Heist History sections
