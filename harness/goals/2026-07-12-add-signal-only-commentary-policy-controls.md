# Goal: Add Signal-Only Commentary Policy Controls.

Spec: harness/specs/2026-07-12-signal-only-commentary-policy.md
Status: Completed at `validated-local`.

## Source Task

- `harness/tasks.md`: `P1 Add signal-only Commentary Policy controls.`

## Read First

1. `AGENTS.md`
2. `harness/tasks.md`
3. `harness/README.md`
4. `.harness/config.json`
5. `harness/status.md`
6. `harness/specs/2026-07-12-signal-only-commentary-policy.md`

## Work Mode Recommendation

Use `local` until the goal has a confirmed spec and clear file ownership.

## Execution Role

Use `implementer`.

- `gate-only`: the current thread reviews candidate output and verification evidence, but does not directly edit implementation files.
- `implementer`: the current thread may edit files inside the accepted scope.
- `mixed`: the current thread may both edit and gate only after recording why the tradeoff is acceptable.
- `harness-rule:level-0-fast-path`: Level 0 Fast Path direct execution is only for tiny low-risk local reversible work. It can skip spec/goal/run/worker ceremony only when no existing Harness Goal/Run or adapter-required gate requires state sync. Level 0 direct execution requires `implementer` or explicitly accepted `mixed`; `gate-only` cannot use Level 0 to edit implementation files. Verification, Delivery State, `Need user`, and `Remaining` still apply.
- `harness-rule:bounded-direct-execution`: Accepted finite single-thread work may execute without creating a Goal/Run/DAG when it needs no durable recovery or handoff, worker/DAG, multi-stage or broad implementation, important runtime/schema behavior change, acceptance or Milestone map, or adapter-required gate. Docs-only clarification of an existing contract is eligible. Sync only relevant pre-existing Harness artifacts; delivery authorization alone does not select durable orchestration. Once this durable Goal exists, do not downgrade its checklist, gate, or state-sync obligations to the bounded tier.

## Conversation Route

Use `current-thread`.

- `current-thread`: the current conversation owns execution in the locked cwd.
- `slot-thread`: hand off to a dedicated slot conversation before editing.
- `remote-control-worktree`: the current conversation may control a different locked worktree only when explicitly approved.

## Execution Context Lock

- Conversation lane: `current-thread`
- Controller thread: `current-thread`
- Execution cwd: `/Users/liuyj/project/skills/agent-harness`
- Execution branch: `main`
- Execution slot: `N/A`
- Remote-control worktree: `no`

## Delivery State

