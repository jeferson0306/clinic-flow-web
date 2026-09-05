# CLAUDE.md — clinic-flow-web

## Stack
- Next.js 16 + React 19 + TypeScript strict
- Tailwind CSS v4 (CSS-first, no tailwind.config.js)
- No auth/DB of its own — all state lives in the clinic-flow backend
  (`../clinic-flow`), reached only through `lib/api.ts` (server-only)
- GSAP for animation, Radix UI primitives, lucide-react icons (always with
  explicit `size` prop), sonner for toasts

## Design system
All colors via CSS variables — NEVER hardcode hex values. See `app/globals.css`.
Token names: `--bg-body`, `--bg-surface`, `--bg-card`, `--bg-hover`, `--border`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--color-danger`, `--color-success`.

## Naming
- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Functions: `camelCase` with verb prefix (`getUserById`, `formatCurrency`)
- Constants: `UPPER_SNAKE_CASE`

## Data flow (see README.md's Architecture section for the full picture)
- A page that only reads: a Server Component calling `lib/api.ts` directly.
- A mutation: a Server Action in `app/actions/*.ts` — never a client-side
  `fetch` to the backend, and never to the backend's own origin at all.
- Live client-side re-fetching (the appointment scheduler's free slots): go
  through `app/api/availability/route.ts`, not a new direct backend call.
- The session JWT lives only in the httpOnly cookie `lib/session.ts` manages.
  Nothing client-side should ever read or hold it.

## Validation
Client-side validation (`validations/br.ts`) is a UX nicety only — real
validation is the backend's `jakarta.validation` annotations and its brdoc
call for CPF/email/phone. Never treat a passing client-side check as proof
the backend will accept the same input.

## i18n
All UI text must go through `useTranslation().t('key')` in client components,
or `getDictionary()` from `lib/i18n-server.ts` in Server Components. Add keys
to all three of `locales/pt.json`, `locales/en.json`, `locales/es.json` —
never just one.

## Commits
Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
Do NOT include `Co-Authored-By: Claude` lines.

## Auth flow
- Unauthenticated → `/login?next=<original>` (enforced by `proxy.ts`, Next.js
  16's rename of `middleware.ts`)
- Login → `POST /v1/auth/login` via the `login` Server Action → `/dashboard`
- No registration flow — accounts are seeded by the backend, not self-serve

## Checklist before a PR
- [ ] No hardcoded colors (CSS variables only)
- [ ] No `any` in TypeScript
- [ ] `pnpm typecheck && pnpm lint && pnpm test` all pass
- [ ] i18n keys added to all 3 locale files
- [ ] Any new backend call goes through `lib/api.ts`, not a one-off `fetch`
- [ ] No `console.log` in production paths

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
