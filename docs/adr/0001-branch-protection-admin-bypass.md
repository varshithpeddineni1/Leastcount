# 1. Allow admin bypass on branch protection for solo maintenance

## Context

GIT-5 requires one approval before merge. GitHub does not allow a PR author to approve their own pull request, and with `enforce_admins: true` on branch protection, the repo admin cannot bypass that requirement either. For a solo maintainer with no other collaborators yet, this would make every PR permanently unmergeable through the normal flow.

## Decision

Branch protection on `main` keeps required status checks (all eight CI-4 gates, strict/up-to-date), required PR, 1 required approving review, and required conversation resolution — but `enforce_admins` is set to `false`. This lets the repo admin (`varshithpeddineni1`) merge their own reviewed PRs once CI is green, while any other contributor still needs a genuine approval plus green checks.

## Consequences

- Solo work is unblocked without weakening the bar for anyone else who contributes.
- The admin is trusted to self-review honestly (read the diff, confirm the checklist) before merging their own PRs — this is a judgment call, not a mechanical gate.
- If/when a second maintainer joins, revisit whether `enforce_admins` should flip back to `true` so the admin is held to the same review bar as everyone else.
