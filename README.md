# Least Count

An online-only, real-time, 2–8 player hidden-hand card game. v1 is account-free: players join as guests with a nickname, via an invite link or QR code — no login required.

See [`rules.md`](./rules.md) for the engineering constitution and [`.specify/least-count-spec.md`](./.specify/least-count-spec.md) for the gameplay contract. `CLAUDE.md` / `AGENTS.md` document how an AI agent works in this repo.

## Stack

Node.js + Express (REST) + Socket.io (real-time play) · Postgres (`node-pg-migrate`) · React + Vite + TypeScript (client) · Vitest + supertest (unit/integration) · Playwright (e2e). See `rules.md` for the full locked stack and hosting model.

## Prerequisites

- Node.js 24+ (see `.nvmrc`)
- Docker (for local Postgres via `docker-compose`)
- npm 11+

## Local setup

```bash
npm run setup      # install deps, copy .env.example -> .env, start Postgres, run migrations
npm run dev        # server + client with reload
```

Or the full stack via Docker:

```bash
docker-compose up
```

Onboarding target: a fresh clone to a running local game in under 30 minutes.

## Environment variables

Documented in [`.env.example`](./.env.example): `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD_HASH`, `PORT`, `CLIENT_ORIGIN`. Copy it to `.env` and fill in local values — never commit `.env`.

## Commands

| Command                                             | Purpose                                                 |
| --------------------------------------------------- | ------------------------------------------------------- |
| `npm run dev`                                       | Server + client, with reload                            |
| `npm run migrate` / `npm run migrate:create <name>` | Versioned Postgres migrations (node-pg-migrate)         |
| `npm run lint` / `npm run format`                   | ESLint / Prettier                                       |
| `npm run typecheck`                                 | `tsc --noEmit` across workspaces                        |
| `npm test` / `npm run coverage`                     | Vitest + supertest, coverage gate ≥80%                  |
| `npm run test:e2e`                                  | Playwright suite                                        |
| `npm run test:e2e:ui`                               | Playwright with a browser, for verification screenshots |

## Repo layout

```
rules.md                     # constitution (authority)
.specify/least-count-spec.md # gameplay contract
CLAUDE.md  AGENTS.md
docs/adr/                    # architecture decision records
shared/                      # zod schemas + shared types for socket/REST payloads
server/
  src/engine/                # pure card engine, no I/O
  src/services/              # business logic: rooms, moves, declare, rematch
  src/http/                  # thin REST handlers
  src/realtime/              # thin Socket.io handlers
  src/db/                    # queries + migrations
client/                      # React + Vite + TS
e2e/                         # Playwright
docker-compose.yml
.github/workflows/ci.yml
```

## Deploying

Production runs on a Hetzner VPS under PM2, behind Nginx and Cloudflare (DNS + SSL), with the client deployed to Vercel. A full runbook lands in `docs/runbook.md` as part of the deploy phase (see `.specify/implementation-plan.md`, Phase 5) — not yet written at this stage of the build.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) and [`AGENTS.md`](./AGENTS.md) for the branch/PR/CI workflow.
