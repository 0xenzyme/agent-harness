# Project Status

This file is a bounded current-state snapshot. Historical evidence belongs in
`harness/tasks.md`, `harness/goals/`, and `.harness/runs/`.

## Focus

- Current Goal: None active.
- Recently completed: Refocused Agent Harness on durable project control and
  current Codex runtime boundaries.
- Spec: `harness/specs/2026-07-18-refocus-agent-harness-on-durable-project-control.md`
- Goal: `harness/goals/2026-07-18-refocus-agent-harness-on-durable-project-control-and-current-codex-runtime-boundaries.md`
- Run: `.harness/runs/20260718-083037-refocus-agent-harness-on-durable-project-control-and-current-codex-runtime-boundaries/`

## Accepted Result

- Configured writes, Run arguments, Goal/Spec references, DAG artifacts, and
  existing-parent symlink paths are contained before writes.
- `run record` also rejects project-internal Goal/Spec references outside the
  configured goals/specs roots before changing Run status or logs.
- Delivery State is Run-scoped through start HEAD/branch/upstream/dirty state,
  current delta, and explicit evidence.
- Ordinary clear change/build uses Codex directly; repository Goal/Run remains
  for durable recovery, audit, milestone/DAG, and persistent state sync.
- Public roles are `gate-only` and `implementer`; Codex runtime owns worker,
  concurrency, cancellation, model, and effort choices.
- The current protocol exposes 9 domain invariants and a slim canonical config.

## Git And Delivery

- Branch: `main`
- Work mode: `local`
- Delivery state: `validated-local`
- Commit authorized/performed: `no`
- Push authorized/performed: `no`
- Review authorized/performed: `no`
- Integration authorized/performed: `no`
- Release/publish authorized/performed: `no`
- Deploy/plugin-cache refresh authorized/performed: `no`

## Verification

- State: passed.
- Passed: four JavaScript syntax checks, `npm run test:all`,
  `npm run test:eval`, `npm run validate:plugin`, four skill validators,
  zh-CN smoke and routing-classification, residual protocol searches, config /
  path / delivery code review, marketplace listing inspection, and
  `git diff --check`.
- Follow-up containment correction: targeted smoke, CLI/smoke syntax,
  `npm run test:all`, `npm run validate:plugin`, and `git diff --check` passed.
- Deterministic eval: 37 trigger cases, 4 task cases, and 5 behavior traces.

## Route

- Public entry: `harness:orient` for the next read-only project decision.
- Accepted-state owner: None active.
- Need user: None
- Remaining: None

## Blockers

- None.
