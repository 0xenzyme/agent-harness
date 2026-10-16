---
name: execute
description: Execute accepted long-running controller or durable Harness work, or postflight-sync already tracked work; ordinary clear changes use the current host directly. / 执行主控长任务、持久化控制或已有状态同步。
---

# Harness Execute

Use this skill when accepted work needs durable recovery, audit, milestone
acceptance, a Run/DAG, multiple workers, persistent state sync, or high-risk
control, or when already completed simple work needs bounded postflight sync to
existing Harness state. A clear ordinary change/build request uses the current
host directly without this skill.

Read [Completion Evidence](references/completion-evidence.md) before accepting
or recording durable completion.
Read [Host Execution Bridge](../../references/host-execution.md)
before selecting direct, postflight, or durable execution.
Read [Host Capabilities](../../references/host-capabilities.md) before using
runtime outcome, transient plan, or delegation.
Read [Artifact Lifecycle](../../references/artifact-lifecycle.md) before
compacting task state or pruning Runs.
Read [Worker Runner Contract](../../references/worker-runner-contract.md) before
delegating any DAG node or worker.
Read [Planned Execution Contract](../../references/planned-execution.md) before
validating a plan or accepting a planned candidate receipt.

## Workflow

1. Classify the request:
   - `host-direct`: stop Harness execution; let the current host execute and verify.
   - `host-direct-postflight`: verify completed work and update existing
     state only; create no lifecycle artifacts and do not apply durable
     completion gates.
   - `durable-harness`: continue below.
   A prepared enforced Run always remains durable.
   Legacy aliases `codex-direct` and `codex-direct-postflight` remain readable.
2. For durable work, read `AGENTS.md`, inspect `.harness/config.json`, and load
   the configured adapter, accepted Spec/Goal, active Run, and required gates.
   If the manifest enforces a checkpoint, run `run validate` and
   `run checkpoint show` before any project action; follow its sole next action
   and prohibited-action list.
3. Before creating, forking, or handing off a project session, or delegating a
   worker, resolve work mode from the current user instruction, `AGENTS.md`,
   the accepted Spec/Goal, and `.harness/config.json`. Run `worktree recommend`
   for a Harness-managed project. If the result is `ask` or those sources
   conflict, pause for user direction before calling the host tool.
   Authorization to create a session or worker is not authorization to create a worktree.
   Do not pass host-specific starting checkout or session state unless the
   current user explicitly requests that specific existing Git state.
   Parallel-writer isolation is a reason to ask,
   not permission to override an unresolved work-mode decision.
4. Controller means outcome owner and accepted-state owner. It may implement
   foreground work. Select `gate-only` only when the user or accepted Goal
   explicitly says the controller only reviews evidence; otherwise use
   `implementer` for edits inside accepted scope.
5. For accepted long-running controller work, establish or reuse a compatible
   runtime outcome when the host exposes `runtimeOutcome`. Use the host
   transient plan for multi-step work. Do not emulate
   missing runtime capabilities with extra repository artifacts.
6. Validate or create the repository Goal, then prepare a Run when durable
   execution is required:

```bash
node <plugin-root>/scripts/agent-harness.mjs goal validate --cwd <project> --goal <goal-file>
node <plugin-root>/scripts/agent-harness.mjs run prepare --cwd <project> --goal <goal-file>
```

   For an accepted one-entry Goal or Milestone, validate its versioned plan at
   `<target-filename>.plan.json` and prepare each eligible Goal with `--plan`.
   The target document's `Execution Plan:` line references that adjacent plan.
   Every Goal in a Milestone plan references the Milestone-adjacent plan;
   only a standalone single-Goal plan sits beside its Goal.
   If a Milestone Goal List has concrete Doc rows, the plan must cover those
   Goal paths exactly. Declarative row fields are bound, but Status may change.
   The plan has `version: 1`, a `{kind, path}` target, Goals with Task arrays,
   explicit ownership and acceptance references, and mandatory verification
   checks with `id`, `command`, and `inputs`.
   A single-Goal plan's optional root checks must exactly match assigned Task
   checks; a Milestone plan requires its own root checks.
   A planned Run uses manifest v2 and an enforced checkpoint; the existing
   unplanned path and manifest v1 remain legacy paths. Goal dependencies gate
   Run preparation; Task dependencies gate node execution.

