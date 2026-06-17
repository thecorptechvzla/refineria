# GoldTrack — AGENTS.md

## Project

Single-package Next.js 16.2.6 frontend (not a monorepo). Pure prototype — all data is mock (see `services/mock/mockData.ts`), no backend, no DB, no API routes. `refineria-backend/` is an empty placeholder, not used.

Spanish UI (Peruvian locale `es-PE`).

## Commands

| Command | What |
|---|---|
| `pnpm dev` | Dev server at localhost:3000 |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint 9 (next/core-web-vitals + typescript) |

No test framework or typecheck script exists. TypeScript strict mode is on (`noEmit: true`).

## Auth

Cookie-based mock auth. Session is stored in `goldtrack_session` cookie read by `proxy.ts`. No real auth. Quick-login buttons on `/login` bypass the form.

Credentials for manual login:
- Admin: `admin@goldtrack.com` / `123` → role `ADMIN`
- Owner: `dueno@goldtrack.com` / `123` → role `OWNER`

Role switching at runtime via Header buttons calls `switchRole()` which rewrites the cookie.

## Routing & RBAC

| Route | SUPERADMIN | OWNER | ADMIN |
|---|---|---|---|
| `/` (dashboard) | Access | Access | Redirected to `/transacciones` |
| `/admin/*` | Access | — | — |
| `/transacciones` | Access | Access | Access |
| `/proveedores` | Access | — | Access |

Middleware/proxy (`proxy.ts`) enforces auth + role-based redirects. Sidebar hides links by role.

## Architecture

- **State**: React Context (`GoldContext` + `ThemeContext`). No server state library.
- **Context tree**: `ThemeProvider` > `GoldProvider` > pages
- **GoldContext** holds all state: user, suppliers, transactions, workers. Mutations (`addTransaction`, `addSupplier`) prepend to local arrays — data does not persist.
- **Theme toggle** stored in `localStorage` key `goldtrack_theme`. Light mode toggles `.light` class on `<html>`.

## Styles

Tailwind CSS v4 with `@tailwindcss/postcss`. Custom theme colors: `midnight-*` (900/800/700), `gold-*` (400/500/600). No `tailwind.config.js` theme extensions needed — colors defined in `globals.css` via CSS variables and `@theme` directive.

Light mode overrides are in `globals.css` under `.light` selector — **do not use Tailwind `dark:` variants**. The `.light` class directly overrides color values.

Key CSS patterns: `glass-panel`, `glass-panel-gold`, `bg-grid`, `glow-gold-sm`, `hud-number`, `terminal-row`.

## Imports / Paths

`@/*` maps to project root (e.g. `@/types`, `@/lib/GoldContext`).

## Dev notes

- `next.config.ts` allows tunnelmole.net origins for remote dev access.
- No `.env` files (not needed — mock-only).
- `pnpm-workspace.yaml` only disables `sharp` and `unrs-resolver` builds — not a multi-package workspace.
- Duplicate `'use client'` directive in `app/login/page.tsx` (line 2 + 4) — known artifact, benign.
