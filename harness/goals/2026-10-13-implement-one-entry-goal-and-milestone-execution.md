# Goal: Implement One-Entry Goal And Milestone Execution.

Spec: harness/specs/2026-10-13-one-entry-stage-execution.md
Checkpoint Policy: enforced
Checkpoint Stages: ["implementation","verification","state-sync"]
Status: completed.

## Source Task

- `harness/tasks.md`: `P0 Implement one-entry Goal and Milestone execution.`

## Read First

1. `AGENTS.md`
2. `harness/tasks.md`
3. `harness/README.md`
4. `.harness/config.json`
5. `harness/status.md`
6. `harness/specs/2026-10-13-one-entry-stage-execution.md`

## Work Mode Recommendation

Use `local` until the goal has a confirmed spec and clear file ownership.

## Execution Role

Use `implementer`.

- `gate-only`: the current thread reviews candidate output and verification evidence, but does not directly edit implementation files.
- `implementer`: the current thread may edit files inside the accepted scope.
- Controller means outcome owner and accepted-state owner. Use `gate-only` only when review-only behavior is explicit; otherwise a controller may implement foreground work.
- Ordinary clear change/build requests use the current host directly. This durable Goal uses only `gate-only` or `implementer` roles.
- `harness-rule:durable-tier-boundary`: ordinary clear change/build uses the current host directly; already tracked simple work may use one bounded postflight sync; Harness ceremony is reserved for recovery, audit, persistent state sync, milestones, DAGs, multiple workers, or high-risk control. Once this durable Goal exists, do not downgrade its checklist, gate, or state-sync obligations to the bounded tier.

## Host Execution

- For accepted long-running controller work, establish or reuse a compatible runtime outcome and use the host transient plan for current multi-step progress when those capabilities are exposed. Controller means outcome owner and accepted-state owner; only explicit review-only or gate-only direction prohibits foreground implementation.
- Runtime outcome owns the current outcome and continuation; transient plan owns short-lived steps.
- The host owns scheduling, concurrency, cancellation, and model/effort selection when those capabilities are exposed.
- Repository Goal/Run owns cross-task recovery, durable dependencies, evidence, gates, and state sync.
- If native outcome or plan is unavailable, continue in the current session and record degraded provenance only when this durable Run requires it. Never invent runtime identifiers.

## Conversation Route

Use `current-session`.

- `current-session`: the current conversation owns execution in the locked cwd.
- `delegated-worker`: hand off to a dedicated worker session before editing.
- `isolated-worktree`: the current conversation may control a different locked worktree only when explicitly approved.

## Execution Context Lock

- Conversation lane: `current-session`
- Controller thread: `current-session`
- Execution cwd: `/Users/liuyj/project/skills/agent-harness`
- Execution branch: `TBD`
- Execution slot: `N/A`
- Remote-control worktree: `no`

## Execution DAG

Use `run prepare` to generate `dag.json`, `dag.md`, and per-node
`agents/<node>/prompt.md` files. The host owns worker selection,
delegation, concurrency, and cancellation; Harness records ownership and evidence.

## Context Focus Routing

`harness-rule:project-neutral-core`: Normalize the durable target to `Milestone`, `Goal`, `Task`, `Run`, `Priority`, or `Spec`; adapters own downstream paths and facts while plugin core remains project-neutral. `harness-rule:path-containment`: configured writes, Goal/Spec references, Run arguments, and DAG artifacts stay inside configured roots after lexical and existing-parent realpath checks.

## Cybernetic Stability

`harness-rule:state-sync-evidence`: durable completion includes verified State Sync Notes and synchronization of the configured Goal, Task, Run, gate, and bounded status records.


## State Sync Notes

- Accepted-state records: `harness/goals/2026-10-13-implement-one-entry-goal-and-milestone-execution.md` completed; `harness/tasks.md` entry completed and moved to Done.
- Run evidence: `.harness/runs/20261013-130817-implement-one-entry-goal-and-milestone-execution` owns completed implementation and verification nodes, command logs and final closeout.
- Bounded status update: `harness/status.md` replaces the active implementation projection with the completed result and explicit validation limitations.
- Verification audit: `docs/verification/2026-10-13-one-entry-execution.md` records each requirement, actual command outcome and log hash.