7. Give ready DAG nodes to the host when `delegation` is available. Harness
   does not start workers, choose concurrency, cancel runtimes, or pin
   model/effort by default. Record
   node ownership, verification, and candidate evidence before dependents run.
   Do not launch a dependent node before its recorded dependencies complete.
   Workers return candidate evidence and State Sync Notes; only the controller
   writes accepted Goal, Task, status, Run, or gate state.
   A `reconciliation-required` checkpoint permits authoritative inspection
   only. Contract drift moves the old Run through `replan-required` to a
   validated replacement and `superseded`; never rebind its manifest.
8. Verify the accepted scope and durable required gates. Worker output remains
   candidate evidence until the accepted-state owner validates it.
   Before acceptance, challenge scope coverage, stale evidence, missing
   dependencies, path ownership, required checklist items, and whether the
   user's Milestone/Goal objective is larger than the local artifact.
9. Confirm authoritative Task/Goal phase, verification, required gates, and
   State Sync Notes. `blocked` is resumable and non-complete; Run state is
   evidence and status is a bounded projection.
10. Synchronize the configured Goal/Task/status/Run state. Keep status bounded;
   preview artifact compaction when configured limits are exceeded. Pruning is
   a separate explicit destructive action and never follows from state sync.
   Completion evidence must name changed files, commands/results, gate evidence,
   State Sync Notes, remaining work, and any true user decision.
11. Close with changed output, verification, accepted phase, `Need user`, and
    `Remaining`.

## One-Entry Controller Loop

For an accepted target, repeatedly call `execute next --goal <goal-file>` or
`execute next --milestone <milestone-file>`. Act on the returned action, then
read the next action again until it is `done` for the entire selected target.
Keep the user's accepted target fixed across Goal closeouts and later turns. If
the accepted target is a Milestone and `execute next --milestone` returns
`replan` because its plan is absent, create and bind the Milestone-adjacent
plan; do not replace the target with a child Goal. A Goal listed in an active
Milestone routes back to that Milestone by default. `--goal-slice` is only for
an explicit user instruction narrowing the accepted scope to that one Goal.
After each child Goal closes, query `execute next --milestone` again before
reporting completion. Optional checks or improvements outside required
acceptance are separate follow-up work; they do not pause ready Milestone work.
`orient next` with the target uses the same decision logic for read-only routing.
Do not end a turn with a pure “continue?” question when an accepted next step
is executable. Do not infer parent completion from a completed node or Run.

The stable next-action fields are `action`, `target`, `goal`, `run`, `node`,
`reason`, `checkpointRevision`, `requiredEvidence`, and `needUser`. Actions
are `execute-node`, `wait`, `review-node`, `verify-node`, `sync`,
`prepare-run`, `complete-goal`, `complete-milestone`, `reconcile`, `replan`,
`need-user`, and `done`. `reconcile` with `needUser: null` reports a non-user
blocker; `need-user` names a concrete decision or authority gap. A
`complete-milestone` action includes its anchor `run` and
`checkpointRevision`; pass that revision to `milestone complete`.

Before action, inspect pending project sync and uncertain external effects;
use `run sync --run <run> --expected-revision <revision>` to resume a pending
sync. A planned node start or block uses `run node record` with the current
checkpoint revision. Read current verification hashes with `plan inputs`
or `run node inputs`; the executor writes its candidate receipt to
`<run>/agents/<node>/candidate.json`. The controller
checks actual validation logs inside the node's own bound Run, check timestamps
at or after Run manifest creation, current input content hashes, source write
scope outside authoritative Harness artifacts, and gates,
then records `run node review --decision accepted|request-fix|blocked` with
evidence and expected revision. Only acceptance releases dependents. Request
bounded repair for failed verification; three identical failures without
progress block that item while other ready work continues. The next action is
`reconcile` with `needUser: null`, a specific no-progress reason and the
review receipt in `requiredEvidence`. A ready human Task with satisfied mapped
items and concrete Evidence goes to `verify-node`; verify that accepted record
and copy its decision into receipt `humanDecision` without asking again.
Unknown worker liveness requires host inspection before retry. Complete the Goal and then the
Milestone only after fresh evidence and resumable state sync pass their gates.
The controller runs necessary Task and stage checks and records their actual
logs. CLI commands validate those records; they do not run the checks. A
delegated receipt names the recorded worker in `executor.thread` when the node
was running. Milestone completion synchronizes `Current Status` and
`Goal List`, records `Completion Evidence Hash`, and advances its anchor checkpoint.
Stage logs belong inside that anchor Run, with check timestamps at or after
the latest required Goal Run completion time. A root Milestone explicitly
marked `blocked` prevents Run and Task starts until accepted recovery. Planned
Goals use explicit map labels without legacy batch or M-number inference.
Successful repeated completion preserves the revision; later accepted work
may replace the current status projection without reopening historical targets. A Goal explicitly marked
`blocked` returns `reconcile` and cannot be prepared or executed until
recovered.

