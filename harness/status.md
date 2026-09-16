# Project Status

This file is a bounded current-state projection. Authoritative accepted phase
belongs to Task/Goal records; historical detail belongs in
`harness/tasks-archive.md`, Goals, milestones, owning-domain docs, and Runs.

## Focus

- Current Goal: none active.
- Last completed: ship Agent Harness `0.12.0` as a GitHub Release.
- Goal index: `harness/tasks.md` (docs Goal; no separate spec/Run).
- Package / plugin version: `0.12.0`.
- Phase: completed.
- Execution path: `host-direct-postflight`; no new durable Run.

## Accepted Result

- Folded remaining presentation and host-neutral docs into `0.12.0`.
- `CHANGELOG.md`, `docs/releases/v0.12.0.md`, and GitHub presentation now
  describe the public `0.12.0` release surface rather than preparation.
- Nested untracked `agent-harness/` copy remains at 0.11.0 until explicit
  delete/gitignore authorization.
- RC-D1 through RC-D6 remain deferred.

## Verification

- Passed: `git diff --check`, `npm run test:presentation`,
  `npm run test:all`, `npm run test:eval`, and `npm run validate:plugin`.
- Remaining delivery: Git tag `v0.12.0` and `gh release view v0.12.0`.

## Route

- Public next entry: `harness:orient` for a new project decision.
- Accepted-state owner: none active after this release pass.
- Need user: confirm fate of nested `agent-harness/` before deletion;
  social-preview PNG still needs a Settings OG upload if desired.
- Delivery ceiling: Git tag `v0.12.0` and GitHub Release authorized.
- Remaining: nested 0.11.0 copy is still untracked and unused.

## Blockers

- None.