## Spec Acceptance Checklist

- Item: plan-and-next-action
  - Acceptance: Two-level plans compile into real DAGs and deterministic whole-target next actions.
  - Evidence: plugins/agent-harness/scripts/planned-execution.mjs; plugins/agent-harness/schemas/execution-plan.schema.json; tests/planned-execution.mjs; docs/verification/2026-10-13-one-entry-execution.md
  - Status: satisfied
  - Unblocker: N/A
- Item: review-and-completion
  - Acceptance: Candidate review, freshness, shared completion checks and resumable state sync pass regressions.
  - Evidence: tests/planned-execution.mjs: 22 passing integrations, actual command logs, source freshness, CAS and synchronization recovery; docs/verification/2026-10-13-one-entry-execution.md
  - Status: satisfied
  - Unblocker: N/A
- Item: host-and-documentation
  - Acceptance: Four skills, host guidance, templates and bilingual public contracts describe the same behavior.
  - Evidence: plugins/agent-harness/skills/execute/SKILL.md; plugins/agent-harness/references/planned-execution.md; docs/project-contract.md; README.md; README.zh-CN.md; docs/cli.md; docs/cli.zh-CN.md; presentation/protocol/host checks passed
  - Status: satisfied
  - Unblocker: N/A
- Item: evaluation-and-compatibility
  - Acceptance: Deterministic and opt-in live development evaluation tooling preserve legacy and direct execution.
  - Evidence: evals/run-live-development.mjs: no-model fixture and mock host-process preflight passed; test:all and routing-classification passed; actual paid live run not invoked; docs/verification/2026-10-13-one-entry-execution.md
  - Status: satisfied
  - Unblocker: N/A

## Required Gate Evidence

These gates apply only to durable Goal/Run completion. Postflight sync verifies completed work and updates existing tracked state only. It creates no Goal, Run, DAG, gate, or status artifact solely for bookkeeping, and durable completion gates do not apply unless a durable Goal/Run is being closed.

- Gate: `spec`
  - Required: `yes`
  - Evidence: harness/specs/2026-10-13-one-entry-stage-execution.md: accepted user plan and once-only implementation authorization
  - Status: satisfied
  - Unblocker: `N/A`
- Gate: `execution`
  - Required: `yes`
  - Evidence: plugins/agent-harness/scripts/agent-harness.mjs; plugins/agent-harness/scripts/planned-execution.mjs; tests/planned-execution.mjs: complete scoped implementation accepted by controller
  - Status: satisfied
  - Unblocker: `N/A`
- Gate: `integration`
  - Required: `yes`
  - Evidence: docs/verification/2026-10-13-one-entry-execution.md: test:all (22 planned integrations), routing-classification, portable integrity and live preflight pass; official plugin checker unavailable with environment error, not a validation pass
  - Status: satisfied
  - Unblocker: `N/A`

## Scope

- Complete the accepted two-level plan, next-action, review, completion, recovery, compatibility, documentation, and evaluation contract.

## Non-Goals

- Do not launch workers or perform external side effects outside the accepted scope unless separately requested.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.

## Context

- Source: harness/tasks.md


## Project Adapter Requirements

- Read `harness/README.md` for project-specific hard boundaries, validation rules, preflight requirements, and state-sync requirements.
- If a linked Doc is a goal prompt, read the spec and context documents referenced by that goal before editing.
- Agent Harness plugin references: adapter-harness, task-routing, and work-mode-policy.
- Preflight: Read AGENTS.md before editing repository files.
- Preflight: Validate plugin changes with npm run validate:plugin.
- State sync: Update harness/tasks.md after meaningful task state changes.
- State sync: Update harness/status.md after execution or verification.


## Verification

Run the smallest relevant deterministic checks for the files changed by this goal.
If no deterministic command exists, document the manual verification evidence before completion.

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
- The work requires credentials, paid APIs, production access, destructive commands, release, or another external side effect outside accepted scope.
- Product direction, file ownership, or worktree policy is unclear.
- User gives new instructions that conflict with this goal.