Native runtime Goals and delegation require both current host capability and
authorization. When either is absent, continue foreground in the current
session. The loop is session driven; it does not create a scheduler, visible
chat, or automatic `AGENTS.md` edit. One-shot setup runs only when setup was
already authorized.

## Domain Invariants

- `harness-rule:path-containment`: every configured write, Goal/Spec reference,
  Run argument, and DAG artifact stays inside its configured project root,
  including existing-parent realpath and symlink checks.
- `harness-rule:run-dag-ownership`: a Run records ready nodes, dependencies,
  ownership, verification, and candidate evidence; scheduling belongs to the host.
- `harness-rule:pre-delegation-work-mode`: resolve local, worktree, or ask before
  host delegation; unresolved ask or conflicting sources pause for the user.
- `harness-rule:candidate-accepted-evidence`: executors return candidate
  evidence; only the accepted-state owner accepts gates or durable state.
- `harness-rule:authoritative-completion-state`: Task/Goal is the accepted-state
  authority with active, completed, or blocked phase; blocked is resumable and
  non-complete, Run stores evidence, and status is a bounded projection.
- `harness-rule:state-sync-evidence`: durable completion includes verified
  State Sync Notes and updates to already configured records.
- `harness-rule:bounded-status-snapshot`: status is a bounded current snapshot,
  while Goals, Runs, and gate records retain durable history.
- `harness-rule:project-neutral-core`: adapters own downstream paths and facts;
  plugin core stays project-neutral.
- `harness-rule:durable-tier-boundary`: ordinary clear change/build uses the
  current host directly; already recorded simple work may use postflight-only
  sync; durable ceremony is reserved for recovery, audit, milestone/DAG,
  multi-worker, persistent state sync, or high-risk control.
- `harness-rule:checkpoint-recovery`: explicitly enforced managed Runs use an
  independent revision-safe checkpoint; uncertain external state and contract
  drift fail closed, while disabled and legacy paths keep existing behavior.

## Boundaries

- Do not infer authorization for credentials, production access, destructive
  operations, daemons, release, deploy, publish, or other external side effects.
- Do not mark durable work complete without required verification, gates, DAG
  evidence, and state sync.
- Do not apply durable gates to direct or postflight-only work, and do not use
  postflight wording to bypass an existing enforced Run.
- Preserve fixed and adapter contracts and report in the user's language.

## Completion history and follow-up edits

Use explicit verification `exclude` paths for build output; tracked acceptance
rejects ignored inputs. Keep source, fixtures and configuration inputs bound.
The CLI preserves exact logs under the Run's `evidence/logs/` and seals input
hashes at Goal closeout. Commit the evidence with tracked Runs. Completed source
tasks may be resolved from the configured task archive after compaction.

A sealed completed target's `done` describes historical acceptance. Inspect
`evidenceScope` and `currentVerification`: `changed` requires separate current
validation for follow-up edits, not rewriting old receipts or reporting that
old tests verified the new code. Preserve the original Goal/Run and record the
follow-up Goal or bounded postflight evidence, then reconcile the current status
summary. Active work and dependency admission always require fresh evidence.
For legacy recovery, `run seal` requires the originally verified source and
logs and never turns stale evidence into acceptance.
