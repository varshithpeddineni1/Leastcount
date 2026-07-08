# CLAUDE.md

Orientation for Claude Code working in this repo. Read this, then `rules.md` (the constitution) and `.specify/least-count-spec.md` (the gameplay contract) before doing anything. Where this file and `rules.md` disagree, `rules.md` wins.

Least Count is an **online-only, real-time, 2–8 player** hidden-hand card game. v1 is **account-free** — players are guests with a nickname; there is no login. Do not build accounts, friends, leaderboards, history, an admin dashboard, local mode, or AI in v1 — all deferred.

---

## Golden rules (the ones that bite if ignored)

- **The server is the only authority on game state (ARC-5).** The client never decides whose turn it is, whether a move is legal, or whether the game is over. It renders what the server confirms.
- **Never leak a hand (ARC-6, SEC-6).** A client receives only its *own* hand (private channel), plus other players' card *counts*, the draw-pile count, and the top discard. Other hands are revealed only in the round-over payload. Never send full round state to a client. Never log a hand.
- **The card engine is pure (ARC-1).** Scoring, set validation, deck scaling, reshuffle, declare resolution — no I/O, no DB, no sockets. It must be unit-testable in isolation.
- **Every payload is zod-validated (CODE-2)** — REST bodies *and* every Socket.io event, both directions.
- **TDD, ≥80% coverage, no override (TEST-1, TEST-2, DOD-1).**
- **PR-only, squash-merge, one approval, green checks (GIT-4..7).** Never push to main.
- **Schema changes only via versioned migrations (DB-2).** Never hand-edit schema.

---

## Stack

Node.js + Express (REST: accounts, session, history, leaderboard reads) + Socket.io (real-time play). Postgres (system of record, `node-pg-migrate`). React + Vite + TypeScript frontend (Vercel). `express-session` + `argon2`. Vitest + supertest (unit/integration) and Playwright (e2e). Hetzner VPS under PM2, behind Nginx and Cloudflare.

TypeScript everywhere. ESLint + Prettier enforced.

---

## Repo layout (target)

```
rules.md                     # constitution (authority)
.specify/least-count-spec.md # gameplay contract
CLAUDE.md  AGENTS.md
docs/adr/                    # ADRs (DOD-5)
shared/                      # zod schemas + shared types for socket/REST payloads
server/
  src/engine/                # PURE card engine, no I/O (ARC-1)
  src/services/              # business logic: rooms, moves, declare, rematch (ARC-2)
  src/http/                  # thin REST handlers
  src/realtime/              # thin Socket.io handlers
  src/db/                    # queries + migrations
client/                      # React + Vite + TS; tokens + [data-theme] (ARC-3/3a)
e2e/                         # Playwright
docker-compose.yml
.github/workflows/ci.yml     # the eight blocking layers (CI-4)
```

The engine lives server-side only. Because play is server-authoritative, the client must not contain game-rule logic. `shared/` holds payload schemas/types used by both sides, not game logic.

---

## Commands (wire these as npm scripts)

- `npm run setup` — install, copy `.env.example` to `.env`, start Postgres, run migrations
- `docker-compose up` — full local stack; onboarding target under 30 min (OP-2)
- `npm run dev` — server + client with reload
- `npm run migrate` / `npm run migrate:create <name>` — versioned migrations only (DB-2)
- `npm run lint` / `npm run format` — ESLint / Prettier
- `npm run typecheck` — `tsc --noEmit`
- `npm test` / `npm run coverage` — Vitest + supertest, coverage gate ≥80%
- `npm run test:e2e` — Playwright suite
- `npm run test:e2e:ui` — Playwright with a browser, for capturing verification screenshots

---

## Environment

All config comes from env vars (CODE-3); document every one in `.env.example` with a description and no real value (REPO-5). Secrets never committed (SEC-1). Expect at least: `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD_HASH`, `PORT`, `CLIENT_ORIGIN`.

---

## Architecture invariants specific to this game

- **Redacted state (ARC-6):** build the per-player view server-side; a separate private `hand:update` carries only the recipient's cards. Assume any object sent to a client is public.
- **Thin handlers, fat services (ARC-2):** REST and socket handlers validate + delegate; room/game creation, move validation, declare scoring, rematch, forfeiture live in services.
- **Append-only moves (DB-6):** the `moves` log is never updated or deleted, ordered per round, so rounds replay.
- **Invite codes (API-5, API-6):** unguessable, collision-checked, admit to one room only, lock on full (8) or start; stale/full codes return a clear "not joinable", never silent success.
- **Deck auto-scaling:** a second 54-card deck is shuffled in when `players × hand_size` would leave the draw pile too small (spec §1). Duplicates are fine — only values matter.
- **Draw-pile reshuffle:** on exhaustion, reshuffle the discard (minus its top) into a new draw pile.
- **Leaderboard scoping (deferred):** no leaderboards in v1. When added later, only online games between registered players count and a guest's side is never recorded (API-9).
- **Guests only (v1, SEC-2, API-7):** every player is a guest identified by a nickname; no accounts. The `players` row is a guest row that a later migration can upgrade in place when accounts arrive (SEC-3), so build without login now and add it without rework later.
- **Real-time, not polled (API-8):** moves/presence/game-over are pushed over Socket.io. REST never polls live state.
- **WebSocket upgrade (OP-4):** Nginx must forward upgrade headers so Socket.io works behind the reverse proxy — verify this in the deploy path.

---

## Definition of done (DOD)

A change is done only when: all tests pass and total coverage ≥80% (DOD-1); you've shown *evidence* — command output, test result, or screenshot — not a claim (DOD-2); any UI change is verified through Playwright with a screenshot (DOD-3); affected docs (README, `.env.example`, `rules.md`) are updated in the same PR (DOD-4); and any significant decision is recorded as a short ADR under `docs/adr/` (DOD-5).
