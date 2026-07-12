# Project Status

`harness-rule:bounded-status-snapshot`: this file records current state only.
Historical evidence lives in `harness/tasks.md`, `harness/goals/`, and
`.harness/runs/`.

## Focus

- Current Goal: None active.
- Recently completed: Added the signal-only Commentary Policy with
  `minimal | balanced | audit`, backward-compatible `minimal` resolution,
  config inspection, generated Run/worker propagation, shared skill guidance,
  docs, and deterministic coverage.
- Goal:
  `harness/goals/2026-07-12-add-signal-only-commentary-policy-controls.md`
- Run:
  `.harness/runs/20260712-095713-add-signal-only-commentary-policy-controls/`
- Degraded provenance: active session policy did not authorize subagent
  delegation; enforced nodes ran sequentially as `manual-foreground` in the
  locked current thread.

## Git And Delivery

- Current branch: `main`
- Work mode: `local`
- Delivery intent: `local-validation`
- Target delivery state: `validated-local`
- Commit authorized: `no`
- Push authorized: `no`
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`
- Plugin-cache deployment authorized: `no`

No commit, push, review, integration, release, plugin-cache deployment,
credentials, paid API, production, daemon, or destructive-operation authority
is recorded for the Commentary Policy Goal.

## Verification

- State: passed.
- Required checks:
  - `git diff --check`
  - `npm run test:all`
  - `npm run test:eval`
  - `npm run validate:plugin`
- Evidence: syntax/JSON parsing, config validation/inspection, presentation,
  protocol, smoke, deterministic behavior eval, plugin validation, and diff
  checks passed locally. Existing unrelated terminology cleanup changes remain
  preserved in the dirty checkout.

## Route

- Public entry: `harness:orient` for the next read-only project decision.
- Internal route: `orient`
- Execution role: None active.
- Accepted-state owner: None active.
- Need user: None
- Remaining: None

## Blockers

- None currently recorded.
