# Project Status

This file is a bounded current-state snapshot. Historical evidence belongs in
`harness/tasks.md`, `harness/goals/`, and `.harness/runs/`.

## Focus

- Current Goal: None active.
- Recently completed: Integrated Agent Harness with Codex-native Goal, Plan,
  direct execution, and bounded postflight state sync.
- Spec: `harness/specs/2026-07-19-integrate-agent-harness-with-codex-native-execution.md`
- Goal: `harness/goals/2026-07-19-integrate-agent-harness-with-codex-native-goal-and-plan-execution.md`
- Run: `.harness/runs/20260719-085333-integrate-agent-harness-with-codex-native-goal-and-plan-execution/`

## Accepted Result

- Ordinary clear, local, reversible work uses `codex-direct` and creates no
  Harness lifecycle artifacts.
- Simple work linked to existing Harness state uses
  `codex-direct-postflight`: Codex executes, then updates only existing tracked
  outcome, verification, Delivery State, and remaining gap.
- Durable recovery, audit, milestone, DAG, multi-worker, persistent state, or
  high-risk work uses `durable-harness` with repository Goal/Run evidence.
- Long-running controller work uses a Codex runtime Goal and Plan. Controller
  means outcome and accepted-state owner; only explicit review-only or
  `gate-only` direction prevents foreground implementation.
- Completion gates are durable-only. Existing enforced Runs cannot bypass
  their DAG, evidence, or gates through postflight labeling.
- Future medium/large Runs default to `execution -> verification`; Codex owns
  worker selection, scheduling, concurrency, cancellation, model, and effort.
- Package and plugin version are `0.8.0`; docs and release notes are aligned.

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
- Passed: four JavaScript syntax checks, `npm run test:all`, `npm run
  test:eval`, `npm run validate:plugin`, four skill validators, Chinese-locale
  smoke and routing-classification, residual protocol/version searches, and
  `git diff --check`.
- Deterministic eval: 40 trigger cases, 4 task cases, 8 hard CLI checks, and 10
  behavior traces.

## Route

- Public entry: `harness:orient` for the next read-only project decision.
- Accepted-state owner: None active.
- Need user: None
- Remaining: None

## Blockers

- None.
