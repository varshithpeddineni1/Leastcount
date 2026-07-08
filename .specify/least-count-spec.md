# Least Count — Online Multiplayer Spec (v1)

**Status:** Draft for approval · **Lives at:** `.specify/least-count-spec.md` · **Authority:** below `rules.md`, above defaults (per SDD-3).

This spec is the authoritative gameplay contract for Least Count v1. Code SHALL NOT be written for a feature until this spec is approved (SDD-2). Any divergence between spec and code is resolved in the same pull request (SDD-3).

---

## 0. Scope

**In scope (v1):** Online real-time multiplayer only, and **account-free**. 2–8 players join a private room by invite link or QR code, identified by a nickname alone — there is no login. v1 is exactly the game: create a room, lobby, real-time play, round and match scoring, elimination, and rematch.

**Out of scope (v1), deferred to future phases:** player accounts (login/register), friends, leaderboards, persistent match history, the admin dashboard, local same-device play, AI opponents, matchmaking queue, sequences/runs as a discard type, joker-as-wild, and a host-configurable hand size.

---

## 1. Card model and values

- The card engine is pure and unit-testable, with no I/O (per ARC-1).
- Base deck: standard 52 cards plus 2 jokers (54).
- **Deck auto-scaling:** when `players × hand_size` would leave the draw pile too small (rule: draw pile after the deal must hold at least `2 × players` cards), a second 54-card deck is shuffled in. Duplicate cards are harmless because only point values matter. For 2–8 players at hand size 5 the threshold is crossed at 8 players (40 dealt from 54 leaves 14, which is `< 16`), so 8-player tables use two decks.
- **Point values:** Ace = 1; 2–10 = face value; Jack = 10; Queen = 10; King = 10; Joker = 0.
- Jokers are **not wild** in v1. A joker is simply a 0-point card that is valuable to hold.
- A player's **hand total** is the sum of the point values of the cards in their hand.

---

## 2. Room lifecycle

A room moves through these states. The server is the sole authority on the current state (ARC-5).

1. **lobby** — created by a host. Players join via invite code until the host starts or the room fills (max 8). Minimum 2 players to start.
2. **in_progress** — a match is running (one or more rounds).
3. **round_end** — a round has been scored; a short interstitial before the next round deals.
4. **match_end** — one player remains un-eliminated; the winner is shown and a rematch may be offered.
5. **abandoned** — the room emptied or was closed.

**Host:** the room creator is the host and is the only player who may start the match and set match options (elimination limit, wrong-declare penalty). If the host leaves, host transfers to the next-seated remaining player.

**Invite codes** (per API-5 / API-6): each code is unguessable (random string, sufficient entropy, collision-checked) and single-purpose — it admits players to *this one room only* and stops accepting joiners once the room is full or the match has started. A stale or full code returns a clear "game not joinable" response, never a silent success.

---

## 3. Turn structure and legal moves

Play proceeds clockwise by seat order. At the start of the deal, the top card of the draw pile is flipped to seed the discard pile.

On your turn you take **exactly one** of two actions:

**A. Play (discard, then draw):**
1. **Discard** either a single card, or two-or-more cards of the *same rank* (a set). All discarded cards go face-up on the discard pile; when a set is discarded, its cards are placed so that exactly one is the current top card.
2. **Draw** exactly one card, from either:
   - the **closed draw pile** (face-down), or
   - the **top card of the discard pile only** (a player may not rummage the pile or take a non-top card of a previously discarded set).

**B. Declare** (see §4). Declaring is only available at the *start* of your turn, before any discard or draw. There is no threshold — a player may declare on any of their turns.

**Legality (server-authoritative, per ARC-5):** the client never decides whose turn it is, whether a discard is a legal set, which draw sources are available, or whether the game is over. It renders only what the server confirms. Illegal or out-of-turn moves are rejected with a clear socket error event (API-3) and the game state is unchanged.

