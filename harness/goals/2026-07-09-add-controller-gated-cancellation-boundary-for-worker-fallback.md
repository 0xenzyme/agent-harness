# Goal: Add Controller-Gated Cancellation Boundary For Worker Fallback.

Spec: TBD
Spec Policy: allow-no-spec
Status: Ready for execution from accepted scope without a separate spec.

## Source Task

- `harness/tasks.md`: `Add controller-gated cancellation boundary for worker fallback.`

## Read First

1. `AGENTS.md`
2. `harness/tasks.md`
3. `harness/README.md`
4. `.harness/config.json`
5. `harness/status.md`

## Work Mode Recommendation

Use `local` in the current thread. The user accepted the lightweight
controller-gated cancellation design after a three-worker debate.

## Execution Role

Use `implementer`.

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

- Delivery intent: `local-validation`
- Target delivery state: `validated-local`
- Commit authorized: `no`
- Push authorized: `no`
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`

Completed development runs must reach Target delivery state. By default,
gate-passing implementation work is committed and integrated into the
target integration line declared by the project adapter, confirmed goal, or
explicit user instruction; release / ship remains out of scope unless the
delivery policy explicitly authorizes it. Lower the target to `validated-local`
only for local-only spikes, audits, or explicitly uncommitted work.

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

Add checklist items here when the referenced spec has concrete acceptance
criteria, required page/workflow coverage, or product-quality gates. Candidate
implementation evidence is not accepted completion until relevant checklist
items are satisfied.

## Required Gate Evidence

Add one `Gate` item for each adapter-required completion gate. Technical
verification is necessary but does not replace gate evidence.

## Scope

- Add lightweight Harness control-plane semantics for cooperative
  cancellation and supersession of worker output.
- Make late or superseded worker output candidate-only until controller
  revalidates it.
- Require manual-foreground fallback to carry
  `harness-rule:degraded-execution-provenance` instead of looking like normal
  worker completion.
- Add deterministic protocol / eval / smoke coverage for the new boundary.

## Non-Goals

- Do not release, deploy, publish, or launch workers outside the run packet DAG unless separately requested.
- Do not execute delivery steps above the Delivery State policy.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.
- Do not add daemons, persistent services, full `WorkerLease` / heartbeat
  machinery, runtime kill guarantees, or global config schema migration.
- Do not claim Harness can forcibly stop a Codex subagent runtime.

## Context

- Source: User-confirmed design after three-worker debate about avoiding
  over-engineered worker preemption controls. Adopt
  `controller-gated cancellation + evidence quarantine`, not runtime
  preemption.


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
node --check scripts/test-suites.mjs
node --check tests/smoke.mjs
node --check evals/run-agent-harness-eval.mjs
npm run test:protocol
npm run test:eval
npm run test:smoke
npm run validate:plugin
git diff --check
```

## Completion Conditions

- The source task acceptance is satisfied.
- Verification commands pass or any failure is documented with next steps.
- Update configured state records (`harness/tasks.md`, `harness/status.md`) when the project adapter requires state sync.
- New protocol docs, generated run/prompt guidance, CLI gates, and behavior
  evals agree that cancellation is cooperative control-plane state, not a
  runtime kill guarantee.
- Completed run records cannot silently accept unresolved cancellation,
  supersession, or manual-foreground fallback evidence.

## Pause Conditions

- The referenced spec or accepted scope is missing, unconfirmed, or conflicts with code, production constraints, or newer user instructions.
- The measurement snapshot cannot identify a reliable observed state, feedback quality is insufficient for completion, or the remaining gap is not shrinking.
- The work requires credentials, paid APIs, production access, destructive commands, release, or a delivery step above the Delivery State policy.
- Product direction, file ownership, or worktree policy is unclear.
- User gives new instructions that conflict with this goal.