- Delivery intent: `local-validation`
- Target delivery state: `validated-local`
- Commit authorized: `no`
- Push authorized: `no`
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`

Generated Goals are local-only by default. Commit, push, review, integration,
release, and ship targets require fresh explicit authorization in the current
conversation or accepted source spec; never infer them from stale status text.

The locked Execution branch records where implementation happens. It is not
automatically the integration target, and Harness core does not assume a branch
named `main`.

## Execution DAG

Use `run prepare` to generate `dag.json`, `dag.md`, and per-node
`agents/<node>/prompt.md` files. Prefer Codex CLI subagents for worker nodes.
Create a new Codex thread only when the controller explicitly needs a visible,
long-lived handoff lane. Fork is not the default worker surface; use it only
when the controller explicitly approves inherited context.

## Context Focus Routing

`harness-rule:context-focus-routing`: Normalize user intent to `Milestone`, `Goal`, `Task`, `Run`, `Priority`, or `Spec` before choosing context focus. Use the smallest useful workflow focus preset (`orient`, `intake`, `shape`, `goal`, and `execute`) and prefer current confirmed state, accepted specs/goals/runs, adapter/config/status, then broad docs or historical logs. For execution, use the `execute` focus preset: goal/spec/run packet, execution DAG, allowed and forbidden scope, implementation-relevant files, verification commands, delivery target, and state-sync requirements.

## Cybernetic Stability

`harness-rule:cybernetic-stability`: control toward an explicit target using `harness-rule:intent-setpoint-selection`, `harness-rule:sensor-freshness`, `harness-rule:measurement-snapshot`, `harness-rule:remaining-gap`, `harness-rule:feedback-quality`, and `harness-rule:stability-saturation`. Before closeout, state the selected target, observed state, evidence, stale/conflict risks, Delivery State, user-decision state, gap closed, remaining gap, feedback quality, and whether the stable next action is continue, pause, ask, or close.


## Spec Acceptance Checklist

- Item: Backward-compatible config contract
  - Acceptance: absent policy resolves to `minimal`; invalid values fail.
  - Evidence: smoke fixtures cover explicit/default `minimal` and invalid mode
    rejection
  - Status: satisfied
  - Unblocker: N/A
- Item: End-to-end propagation
  - Acceptance: effective policy appears in config inspection and generated
    run, DAG, and worker artifacts.
  - Evidence: config inspection, Run status, DAG state, and generated worker
    prompt assertions passed
  - Status: satisfied
  - Unblocker: N/A
- Item: Shared signal-only skill contract
  - Acceptance: all four public skills load the same minimal/balanced/audit
    guidance and preserve host-required updates.
  - Evidence: four public skills load the shared reference; protocol/smoke
    checks passed
  - Status: satisfied
  - Unblocker: N/A
- Item: Documentation and deterministic coverage
  - Acceptance: public contract docs, templates, smoke tests, behavior evals,
    and plugin validation agree.
  - Evidence: docs/templates aligned; `npm run test:all`, `npm run test:eval`,
    and `npm run validate:plugin` passed
  - Status: satisfied
  - Unblocker: N/A

## Required Gate Evidence

- Gate: spec
  - Required: yes
  - Evidence: `harness/specs/2026-07-12-signal-only-commentary-policy.md`
  - Status: satisfied
  - Unblocker: N/A
- Gate: execution
  - Required: yes
  - Evidence: enforced explorer, worker, and verification nodes completed in
    `.harness/runs/20260712-095713-add-signal-only-commentary-policy-controls`
  - Status: satisfied
  - Unblocker: implementation and deterministic verification
- Gate: integration
  - Required: yes
  - Evidence: full local deterministic verification and plugin validation
    passed
  - Status: satisfied
  - Unblocker: full local plugin validation

## Scope

- Implement the accepted spec's backward-compatible config, effective-policy
  resolution, generated-artifact propagation, shared skill contract, docs,
  templates, tests, evals, and Harness state sync.
- Preserve current unrelated terminology cleanup changes in the dirty checkout.

## Non-Goals

- Do not add `off`, filter App Server messages, or claim hard enforcement over
  Codex host behavior.
- Do not release, deploy, publish, or launch workers outside the run packet DAG unless separately requested.
- Do not execute delivery steps above the Delivery State policy.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.

## Context

- Source: User approved fixing global Codex verbosity immediately and starting
  development of the previously discussed Commentary Policy feature.
- Current observation: final-closeout compression exists, but foreground
  commentary has no shared contract; controller packets expose undefined
  `Report cadence` and `Notify on` fields.
- Execution: current-thread `implementer` on the existing `main` checkout.


## Project Adapter Requirements

- Read `harness/README.md` for project-specific hard boundaries, validation rules, preflight requirements, and state-sync requirements.
- If a linked Doc is a goal prompt, read the spec and context documents referenced by that goal before editing.
- Agent Harness plugin references: adapter-harness, task-routing, and work-mode-policy.
- Preflight: Read AGENTS.md before editing repository files.
- Preflight: Validate plugin changes with npm run validate:plugin.
- State sync: Update harness/tasks.md after meaningful task state changes.
- State sync: Update harness/status.md after execution or verification.


## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
node --check tests/smoke.mjs
npm run test:protocol
npm run test:smoke
npm run test:eval
npm run validate:plugin
git diff --check
```

## Completion Conditions

- The source Goal/work item acceptance is satisfied.
- Verification commands pass or any failure is documented with next steps.
- State-sync evidence or State Sync Notes are produced as part of Goal/Task Done.
- Status-file updates use a bounded current-state snapshot; replace status
  sections instead of appending historical focus logs.
- Update configured state records (`harness/tasks.md`, `harness/status.md`) when the project adapter requires state sync.

## Pause Conditions

- The referenced spec or accepted scope is missing, unconfirmed, or conflicts with code, production constraints, or newer user instructions.
- The measurement snapshot cannot identify a reliable observed state, feedback quality is insufficient for completion, or the remaining gap is not shrinking.
- The work requires credentials, paid APIs, production access, destructive commands, release, or a delivery step above the Delivery State policy.
- Product direction, file ownership, or worktree policy is unclear.
- User gives new instructions that conflict with this goal.
