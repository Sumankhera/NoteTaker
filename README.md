# NoteTaker

An authenticated rich-text notes app. See [SPEC.MD](./SPEC.MD) for the full technical spec.

## Stack

- Next.js 16 + TypeScript + Tailwind CSS 4
- `bun:sqlite` (raw driver, no ORM) — schema defined by hand in `lib/db.ts`
- better-auth 1.7.1 (email/password) — mounted at `app/api/auth/[...all]/route.ts`
- TipTap rich-text editor (planned, Phase 3)

## Getting started

```bash
bun install
bun run dev
```

Visit `http://localhost:3000` — it redirects to `/authenticate` (sign in / sign up) or `/notes` depending on session state.

## Commands

- `bun run dev` — start the dev server
- `bun run build` — production build
- `bun run start` — run the production build
- `bun run lint` — lint

## Status

Phase 1 (Foundation) + authentication page built. Notes CRUD, rich text, autosave, and public sharing (Phases 2–6) are not yet implemented — see SPEC.MD §30.

`dev.db` is a local SQLite file, gitignored, created automatically on first run.
