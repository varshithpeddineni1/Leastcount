# Least Count Implementation Plan — from spec + design to a full build

**Status:** Draft for review
**Last updated:** July 8, 2026
**Inputs:** `.specify/least-count-spec.md`, `rules.md`, and the Claude Design prototype `design/LeastCount.dc.html` (built design-first, before Phase 1).
**Goal:** take the repo from "docs only" to the full **pure-game** online multiplayer app (2–8 players, guest nickname only, real-time play through match-over and rematch), in reviewable PR-sized phases. No phase merges without green CI and tests (DOD-1, TEST-1).

This plan is work breakdown only — no app code is written yet.

**v1 is account-free.** Accounts, friends, leaderboards, persistent history, and the admin dashboard are deferred — see "Deferred to future phases" at the end.

---

## Where we are vs. where the design points

The repo currently has: `rules.md`, `.specify/least-count-spec.md`, `CLAUDE.md`, `AGENTS.md`, and — created first, in Claude Design — the interactive prototype `design/LeastCount.dc.html`. Nothing else exists yet: no `package.json`, no schema, no server, no client.

**Important consequence of hidden information:** Least Count is server-authoritative and hidden-hand (ARC-5, ARC-6). If the Claude Design prototype includes a local, client-side simulation of the rules to make it interactive (dealing, discarding, scoring a declare), that logic is **demo-only**. It must be adapted into `server/src/engine/` as the pure, unit-tested engine (ARC-1) and **must not ship in the client** — the shipped client contains no game-rule logic and never holds another player's cards. The prototype's durable value is the visual system (tokens, layout, component set) and the screen map.

The prototype is expected to define these five screens, which map onto the spec's feature list (spec §10) with nothing out of scope and nothing in scope missing: `landing` (create / join with a nickname), `lobby`, `table` (in-game), `round-summary`, `match-over`.

> Note: the component and token names below are the plan's best prediction of what the prototype will contain. Once `design/LeastCount.dc.html` actually exists, reconcile these lists to what it really has as the first task of Phase 1.

---

## Schema (initial migration)

A single first migration, since there's no prior schema to reconcile. v1 has no accounts, so `players` are guest rows; account columns are added in a later migration when accounts arrive.

- `players` — `id`, `nickname`, `session_token`, `created_at`, `last_seen_at`.
- `games` — `id`, `invite_code` (unique), `host_player_id` (fk), `status` (lobby/in_progress/round_end/match_end/abandoned), `hand_size`, `elimination_limit`, `wrong_declare_penalty`, `winner_player_id` (nullable fk), `created_at`, `ended_at`. Mode is implicitly `online` in v1.
- `game_players` — `id`, `game_id` (fk), `player_id` (fk), `seat`, `current_score` (int, running total), `joined_at`, `left_at` (nullable), `eliminated_at` (nullable).
- `rounds` — `id`, `game_id` (fk), `round_number`, `declarer_player_id` (nullable fk), `outcome` (nullable), `started_at`, `ended_at` (nullable), plus `private_state` (jsonb) — the server-only draw-pile order, per-player hands, and discard pile, persisted so a round survives a server restart and supports reconnect. **`private_state` is never serialized to any client and never logged** (ARC-6, SEC-6).
- `moves` — `id`, `round_id` (fk), `seq`, `player_id` (fk), `action_type` (`play`/`declare`), `discarded_cards` (jsonb), `draw_source` (`deck`/`discard`, nullable), `drawn_card` (nullable), `created_at`. Append-only (DB-6) — never updated or deleted, so any round replays.
- `round_scores` — `id`, `round_id` (fk), `player_id` (fk), `hand_total`, `delta`, `was_declarer` (bool), `result` (enum), `created_at`.
- `events` — `id`, `game_id` (nullable fk), `type`, `payload` (jsonb), `created_at`. Lifecycle audit trail for observability (DB-5).
- `session` — server-side session store table (guest sessions, `connect-pg-simple`).

Indexes: `games(invite_code)` (online joins, DB-4), `game_players(game_id)`, `game_players(player_id)`, `rounds(game_id, round_number)`, `moves(round_id, seq)`.

---

## Design source & asset locations

