# Goal: Implement Run Checkpoint And Recovery Protocol.

Spec: harness/specs/2026-09-01-run-checkpoint-and-recovery-protocol.md
Checkpoint Policy: disabled
Checkpoint Stages: []
Status: completed.

## Source Task

- `harness/tasks.md`: `P0 Implement Run Checkpoint and Recovery Protocol.`

## Read First

1. `AGENTS.md`
2. `harness/tasks.md`
3. `harness/README.md`
4. `.harness/config.json`
5. `harness/status.md`
6. `harness/specs/2026-09-01-run-checkpoint-and-recovery-protocol.md`

## Work Mode Recommendation

Use `local` in the current checkout and current branch. The user designated
this task as the controller, and the project adapter defaults foreground work
to the current checkout unless isolation is explicitly requested.

## Execution Role

Use `implementer`.

- `gate-only`: the current thread reviews candidate output and verification evidence, but does not directly edit implementation files.
- `implementer`: the current thread may edit files inside the accepted scope.
- Controller means outcome owner and accepted-state owner. Use `gate-only` only when review-only behavior is explicit; otherwise a controller may implement foreground work.
- Ordinary clear change/build requests use Codex directly. This durable Goal uses only `gate-only` or `implementer` roles.
- `harness-rule:durable-tier-boundary`: ordinary clear change/build uses Codex directly; already tracked simple work may use one bounded postflight sync; Harness ceremony is reserved for recovery, audit, persistent state sync, milestones, DAGs, multiple workers, or high-risk control. Once this durable Goal exists, do not downgrade its checklist, gate, or state-sync obligations to the bounded tier.

## Codex-Native Execution

- For accepted long-running controller work, establish or reuse a compatible Codex runtime Goal and use Codex Plan for current multi-step progress. Controller means outcome owner and accepted-state owner; only explicit review-only or gate-only direction prohibits foreground implementation.
- Runtime Goal owns the current outcome and continuation; Codex Plan owns transient steps.
- Codex runtime owns Thread/subagent scheduling, concurrency, cancellation, and model/effort selection.
- Repository Goal/Run owns cross-task recovery, durable dependencies, evidence, gates, and state sync.
- If native Goal or Plan is unavailable, continue in the current thread and record degraded provenance only when this durable Run requires it. Never invent runtime identifiers.

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

## Execution DAG

Use `run prepare` to generate `dag.json`, `dag.md`, and per-node
`agents/<node>/prompt.md` files. The Codex runtime owns worker selection,
delegation, concurrency, and cancellation; Harness records ownership and evidence.

## Context Focus Routing

`harness-rule:project-neutral-core`: Normalize the durable target to `Milestone`, `Goal`, `Task`, `Run`, `Priority`, or `Spec`; adapters own downstream paths and facts while plugin core remains project-neutral. `harness-rule:path-containment`: configured writes, Goal/Spec references, Run arguments, and DAG artifacts stay inside configured roots after lexical and existing-parent realpath checks.

## Cybernetic Stability

`harness-rule:state-sync-evidence`: durable completion includes verified State Sync Notes and synchronization of the configured Goal, Task, Run, gate, and bounded status records.


## State Sync Notes

Record concrete accepted-state updates, Run evidence, and bounded status
synchronization before marking this Goal/Run completed.

- Accepted-state records: Goal checklist/gates completed; the Task moved to
  `Done`; `harness/status.md` now records the bounded completed snapshot.
- Run evidence: `.harness/runs/20260901-164310-implement-run-checkpoint-and-recovery-protocol`
  records completed execution and verification nodes plus full-gate evidence.
- Bounded status update: `harness/status.md` records the accepted result,
  verification, delivery ceiling, zero user follow-ups, and zero remaining
  accepted-scope work.

## Spec Acceptance Checklist

