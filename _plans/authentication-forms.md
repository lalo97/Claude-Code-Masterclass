# Plan: Authentication Forms Feature

## Context

The `/login` and `/signup` pages are currently empty shells (just headings). This plan adds functional authentication forms as specified in `_specs/authentication-forms.md`: email + password inputs, password visibility toggle, client-side validation, console logging on valid submit, and cross-navigation links between the two pages.

---

## Approach: Single Shared `AuthForm` Component

Both forms are structurally identical (same fields, same validation, same toggle). A single `AuthForm` component with a `type: "login" | "signup"` prop avoids duplication. All variant-specific text (heading, button label, link destination) is derived from the `type` prop internally.

---

## Files to Create

| File | Purpose |
|------|---------|
| `components/AuthForm/AuthForm.tsx` | The shared form component |
| `components/AuthForm/AuthForm.module.css` | Scoped styles |
| `components/AuthForm/index.ts` | Barrel export |
| `tests/components/AuthForm.test.tsx` | All 8 test cases |

## Files to Modify

| File | Change |
|------|--------|
| `app/(public)/login/page.tsx` | Replace heading shell with `<AuthForm type="login" />`. Fix export name (`SignupPage` → `LoginPage`). |
| `app/(public)/signup/page.tsx` | Replace heading shell with `<AuthForm type="signup" />`. |

---

## Component Design

**Props:**
```ts
interface AuthFormProps {
  type: "login" | "signup"
}
```

**State (all in `AuthForm` via `useState`):**
- `email`, `password` — controlled input values
- `showPassword: boolean` — toggles input type
- `errors: { email?: string; password?: string }` — inline field errors

**Variant config derived from `type`:**

| `type`     | Heading (`h1`/`h2`) | Button | Link href | Link text |
|------------|---------------------|--------|-----------|-----------|
| `"login"`  | "Log in to Your Account" | "Login" | `/signup` | "Don't have an account?" |
| `"signup"` | "Signup for an Account" | "Sign Up" | `/login` | "Already have an account?" |

**Password toggle:** `Eye` / `EyeOff` icons from `lucide-react` (already installed). Button has `type="button"` and `aria-label`.

**Cross-link:** Next.js `<Link>` styled with `className="btn"` (per spec: "should be a button").

---

## Validation (runs on submit only)

```
if email is empty          → "Email is required."
else if invalid format     → "Please enter a valid email address."
if password is empty       → "Password is required."
else if password.length<6  → "Password must be at least 6 characters."
```

- Email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- `<form noValidate>` suppresses native browser validation
- On failure: `setErrors(...)`, return early (no console.log)
- On success: `setErrors({})`, `console.log({ email, password })`
- Error `<p>` elements use `role="alert"` for accessibility

---

## Key Styling Notes

- CSS module uses `@reference "../../app/globals.css"` (follows existing pattern)
- Colors use theme vars: `text-error`, `text-primary`, `bg-light`, `bg-lighter`, etc.
- Submit button: `className="btn"` (global class)
- Form heading: `className="form-title"` (global class)

---

## Implementation Order

1. `AuthForm.module.css`
2. `AuthForm.tsx`
3. `AuthForm/index.ts`
4. `app/(public)/login/page.tsx` — mount component, fix export name
5. `app/(public)/signup/page.tsx` — mount component
6. `tests/components/AuthForm.test.tsx` — all 8 tests

---

## Tests (`tests/components/AuthForm.test.tsx`)

Uses `userEvent` (v14 API) for interactions, `vi.spyOn(console, "log")` to assert logging.

| # | Test |
|---|------|
| 1 | Renders login form with email/password fields and "Login" button |
| 2 | Renders signup form with email/password fields and "Sign Up" button |
| 3 | Password toggle cycles: `"password"` → `"text"` → `"password"` |
| 4 | Valid submit calls `console.log({ email, password })` |
| 5 | Empty email → error shown, no log |
| 6 | Invalid email format → error shown, no log |
| 7 | Password < 6 chars → error shown, no log |
| 8 | Login form links to `/signup`; signup form links to `/login` |

---

## Verification

```bash
npx vitest run tests/components/AuthForm.test.tsx   # all 8 tests pass
npm run dev                                          # visit /login and /signup visually
npm run lint                                         # no lint errors
```
