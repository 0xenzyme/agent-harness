# Project Status

This file is a bounded current-state projection. Authoritative accepted phase
belongs to Task/Goal records; historical detail belongs in
`harness/tasks-archive.md`, Goals, milestones, owning-domain docs, and Runs.

## Focus

- Current Goal: none active.
- Last completed: GitHub presentation P0+P1 (README first screen and
  social preview).
- Goal index: `harness/tasks.md` (docs Goal; no separate spec/Run).
- Package / plugin version: `0.12.0` (release preparation; no Git tag or
  GitHub Release).
- Phase: completed.
- Execution path: `host-direct-postflight`; no new durable Run.

## Accepted Result

- Protocol, skills, CLI, schema, and capability matrix already described
  `host-direct`, `host-direct-postflight`, `durable-harness`, and optional
  runtime capabilities.
- User-facing docs match that contract; GitHub default README is English.
- README first screen now carries version/Codex/protocol/smoke/license
  badges and routes to the capability matrix, changelog, v0.12.0
  preparation notes, and social preview; first-use leads with host
  prompts, then CLI adoption.
- Social preview subtitle is host-neutral, the flow row includes State
  Sync, and `docs/assets/github/social-preview.png` is the 1280x640 PNG.
  `package.json` description and GitHub About now match the presentation
  positioning line. Topics already matched. OG upload remains Settings.
- Nested untracked `agent-harness/` copy remains at 0.11.0 until explicit
  delete/gitignore authorization.
- RC-D1 through RC-D6 remain deferred.

## Verification

- Passed: `git diff --check`, `npm run test:presentation`,
  `npm run test:all`, `npm run validate:plugin`, and project `doctor`.

## Route

- Public next entry: `harness:orient` for a new project decision.
- Accepted-state owner: none active after this docs pass.
- Need user: confirm fate of nested `agent-harness/` before deletion;
  social-preview PNG still needs a Settings OG upload if desired.
- Delivery ceiling: validated local changes only; no version bump, commit,
  push, publish, release, deploy, or production operation is authorized.
- Remaining: nested 0.11.0 copy is still untracked and unused.

## Blockers

- None.
