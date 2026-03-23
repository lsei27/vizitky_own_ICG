<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Prisma 7 Rules

- **No `url` in datasource block.** Connection URL is configured only in `prisma.config.ts`.
- Always run `prisma generate` before build. This is already in the `build` and `postinstall` scripts.
- Use `@prisma/adapter-neon` for the Neon Postgres connection — do NOT use `@prisma/client` directly without an adapter.
- Migrations: `npx prisma migrate dev --name <name>` (uses `prisma.config.ts` for DB URL).

# Project Conventions

- All request APIs are async in Next.js 16: `await params`, `await cookies()`, `await headers()`.
- Server actions in `src/app/actions/`.
- Prisma client singleton in `src/lib/prisma.ts` — import as `import { prisma } from '@/lib/prisma'`.
- Database: Neon Postgres (aws-eu-central-1). No SQLite.
