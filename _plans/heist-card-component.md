# Plan: Heist Card Component

## Context

The `/heists` page currently renders raw `<p>` tags from `useHeists`. This plan implements the `HeistCard` and `HeistCardSkeleton` components and rewires the heists page to use them, following the design spec and user-provided screenshots. Expired heists surface in a "Heist History" flat list with SUCCESS/FAILED badges below the two card sections.

---

## Files to Modify

| File | Change |
|------|--------|
| `app/globals.css` | Add `--color-border: #1e2939` to `@theme` block |
| `hooks/useHeists/useHeists.ts` | Fix loading state: init to `true`, set to `false` when `!user` |
| `app/(dashboard)/heists/page.tsx` | Full rewrite: 3 sections, 2-col grid, skeletons, history list |

## Files to Create

| File | Purpose |
|------|---------|
| `components/HeistCard/HeistCard.tsx` | Card component |
| `components/HeistCard/HeistCard.module.css` | Card styles |
| `components/HeistCard/index.ts` | Barrel export |
| `components/HeistCardSkeleton/HeistCardSkeleton.tsx` | Loading skeleton |
| `components/HeistCardSkeleton/HeistCardSkeleton.module.css` | Skeleton styles |
| `components/HeistCardSkeleton/index.ts` | Barrel export |
| `tests/components/HeistCard.test.tsx` | Component tests |

---

## Step-by-Step Implementation

### 1. `app/globals.css` — add border token

Add inside the existing `@theme` block, after `--color-body`:

```css
--color-border: #1e2939;
```

---

### 2. `hooks/useHeists/useHeists.ts` — fix loading state

- Change `useState(false)` → `useState(true)`
- Add `setLoading(false)` in the `if (!user) { return }` branch so loading resolves when there's no user

---

### 3. `components/HeistCard/HeistCard.tsx`

Props: `{ heist: Heist }`

Define a local `formatDeadline(deadline: Date)` helper that returns `{ date, countdown, overdue }`:
- `date`: `toLocaleString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })`
- If `deadline <= new Date()`: `countdown = "Overdue"`, `overdue = true`
- Else compute diff → `Xh Ym` (< 1 day) or `Xd Yh` (≥ 1 day)

Layout (flex column, gap 12px):
```
[title — Link to /heists/[id]]          [Clock 16px primary]
[User 12px]  To: @assignedToCodename    (primary color)
[User 12px]  By: @createdByCodename     (secondary color)
[CalendarDays 12px]  Dec 5, 05:00 PM • Overdue|countdown  (primary)
```

Icons from `lucide-react`: `Clock`, `User`, `CalendarDays`

Key CSS (`.module.css` with `@reference "../../app/globals.css"`):
- `.card`: `bg-lighter`, `border border-[--color-border]`, `rounded-[10px]`, `p-[21px]`, `flex flex-col gap-3`
- `.titleRow`: `flex items-start gap-2`
- `.title`: `flex-1 text-heading text-base leading-6 tracking-[-0.31px] hover:underline`
- `.clockIcon`: `text-primary shrink-0 mt-1`
- `.meta`: `flex flex-col gap-2`
- `.metaRow`: `flex items-center gap-1.5 text-sm text-body`
- `.assignee`: `text-primary`; `.creator`: `text-secondary`; `.countdown`: `text-primary`

---

### 4. `components/HeistCardSkeleton/HeistCardSkeleton.tsx`

Mirror HeistCard structure with animated placeholder elements. Reuse the `pulse` keyframe pattern from `components/Skeleton/Skeleton.module.css`.

Structure:
- Title row: long line placeholder (75%) + small circle for clock icon
- 3 meta rows: small square + short line each

CSS: same card shell as HeistCard, `.line` elements with pulse animation.

---

### 5. `app/(dashboard)/heists/page.tsx` — full rewrite

Keep `"use client"`. Add `useHeists("expired")` for Heist History.

**Sections in order:**

#### Active Heists
```
[Clock icon circle — primary]  Active Heists
loading  → 2× HeistCardSkeleton in grid
empty    → gray "No active heists." message
loaded   → 2-col grid of HeistCard
```

#### Assigned Heists
Same pattern with `Target` icon (secondary color).

#### Heist History
```
[Archive icon — body color]  Heist History
flat list of HistoryRow components
```

**`SectionHeader`** — small inline helper: icon in `rounded-full border` circle + `<h2>`.

**`HistoryRow`** — small inline helper:
- Top line (`justify-between`): title | calendar icon + date | SUCCESS/FAILED badge
- Bottom line: person icon + "To: @codename" | person icon + "By: @codename"
- Badge: `finalStatus === "success"` → green pill (`text-success border-success`); `"failure"` → red pill (`text-error border-error`)
- Rows separated by `border-b border-[--color-border]`

**Grid style** (in page CSS module):
```css
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
@media (max-width: 640px) {
  .grid { grid-template-columns: 1fr; }
}
```

---

### 6. `tests/components/HeistCard.test.tsx`

Mocks (top of file):
- `vi.mock("next/link", ...)` → plain `<a href={href}>`
- `vi.mock("@/lib/firebase", () => ({ db: {}, auth: {} }))`
- `vi.mock("@/context/UserContext", () => ({ useUser: () => ({ user: null }) }))`

Helper: `makeHeist(overrides?)` returns a valid `Heist` object.

Test cases:
1. Title renders as `<a>` with `href="/heists/[id]"`
2. Renders `@assignedToCodename` and `@createdByCodename`
3. Shows "Overdue" when `deadline` is in the past
4. Shows time remaining (matches `/\d+h \d+m/`) when `deadline` is in the future
5. Does not throw when `assignedToCodename` is empty string
6. `<HeistCardSkeleton />` renders without errors

---

## Verification

1. `npm run dev` — visit `/heists`, verify 3 sections render, skeletons appear on first paint, cards load in
2. Click a heist title → navigates to `/heists/[id]` without errors
3. `npx vitest run tests/components/HeistCard.test.tsx` — all tests pass
4. `npm run lint` — no ESLint errors
