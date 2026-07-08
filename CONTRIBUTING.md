# Contributing

This repo follows the process in [`AGENTS.md`](./AGENTS.md) and the rules in [`rules.md`](./rules.md) (the constitution — it wins on any disagreement). Read both before opening a PR.

## Workflow

1. Every change traces to a GitHub issue (SDD-1). Open one if none exists.
2. Non-trivial changes get a short plan before implementation (AGENT-1).
3. Branch from `main` using a prefix: `feat/ fix/ refactor/ chore/ docs/ test/`, lowercase-hyphenated (GIT-1). Keep a branch alive three days at most (GIT-2); split large work into smaller PRs.
4. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (GIT-3), e.g. `feat(room): add invite-code join flow`.
5. Write tests before or with the code (TDD, TEST-1). Coverage must stay ≥80% with no override (TEST-2, DOD-1).
6. Open the PR against `main` with the template filled in. All eight CI gates below must be green before review.
7. Merging needs one approval, all conversations resolved, and green checks (GIT-4/5). Merges are squash-only (GIT-6). Never push directly to `main` (GIT-7).

## Local setup

See [`README.md`](./README.md#local-setup).

## Pre-commit hooks

Husky runs on every commit (GIT-8): Prettier, ESLint (via lint-staged) on staged files, and a full-repo secret scan (`secretlint`). A merge-conflict-marker check is covered by ESLint's parser (an unresolved conflict marker is a syntax error). Fix reported issues rather than bypassing the hook.

## CI gates (CI-4)

`ci.yml` runs these as blocking jobs, no `continue-on-error`. Get them green locally before pushing:

1. Format (Prettier)
2. Lint (ESLint) — including custom rules rejecting hard-coded colors (ARC-3a) and committed `console.log` (OBS-1)
3. Type check (`tsc`)
4. Unit + integration tests at ≥80% coverage
5. Playwright e2e suite
6. Secret scan
7. Dependency vulnerability scan — nothing at HIGH/CRITICAL
8. Migration check — migrations apply clean on a fresh DB, snake_case, no drift

There is no separate AI PR-review workflow; these gates plus required human review (GIT-5) replace it (CI-4).

## Code style

- TypeScript everywhere, explicit types on public functions (CODE-1).
- Functions under 50 lines, files under 800 (target 200–400), nesting ≤4 with early returns (CODE-4, CODE-5).
- Every REST body and Socket.io payload is zod-validated, both directions (CODE-2).
- No hard-coded config — environment variables only (CODE-3).
- No hard-coded color values in components — design tokens only (ARC-3a).
- No `console.log` in committed code — use the structured logger (OBS-1).

## Docs

Update `README.md`, `.env.example`, and `rules.md` in the same PR if the change affects them (DOD-4). Record a significant decision as a short ADR under `docs/adr/` (DOD-5).