- Item: `Checkpoint policy, schema, and prepare`
  - Acceptance: Spec criteria 1, 2, and 14 hold: only explicitly enforced
    managed Runs create a schema-valid independent checkpoint; disabled and
    fast paths remain unchanged; adapter dimensions stay project-neutral and
    reject unsafe inline data.
  - Evidence: Config/schema/templates bind `disabled|enforced`, enforced
    `run prepare` creates independent `checkpoint.json`, and regression fixtures
    cover default-disabled/fast-path compatibility plus safe adapter dimensions.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Revision-safe mutation`
  - Acceptance: Spec criteria 4 and 5 hold: every mutation uses the Run lock,
    atomic write, and expected revision; stale revisions, illegal transitions,
    unsafe paths, and missing recovery evidence fail without partial writes.
  - Evidence: CLI mutation uses the Run lock, atomic write, and
    `expectedRevision` CAS; regressions prove stale/concurrent writers,
    illegal transitions, and missing reconciliation evidence cause zero writes.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Binding, drift, and replacement recovery`
  - Acceptance: Spec criteria 3, 6, and 7 hold: validation joins checkpoint,
    manifest, status, DAG, and Goal; contract drift cannot rebind an old
    manifest; a validated replacement can supersede the old Run while keeping
    historical evidence.
  - Evidence: `run validate` joins manifest/checkpoint/status/DAG/Goal state;
    regressions cover drift quarantine, validated replacement, supersession,
    and expected historical drift without rebinding the old manifest.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Reconciliation and orient digest`
  - Acceptance: Spec criteria 8, 9, and 10 hold: uncertain external state
    permits inspect/reconcile only; `orient next` emits checkpoint revision,
    one next action, pause/prohibited actions, and refuses ambiguous active
    checkpoint selection.
  - Evidence: Reconciliation fixtures prohibit blind retry until authoritative
    read-back evidence is recorded; `orient next` exposes the L0/L1 checkpoint
    digest and rejects ambiguous multiple-active-Run selection.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Completion, compatibility, and lifecycle boundaries`
  - Acceptance: Spec criteria 11, 12, and 13 hold: checkpoint completion does
    not complete Goal/delivery authority; v1 and legacy Runs remain readable;
    local-only nonterminal recovery artifacts are not pruned unsafely.
  - Evidence: Completion fixtures require a terminal DAG while preserving Goal
    authority; v1/legacy/checkpoint-disabled Runs validate, and lifecycle
    previews protect invalid or nonterminal checkpoint Runs from pruning.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Aligned product surface and full verification`
  - Acceptance: Spec criteria 15 and 16 hold across deterministic regression,
    behavior eval, CLI docs, templates, skills, project contract, README, and
    all required validation commands.
  - Evidence: CLI, schema, templates, execute/orient skills, adapter/lifecycle
    references, bilingual docs, capability matrix, CHANGELOG, behavior eval,
    and regression suite are aligned; every required command passed.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Required Gate Evidence

These gates apply only to durable Goal/Run completion. Postflight sync verifies completed work and updates existing tracked state only. It creates no Goal, Run, DAG, gate, or status artifact solely for bookkeeping, and durable completion gates do not apply unless a durable Goal/Run is being closed.

- Gate: `spec`
  - Required: `yes`
  - Evidence: Accepted spec
    `harness/specs/2026-09-01-run-checkpoint-and-recovery-protocol.md` was read
    before implementation; all 16 acceptance criteria map to satisfied items.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Gate: `execution`
  - Required: `yes`
  - Evidence: The current-thread implementer completed the project-neutral CLI,
    contract, template, skill, documentation, regression, eval, and state-sync
    surfaces within the accepted non-goals.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Gate: `integration`
  - Required: `yes`
  - Evidence: Full local integration gates passed: `npm run test:all`,
    `npm run test:eval`, `npm run validate:plugin`, config/Goal/Run validation,
    doctor, syntax, lifecycle previews, and `git diff --check`.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Scope

- Implement the accepted project-neutral checkpoint/recovery MVP in the core
  CLI, config/schema resolution, managed Run artifacts, validation, mutation,
  recovery orientation, and artifact lifecycle behavior.
- Keep checkpoint enablement explicit and default-disabled so ordinary managed
  Runs and Codex fast paths do not gain new ceremony.
- Align templates, skills, references, public/project docs, regression tests,
  behavior evals, and durable Harness state with the implemented contract.

## Non-Goals

- Do not implement Scoped Authority or External Effect ledger behavior.
- Do not implement heartbeat/lease, multi-writer or cross-machine CAS, event
  sourcing, or a full stage advance/reopen CLI.
- Do not add downstream product, Provider, budget, deployment, or production
  assumptions to plugin core.
- Do not bump a version, commit, push, publish, release, deploy, use credentials
  or paid APIs, access production, or perform destructive operations.

## Context

- Source: User accepted the checkpoint/recovery spec and designated the
  current thread as controller and accepted-state owner on 2026-09-01.
- Deferred work remains in the spec register RC-D1 through RC-D6 and is not
  promoted into this Goal.


## Project Adapter Requirements

- Read `harness/README.md` for project-specific hard boundaries, validation rules, preflight requirements, and state-sync requirements.
- If a linked Doc is a goal prompt, read the spec and context documents referenced by that goal before editing.
- Agent Harness plugin references: adapter-harness, task-routing, and work-mode-policy.
- Preflight: Read AGENTS.md before editing repository files.
- Preflight: Validate plugin changes with npm run validate:plugin.
- State sync: Update harness/tasks.md after meaningful task state changes.
- State sync: Update harness/status.md after execution or verification.


## Verification

Required before completion:

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
npm run test:all
npm run test:eval
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs config validate --cwd . --json
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-09-01-implement-run-checkpoint-and-recovery-protocol.md --json
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .
git diff --check
```

Add focused checkpoint/recovery regression and CLI smoke commands as the
implementation surface becomes concrete.

## Completion Conditions

- All 16 spec acceptance criteria are covered by satisfied checklist evidence.
- Required `spec`, `execution`, and `integration` gates are satisfied with fresh
  controller-accepted evidence.
- Goal, Task, Run, gate, and bounded status state are synchronized.
- Checkpoint-disabled and legacy compatibility tests prove no fast-path
  expansion or historical artifact rewrite.

## Pause Conditions

- The accepted spec conflicts with existing manifest safety, artifact lifecycle,
  repository facts, or newer user instructions.
- MVP implementation requires an authority/effect ledger, heartbeat/lease,
  distributed CAS, event sourcing, full stage CLI, or project-specific core
  behavior.
- Work requires credentials, production access, paid APIs, deployment, release,
  publishing, destructive operations, or another unauthorized external effect.
- A product direction, cost/risk boundary, or incompatible migration requires
  user judgment.
