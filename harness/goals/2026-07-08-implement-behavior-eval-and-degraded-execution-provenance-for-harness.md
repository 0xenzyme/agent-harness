# Goal: Implement Behavior Eval And Degraded Execution Provenance For Harness.

Spec: harness/specs/2026-07-08-behavior-eval-and-degraded-execution-provenance.md
Status: Completed with validated-local gate-only Controller evidence.

## Source Task

- `harness/tasks.md`: `Implement behavior eval and degraded execution provenance for Harness.`

## Read First

1. `AGENTS.md`
2. `harness/tasks.md`
3. `harness/README.md`
4. `.harness/config.json`
5. `harness/status.md`
6. `harness/specs/2026-07-08-behavior-eval-and-degraded-execution-provenance.md`

## Work Mode Recommendation

Use `local` until the goal has a confirmed spec and clear file ownership.

## Execution Role

Use `gate-only`.

- `gate-only`: the current thread reviews candidate output and verification evidence, but does not directly edit implementation files.
- `implementer`: the current thread may edit files inside the accepted scope.
- `mixed`: the current thread may both edit and gate only after recording why the tradeoff is acceptable.
- `harness-rule:level-0-fast-path`: Level 0 Fast Path direct execution is only for tiny low-risk local reversible work. It can skip spec/goal/run/worker ceremony only when no existing Harness Goal/Run or adapter-required gate requires state sync. Level 0 direct execution requires `implementer` or explicitly accepted `mixed`; `gate-only` cannot use Level 0 to edit implementation files. Verification, Delivery State, `Need user`, and `Remaining` still apply.

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

- Delivery intent: `local-validation-only`
- Target delivery state: `validated-local`
- Commit authorized: `no`
- Push authorized: `no`
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`

Completed development runs must reach Target delivery state. This goal is a
local validation pass only: no commit, push, review, integration, release,
publish, deploy, production access, daemon, watcher, paid API, credential, or
destructive operation is authorized.

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

- Item: `Trace-shaped behavior eval`
  - Acceptance: Deterministic eval data and runner checks verify tool-call
    trace behavior for orient and gate-only execute scenarios.
  - Evidence: `Added evals/skills/agent-harness/behavior_trace_cases.yaml and
    extended evals/run-agent-harness-eval.mjs to validate ordered reads,
    forbidden writes/mutations, worker candidate evidence, degraded provenance,
    and gate-only acceptance evidence. Controller verification passed with
    npm run test:eval, which reported Behavior trace cases: 4.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Degraded provenance visibility`
  - Acceptance: Harness protocol or skill guidance requires visible degraded
    execution provenance when worker/controller execution falls back.
  - Evidence: `Added harness-rule:degraded-execution-provenance to
    docs/HARNESSES.md, docs/project-contract.md, worker-runner, controller
    communication, gate-results, harness:execute, worker prompt template,
    generated run/DAG/worker prompts in plugins/agent-harness/scripts/agent-harness.mjs,
    protocol checks, and smoke checks.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Gate-only acceptance discipline`
  - Acceptance: Behavior checks or protocol checks prove gate-only completion
    requires implementer output, verification, and controller acceptance
    evidence before accepted state moves forward.
  - Evidence: `behavior_trace_cases.yaml includes gate-only acceptance evidence
    requirements; eval runner asserts implementer_output, verification,
    controller_acceptance, and state_transition_after_gate; run node records
    cite explorer, worker, and verification candidate evidence before this
    Controller acceptance update.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Local deterministic validation`
  - Acceptance: Local validation passes without credentials, paid APIs,
    daemons, push, PR, deploy, publish, or release.
  - Evidence: `Controller ran node --check evals/run-agent-harness-eval.mjs,
    node --check scripts/test-suites.mjs, node --check tests/smoke.mjs,
    node --check plugins/agent-harness/scripts/agent-harness.mjs,
    npm run test:eval, npm run test:protocol, npm run test:smoke,
    npm run validate:plugin, and git diff --check; all exited 0.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Required Gate Evidence

- Gate: `spec`
  - Required: `yes`
  - Evidence: `harness/specs/2026-07-08-behavior-eval-and-degraded-execution-provenance.md`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Gate: `execution`
  - Required: `yes`
  - Evidence: `Run .harness/runs/20260708-114327-implement-behavior-eval-and-degraded-execution-provenance-for-harness recorded completed explorer, worker, and verification DAG nodes with codex-cli-subagent surfaces and controller-reviewed candidate evidence.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Gate: `integration`
  - Required: `yes`
  - Evidence: `Gate-only Controller reviewed worker output, inspected scoped diff, independently ran all goal verification commands successfully, and accepted Delivery State validated-local. No commit, push, PR, review, integration, release, deploy, daemon, credential, paid API, production access, or destructive action was performed.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Scope

- Add deterministic behavior-eval fixtures/checks under `evals/` for
  trace-shaped Harness workflow behavior.
- Extend the local eval runner or adjacent eval docs so the behavior checks run
  without credentials or paid APIs.
- Update Harness protocol/skill/docs guidance so degraded worker/controller
  fallback is visibly declared and not silently treated as a normal dual-lane
  execution.
- Preserve `gate-only` semantics: implementation workers return candidate
  evidence; the current controller thread validates and records accepted state.
- Sync `harness/tasks.md`, `harness/status.md`, and this run with concrete
  evidence after verification.

## Non-Goals

- Do not release, deploy, publish, or launch workers outside the run packet DAG unless separately requested.
- Do not execute delivery steps above the Delivery State policy.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.

## Context

- Source: Current controller thread reviewed Impeccable's `critique`


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
node --check evals/run-agent-harness-eval.mjs
node --check scripts/test-suites.mjs
node --check tests/smoke.mjs
npm run test:eval
npm run test:protocol
npm run test:smoke
npm run validate:plugin
git diff --check
```

## Completion Conditions

- Every `Spec Acceptance Checklist` item is satisfied with concrete evidence.
- Required gate evidence for `execution` and `integration` is satisfied.
- Worker output has been reviewed by the current controller thread and treated
  as candidate evidence until accepted.
- Verification commands pass or any failure is recorded as a blocker.
- Configured state records (`harness/tasks.md`, `harness/status.md`) and the
  run record are updated with accepted evidence.
- Delivery State is `validated-local`.

## Pause Conditions

- The referenced spec or accepted scope is missing, unconfirmed, or conflicts with code, production constraints, or newer user instructions.
- The measurement snapshot cannot identify a reliable observed state, feedback quality is insufficient for completion, or the remaining gap is not shrinking.
- The work requires credentials, paid APIs, production access, destructive commands, release, or a delivery step above the Delivery State policy.
- Product direction, file ownership, or worktree policy is unclear.
- The implementation requires a new dependency install, persistent daemon,
  activation behavior change, schema migration, commit, push, PR, deploy,
  publish, or release.
- User gives new instructions that conflict with this goal.