- `design/LeastCount.dc.html` (repo root) — the Claude Design source of truth, the exported prototype. Read-only reference, not edited in place.
- `client/src/styles/tokens.css` — the extracted design tokens (OKLCH color scale for light/dark, `--accent`, `--surface`, `--border`, `--success`, `--danger`, `--warning`, card face/back colors, radii, shadows), the single styling source (ARC-3, ARC-3a).
- `client/src/components/` — translated React components (predicted): `Table`, `Seat`, `PlayerAvatar`, `HandFan`, `HandCard`, `DrawPile`, `DiscardPile`, `DeclareButton`, `TurnTimer`, `RoomCodeCard`, `InviteQrCard`, `RoundSummaryRow`, `ScoreBoard`, `BottomNav`, `ThemeToggle`, `RematchButton`, `CreateJoinForm`.
- `client/src/assets/` — icons/images the Vite build fingerprints.
- `client/public/` — static fixed-URL files (favicon, manifest, og-image).
- `server/src/engine/` — the pure card engine (ARC-1), adapted from the prototype's demo logic where present: `cards.ts` (model, point values, hand total), `sets.ts` (legal single/same-rank-set validation), `declare.ts` (correct vs wrong declare scoring, including ties against the declarer), `deck.ts` (build, auto-scale to a second deck, shuffle, reshuffle on exhaustion). No I/O in any of these.

---

## Phases (each = one PR)

### Phase 1 — Foundations: tokens, schema, pure card engine

Three things everything else depends on, bundled since none is independently useful until the others exist:

- **Design tokens + components:** extract `design/LeastCount.dc.html`'s OKLCH tokens (light + dark) into `client/src/styles/tokens.css`; wire the prototype's font pairing; build the shared components the screens reuse. ARC-3: components consume tokens only. ARC-3a: a theme toggle drives `[data-theme]`, persisted, defaulting to `prefers-color-scheme`.
- **Schema + migrations:** the initial migration (schema above) via `node-pg-migrate`.
- **Pure card engine:** the `server/src/engine/` files above — hand-total scoring, legal-set validation, declare resolution, deck auto-scaling, reshuffle. Adapt any rules logic from the prototype; keep it I/O-free (ARC-1).

**Verify:** a component-gallery preview page + a Playwright screenshot in both light and dark theme; migration up/down clean on a scratch database; unit tests covering hand-total scoring across all values, a valid set accepted and a mixed-rank discard rejected, a correct declare vs a wrong declare including a tie against the declarer, the deck auto-scaling threshold, and draw-pile reshuffle on exhaustion (TEST-3).

### Phase 2 — Rooms and lobby

