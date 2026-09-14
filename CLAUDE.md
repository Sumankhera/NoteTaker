# CLAUDE.md

We are building the app described in @SPEC.MD file. Read this file for general architectural tasks, or to double check the exact DB structure, tech stack or application architecture

Keep your reply extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

whenever working with any third party library or something, you MUST lookup the official documentation to ensure you are working 
with up to date information.
Use the DocsExplorer subagent for efficient documentation lookup.

This file provide guidance to claudecode (claude.ai/code) when working with code in the repository.

## Status

Phase 1 (Foundation) scaffolded: Next.js 16 + TypeScript + Tailwind 4 + bun:sqlite (raw driver, no ORM) + better-auth 1.7.1. Phases 2–6 not built.

Prisma has been removed (was scaffolded but never wired into runtime). Do not reintroduce it unless explicitly asked.

## Commands

Package manager: **bun**.

- `bun run dev` / `build` / `start` / `lint`

## Gotchas not in SPEC.MD

- `lib/db.ts` creates all tables with hand-written `CREATE TABLE IF NOT EXISTS` DDL — there's no migration tool. Schema changes must be added there by hand, and `IF NOT EXISTS` won't alter existing tables/columns, so column changes on an existing `dev.db` need manual `ALTER TABLE` or a fresh DB file.
- `lib/auth.ts` passes the raw `bun:sqlite` `Database` instance from `lib/db.ts` directly to `betterAuth({ database: db })` — this is a documented, supported better-auth pattern, not a Prisma adapter.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
