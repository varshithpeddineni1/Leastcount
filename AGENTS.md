# AGENTS.md

How an agent operates in this repo. This is the process contract; `CLAUDE.md` is the technical orientation and `rules.md` is the authority. Read all three before acting.

---

## The loop for every unit of work

1. **Trace to an issue (SDD-1).** No work without a GitHub issue. If none exists, open one.
2. **Check the spec (SDD-2, SDD-3).** No code for a feature until its spec is approved. The spec — `.specify/least-count-spec.md` — is the contract; if code and spec diverge, resolve it in the same PR, not by drifting.
3. **Plan first (AGENT-1).** For any non-trivial change, produce a plan in plan mode before implementing.
4. **TDD (TEST-1, AGENT-2).** Write tests before or with the code. Pure-engine logic gets unit tests; REST gets supertest; socket handlers get integration tests; critical flows get Playwright.
5. **Implement** within the guardrails: functions <50 lines, files <800 (target 200–400), nesting ≤4 with early returns (CODE-4, CODE-5); every payload zod-typed (CODE-2); every I/O path has error handling that doesn't expose internals (CODE-6).
6. **Verify with evidence (DOD-2).** Run the gates; paste output. For any UI change, drive it with Playwright and attach a screenshot — UI is not "done" without one (DOD-3, AGENT-3).
7. **Open the PR (AGENT-5).** Title carries the issue key; body is generated from the diff and fills the template. Update affected docs and add an ADR if the decision is significant (DOD-4, DOD-5).
8. **Merge only when green (GIT-4..7).** One approval, all conversations resolved, all checks passing, squash-merge. Never push to main.

---

## Branches and commits

- Branch prefixes: `feat/ fix/ refactor/ chore/ docs/ test/`, lowercase-hyphenated (GIT-1).
- A branch lives three days max; split large work into smaller PRs (GIT-2).
- Conventional Commits, e.g. `feat(room): add invite-code join flow` (GIT-3).

---

## The CI gates you must pass (CI-4)

`ci.yml` runs these as blocking jobs, no continue-on-error. Get them green locally before pushing:

1. Format (Prettier)
2. Lint (ESLint) — including custom rules rejecting hard-coded colors (ARC-3a) and committed `console.log` (OBS-1)
3. Type check (`tsc`)
4. Unit + integration tests at ≥80% coverage
5. Playwright e2e suite
6. Secret scan
7. Dependency vulnerability scan — nothing at HIGH/CRITICAL
8. Migration check — migrations apply clean on a fresh DB, snake_case, no drift

There is **no separate AI review agent**. Judgment-level concerns the gates can't check — spec/constitution conformance, service-layer boundaries (ARC-2), hidden-hand privacy (ARC-6) — are your responsibility to get right and the human reviewer's to confirm (GIT-5). Gates are green before the first feature merges and are never retrofitted (CI-6).

---

## Tooling

Agent capabilities are wired through MCP: **GitHub** (issues, PRs) and **Playwright** (e2e + verification screenshots) — AGENT-6. Keep `CLAUDE.md` and `AGENTS.md` current as build/test/verify steps change (AGENT-4).

---

## Never do this

- Put game-rule logic on the client, or let the client decide turns/legality/game-over (violates ARC-5).
- Send full round state to a client, or send/log any player's hand (violates ARC-6, SEC-6).
- Poll REST for live game state — it's pushed over sockets (violates API-8).
- Commit a secret, or read config from anything but env vars (violates SEC-1, CODE-3).
- Hand-edit the schema instead of writing a migration (violates DB-2).
- Update or delete a `moves` row (it's append-only, DB-6).
- Hard-code a color or style value in a component (violates ARC-3a).
- Build accounts, friends, leaderboards, history, or admin in v1 — all deferred; each needs its own spec update first.
- Merge with a red gate, a skipped-coverage flag, or a direct push to main.

---

## Per-issue checklist (copy into the PR body)

- [ ] Linked to its GitHub issue
- [ ] Behavior matches the spec; divergences resolved here, not deferred
- [ ] Tests written before/with the code; coverage ≥80%
- [ ] Payloads zod-validated both directions
- [ ] Server remains sole authority; no hand leaked to any client
- [ ] Evidence attached (command output / test result / Playwright screenshot for UI)
- [ ] Docs updated (README, `.env.example`, `rules.md`) as affected
- [ ] ADR added if the decision is significant
- [ ] All eight CI gates green