- **Room creation + join:** create a room (returns an unguessable, collision-checked invite code — API-6), validate/join by code, seat assignment, host designation, host-transfer on leave. Codes admit to one room only and lock once the room is full (8) or the match has started; a stale/full/started code returns a clear "not joinable", never silent success (API-5). Room-create and room-join are rate-limited (API-10).
- **Live lobby presence:** players joining/leaving appear in real time over Socket.io (API-8) — the lobby is not polled. Host-only `game:start`.
- **Frontend:** `landing` (nickname, then create / enter code) → `lobby` (roster, seats, invite link + QR via `RoomCodeCard`/`InviteQrCard`, host's start button, match options). Each screen defines loading/empty/error/success (ARC-4).

**Verify:** supertest/socket integration for create + join, code locking on full/start, and rate limiting; Playwright "create a room → open the invite link in a second context → both players appear in the lobby → host starts."

### Phase 3 — Real-time round play

The heart of the game. `server/src/realtime/` — one round played end to end across N connected clients:

- `turn:play` (discard a single card or a same-rank set, then draw from `deck` or the top `discard` only), validated server-side against the authoritative round state (ARC-5); `turn:declare` at the start of a turn.
- **Redacted state (ARC-6):** each client receives its own hand via a private `hand:update`, plus only other players' card **counts**, the draw-pile count, and the top discard. `move:applied` never reveals a drawn card to others. Hands are revealed only in `round:over`, which carries per-player totals, deltas, and results computed by the engine.
- **Disconnect / reconnect:** presence marked on drop; reconnect within the grace window restores the seat and re-sends the private hand + redacted state; on turn-deadline expiry for a disconnected player, the server auto-plays a safe default (discard the single highest-value card, draw from the closed deck) as the authority, logged as an event. Grace-period and turn-deadline durations are open decisions below.

**Frontend:** `table` — your `HandFan`, other players as `Seat`/`PlayerAvatar` card-count avatars, `DrawPile`/`DiscardPile`, `TurnTimer`, and discard/draw/declare controls enabled only when the server confirms the action is legal → `round-summary` on `round:over`.

**Verify:** Socket.io integration tests (two-plus connected test clients) for join into a started game, a full round to a declare, rejecting an illegal set or out-of-turn play over the socket, and disconnect → grace → auto-play; a redaction assertion that no payload to a client ever contains another player's cards; Playwright driving multiple browser contexts through a round to a declare.

### Phase 4 — Match lifecycle

Wraps Phase 3's single round into a full match:

- Cumulative scoring across rounds; elimination when a player's total reaches or exceeds the limit (default 100); `match:over` when one player remains, with the winner and final scores; a player who leaves mid-match is treated as eliminated (forfeiture).
- Rematch handshake — reuse the room and host, re-seat present players, inherit options, reset scores, deal fresh (mutual-accept vs immediate is an open decision below).

**Frontend:** `round-summary` running scores between rounds → `match-over` (winner, final scores, rematch vote).

**Verify:** engine/integration tests for multi-round accumulation, elimination at the limit, the same-round tie-break, and forfeiture-as-elimination; Playwright "play multiple rounds across two-plus clients until a player crosses the limit → match-over shows the winner → rematch deals a new round."

### Phase 5 — Deploy

Nginx reverse-proxy config (including the WebSocket upgrade headers Socket.io needs, OP-4), PM2 process file (OP-3), Hetzner VPS setup steps, Cloudflare DNS/SSL pointed at the VPS, Vercel deploy for `client/` with `CLIENT_ORIGIN` / API + socket base URL wired via env (the split-origin setup: client on Vercel, real-time backend on Hetzner), and a runbook (`docs/runbook.md`) for deploy/restart/logs/rollback (OP-5).

**Verify:** live domain reachable off-network; a full online match played end to end between two real devices through the deployed stack, including a mid-game reconnect; health-check endpoint green.

---

## Cross-cutting

- **Real-time discipline (API-8):** online-game state changes — moves, presence, round/match over — are pushed via Socket.io as they happen, never polled. Settle the disconnect/reconnect grace-period and turn-deadline durations early in Phase 3, since they affect both the socket server and the frontend's "opponent disconnected" UI.
- **Server-authoritative + hidden-hand (ARC-5, ARC-6):** true from Phase 2 onward. The client never decides turn/legality/game-over and never receives another player's cards; the redacted per-player view is assembled server-side and the private `hand:update` is the only channel carrying a hand.
- Coverage stays ≥80% every phase (TEST-2); the card engine stays pure (ARC-1).
- **Observability (OBS-1/2):** structured JSON logging from Phase 1 onward, every relevant log line carrying a `gameId` — including across a disconnect/reconnect in Phase 3. **No hand is ever logged** (SEC-6).
- Playwright runs in CI on every PR + push (CI-2, TEST-4); reports/traces uploaded as artifacts.
- Each phase is a branch → PR → the eight blocking CI layers green (CI-4) + one human review (GIT-5) → squash-merge (GIT-6/7). There is no separate AI review agent; judgment-level concerns (spec conformance, service-layer boundaries, hidden-hand privacy) rest on human review. `main` is protected (REPO-2).
- **Field alignment with the prototype:** invite-code format (e.g. `LC-XXXXX` — `LC-` prefix + chars from an alphabet excluding ambiguous characters); locked rule values carried consistently — hand size 5, A=1 / 2–10 face / J,Q,K=10 / Joker=0, two jokers (not wild), wrong-declare penalty 40, elimination limit 100.

---

## Open decisions to settle before the phase they block

- **Disconnect grace period + turn deadline:** exact durations (proposed 30s turn / 60s reconnect grace) — blocks Phase 3.
- **Auto-play on timeout:** confirm the safe default (discard highest single card, draw from the closed deck) — blocks Phase 3.
- **Online rematch:** mutual-accept (all present players confirm) vs. immediate restart — blocks Phase 4.
- **Elimination tie-break:** when multiple players cross the limit in the same round, spec proposes lowest cumulative wins — confirm before Phase 4.
- **Spectators / late join:** spec proposes none in v1 (room locks on start) — confirm before Phase 2.
- **Backend deploy mechanism:** GitHub Actions SSH-deploy step vs. a pull + PM2-reload script on the VPS — decide before Phase 5.

---

## Deferred to future phases

Not built in v1; each requires its own spec update before being built. None of the v1 phases depend on them, and the data model supports adding them without rework (a guest `players` row upgrades in place when accounts arrive, SEC-3):

- **Accounts** — optional register/login (argon2, server-side session), upgrading a guest row in place so its history is preserved (SEC-3, API-7).
- **Friends** — friend search/request/accept, reusable friend-invite links distinct from game codes (SEC-4).
- **Leaderboards** — global and friend, derived on read, scoped to games between registered players; a guest's side never persisted (API-9, DB-7).
- **Persistent match history** — a registered player's past results.
- **Admin dashboard** — read-only view over the events table (active players, games in progress, games over time, outcome distribution), real argon2 admin auth (SEC-2, SEC-10, OBS-3).
- **Local same-device play** and **AI opponents.**