**Draw pile exhaustion:** if the draw pile empties, the discard pile is reshuffled (all but its current top card) to form a new draw pile.

---

## 4. Declaring ("Show") and round scoring

When the current player declares at the start of their turn, all hands are revealed and the round is scored:

- Let the declarer's hand total be `D`. Let the lowest hand total among **all** players in the round be `L`.
- **Correct declare** — the declarer is *strictly* lowest (`D < L` for every other player, i.e. no one ties or beats them): the declarer scores **0** this round; every other player scores **their own hand total**.
- **Wrong declare** — any other player has a total **≤ `D`** (a tie counts against the declarer): the declarer scores a **+40 penalty** this round. Every player who actually holds the lowest total (`= L`) scores **0**; all remaining players score their own hand total.
- Round scores are added to each player's cumulative match score. Lower is better.

Ties among non-declarers for lowest: every player at `L` scores 0.

---

## 5. Match structure and elimination

- The match runs as a sequence of rounds. Cumulative scores carry across rounds.
- **Elimination limit: 100** (a host-set option, default 100). When a player's cumulative score **reaches or exceeds 100**, they are eliminated and take no further rounds.
- The match ends when **one player remains un-eliminated**; that player wins. (If all remaining players cross the limit in the same round, the player with the lowest cumulative score wins.)
- **Wrong-declare penalty** (default 40) and **elimination limit** (default 100) are the two host-configurable match options in v1.

---

## 6. Real-time contract (Socket.io)

All online-game state — moves, presence, and game-over — is pushed over Socket.io as it happens; REST is never used to poll for live game state (API-8). Every event payload is validated and typed with a zod schema (CODE-2). Every log line carries the game id for end-to-end tracing across reconnects (OBS-2).

**Client → Server**
- `room:create` `{ nickname, options: { eliminationLimit, wrongDeclarePenalty } }`
- `room:join` `{ inviteCode, nickname }`
- `room:leave` `{}`
- `game:start` `{}` (host only)
- `turn:play` `{ discard: CardRef[], drawSource: "deck" | "discard" }`
- `turn:declare` `{}`
- `rematch:vote` `{ vote: boolean }`

