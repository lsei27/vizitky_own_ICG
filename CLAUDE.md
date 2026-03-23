@AGENTS.md

# Project: Vizitky Own ICG

Digital business card application.

## Stack
- **Framework:** Next.js 16.2.1 (App Router, Turbopack)
- **Language:** TypeScript (strict)
- **Database:** Neon Postgres via Prisma 7 + `@prisma/adapter-neon`
- **Hosting:** Vercel (auto-deploy from GitHub `main`)
- **Repository:** git@github.com:lsei27/vizitky_own_ICG.git

## Database
- Prisma schema: `prisma/schema.prisma` (provider: `postgresql`)
- Prisma config: `prisma.config.ts` (reads `DATABASE_URL` from env)
- Neon project: `weathered-band-61218733` (aws-eu-central-1)
- Connection via `@prisma/adapter-neon` in `src/lib/prisma.ts`
- **Prisma 7 breaking change:** No `url` in `datasource` block — connection URL goes in `prisma.config.ts` only
- Run `prisma generate` before build (already in `package.json` build script)

## Environment Variables
- `DATABASE_URL` — Neon Postgres connection string (set in `.env` locally, Vercel env for production)
- `.env` files are gitignored (except `.env` which has the DB URL for Prisma CLI)

## Project Structure
- `src/app/[slug]/` — Public business card page (dynamic route)
- `src/app/admin/` — Admin panel for card CRUD + QR code generator
- `src/app/actions/card.ts` — Server actions for card operations
- `src/app/api/vcard/[id]/` — vCard download endpoint
- `src/lib/prisma.ts` — Prisma client singleton

## Deployment
- Vercel project: `vizitky-own-icg`
- Production URL: https://vizitky-own-icg.vercel.app
- Git push to `main` triggers auto-deploy
