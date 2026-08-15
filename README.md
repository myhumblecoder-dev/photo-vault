> **Retired — not maintained.**
>
> photo-vault was a pilot: the first project built end-to-end through Spike's
> full SDLC (triage → planner → grind → release), 2026-08-11/12. It shipped a
> complete epic and a deployment, and it was never finished — there is no auth
> secret, no real database, and nobody can log in.
>
> It is kept as a record, not as a product. Thomas does not want the app; what
> it was for was finding out where the pipeline breaks, and it did that well:
> the auth-mock allowlist, server actions in a directory, destructured exports,
> the pure-module banner and the Next 16 `proxy.ts` deploy limit were all found
> here first, and all are fixed in Spike.
>
> Do not send work here. See `myhumblecoder-dev/lacrosse-grind` for the
> maintained project.

# Photo Vault

## Problem Statement

multiuser photo storage web app where signed-in users upload, organise and browse their own photos in albums

## Solution Statement

Personal photo storage web app with album organization and secure user authentication

Built with Next.js (App Router, TypeScript), Tailwind, Prisma + PostgreSQL, and Zod.

## Getting Started

### Prerequisites

- Node.js + [pnpm](https://pnpm.io)
- [Docker](https://www.docker.com) (for the local Postgres)

### Run it locally

```bash
cp .env.example .env.local   # local secrets (gitignored); DATABASE_URL → compose Postgres
docker compose up -d     # start Postgres on localhost:5432
pnpm install
pnpm prisma db push      # apply the Prisma schema
pnpm dev                 # http://localhost:3000
```

Tear down the database with `docker compose down` (add `-v` to wipe its data).