**Server → Client (broadcast, redacted per §7)**
- `room:state` — lobby roster, seats, host, options, room status
- `game:state` — the redacted per-player view (see §7)
- `turn:begin` `{ seat, turnDeadline }`
- `move:applied` `{ seat, discardCount, topDiscard, drawSource }` (never reveals a drawn card's identity to others)
- `round:over` `{ perPlayer: { seat, handTotal, delta, result }, revealedHands }`
- `match:over` `{ winnerSeat, finalScores }`
- `presence:update` `{ seat, connected }`
- `error` `{ code, message }` — clear JSON shape, never leaking stack traces, SQL, or file paths (API-3)

**Server → Client (private, that socket only)**
- `hand:update` `{ cards: Card[] }` — the recipient's own hand only.

---

## 7. Server-authoritative state and privacy

The full round state (draw pile order, every player's hand, discard pile) lives **only** on the server and is persisted server-side (jsonb) so it survives a process restart and a reconnect. It is **never** sent wholesale to any client.

Each client receives a **redacted** `game:state` containing: its own full hand (via the private `hand:update`), for every other player only a **card count** (never card identities or values), the draw pile **count**, the current **top discard card**, whose turn it is with the turn deadline, and all cumulative scores. Hands of other players are revealed only in the `round:over` payload after a declare.

---

## 8. Disconnect, reconnect, and abandonment

- On disconnect, the player's seat is marked disconnected (`presence:update`) and a **reconnect grace window** starts.
- **Reconnect** within the window restores the player's seat and re-sends their private hand and the current redacted state. The game id ties the reconnected session to the same game in logs (OBS-2).
- If it is a disconnected player's turn and the **turn deadline** passes, the server auto-plays a safe default to keep the table moving: discard the single highest-value card, draw from the closed deck. This is applied by the server as the authority, logged as an event.
- Repeated timeouts / grace-window expiry mark the player **left**; play continues with the remaining players. A player who leaves mid-match forfeits their standing (treated as eliminated for match-end purposes).
- If only one player remains connected and un-eliminated, they win by default.

---

## 9. Rematch

After `match:over`, players may vote to rematch (`rematch:vote`). A rematch reuses the same room and host, re-seats the still-present players, inherits the match options, resets cumulative scores, and deals a fresh round.

---

## 10. Screen states

Every screen defines explicit **loading, empty, error, and success** states (ARC-4). Colors come only from design tokens with a light/dark `[data-theme]` cascade; no hard-coded color values in components (ARC-3 / ARC-3a).

- **Landing / create-or-join** — enter a nickname, then create a room or enter an invite code.
- **Lobby** — roster, seats, invite link + QR, host's start button, options.
- **Table (in-game)** — your hand, other players as card-count avatars around the table, draw pile count, top discard, whose turn + timer, discard/draw/declare controls (enabled only when the server says the action is legal).
- **Round summary** — revealed hands, per-player deltas, running scores.
- **Match over** — winner, final scores, rematch vote.

---

## 11. Data model sketch (Postgres, snake_case per DB-3)

Schema changes only via versioned migrations (DB-2). Names indicative, to be finalized in the migration PR. v1 has no accounts, so players are guest rows; account columns are added in a later migration when accounts arrive.

- `players` — `id`, `nickname`, `session_token`, `created_at`, `last_seen_at`.
- `games` — `id`, `invite_code` (indexed, DB-4), `host_player_id`, `status`, `hand_size`, `elimination_limit`, `wrong_declare_penalty`, `created_at`, `ended_at`. Mode is implicitly `online` in v1.
- `game_players` — `game_id`, `player_id`, `seat`, `current_score`, `joined_at`, `left_at`, `eliminated_at`.
- `rounds` — `id`, `game_id`, `round_number`, `declarer_player_id`, `outcome`, `started_at`, `ended_at`, plus `private_state` (jsonb) — the server-only draw-pile order, per-player hands, and discard pile, persisted for restart/reconnect. **`private_state` is never serialized to any client and never logged** (ARC-6, SEC-6).
- `moves` — **append-only, ordered per round** (DB-6): `id`, `round_id`, `seq`, `player_id`, `action_type` (`play` | `declare`), `discarded_cards` (jsonb), `draw_source`, `drawn_card`, `created_at`. Never updated or deleted, so any round can be replayed.
- `round_scores` — `round_id`, `player_id`, `hand_total`, `delta`, `was_declarer`, `result`.
- `events` — game lifecycle audit trail (DB-5): `created`, `joined`, `disconnected`, `reconnected`, `completed`, `abandoned`.
- `session` — server-side session store table (guest sessions).

Indexes: `games(invite_code)`, `game_players(game_id)`, `game_players(player_id)`, `rounds(game_id, round_number)`, `moves(round_id, seq)`.

---

## 12. Testing obligations (per Part IX)

- **Unit (pure engine, no I/O):** hand-total scoring; legal-set validation; correct- vs wrong-declare scoring including ties; deck auto-scaling threshold; draw-pile reshuffle on exhaustion.
- **Socket integration:** join; move validation (reject illegal set and out-of-turn play); declare scoring; disconnect/reconnect; rematch.
- **Playwright e2e:** create a room and join via invite link; play a full round to a declare across two-plus simulated clients; a full match to elimination.

---

## 13. Open questions (resolve before or during the implementation PR)

1. Reconnect grace window and turn deadline durations (proposed: 30s turn, 60s reconnect grace).
2. Whether a spectator/late-arrival may watch (proposed: no in v1 — room locks on start).
3. Minimum viable presence indicator for the QR path on mobile share sheets.
4. Exact tie-break wording when multiple players cross the elimination limit in the same round (spec proposes lowest cumulative wins).
