# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run test     # Run Vitest tests (watch mode)
```

Run a single test file:
```bash
npx vitest run tests/your-test-file.test.tsx
```

## Architecture

**Pocket Heist** — a task/heist management app built with Next.js App Router.

### Route Groups

- `app/(public)/` — Unauthenticated pages: splash (`/`), login, signup, preview
- `app/(dashboard)/` — Authenticated pages: heist list, create, and `[id]` detail view

Each group has its own `layout.tsx`. The dashboard layout includes the `Navbar` component.

### Path Aliases

`@/` maps to the project root (configured in `tsconfig.json`), e.g. `@/components/Navbar`.

### Components

Components live in `components/<ComponentName>/` with a `Component.tsx`, `Component.module.css`, and `index.ts` barrel export. Interactive components require `"use client"` directive.

### Styling

Tailwind CSS v4 via PostCSS. Global theme variables (colors, fonts) are defined in `globals.css` under a `@theme` block. Component-scoped styles use CSS Modules and reference globals with `@reference "../../app/globals.css"`. Global utility classes (`.btn`, `.page-content`, `.form-title`) are defined in `globals.css`.

### Testing

Vitest with jsdom environment and React Testing Library. Test files live in `tests/components/`. Globals (`describe`, `it`, `expect`) are enabled — no imports needed. Use `userEvent.setup()` for user interactions and role-based queries for accessibility. Mock Next.js modules (e.g. `next/link`) at the top of test files.

### Specs and Plans

Feature specs go in `_specs/` and implementation plans in `_plans/`. Templates exist in both directories.

## Checking Documentation

- **important:** When implementing any lib/framework-specific features, ALWAYS check the appropiate lib/framework documentation using the Context7 skill `/find-docs` before writing any code.