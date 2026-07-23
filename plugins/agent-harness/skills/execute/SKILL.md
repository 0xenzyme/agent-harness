---
name: execute
description: Execute accepted long-running controller or durable Harness work, or postflight-sync already tracked work; ordinary clear changes use Codex directly. / 执行主控长任务、持久化控制或已有状态同步。
---

# Harness Execute

Use this skill when accepted work needs durable recovery, audit, milestone
acceptance, a Run/DAG, multiple workers, persistent state sync, or high-risk
control, or when already completed simple work needs bounded postflight sync to
existing Harness state. A clear ordinary change/build request uses Codex
directly without this skill.

Read [Completion Evidence](references/completion-evidence.md) before accepting
or recording durable completion.
Read [Codex-Native Execution Bridge](../../references/codex-native-execution.md)
before selecting direct, postflight, or durable execution.
Read [Artifact Lifecycle](../../references/artifact-lifecycle.md) before
compacting task state or pruning Runs.
Read [Worker Runner Contract](../../references/worker-runner-contract.md) before
delegating any DAG node or worker.

## Workflow

1. Classify the request:
   - `codex-direct`: stop Harness execution; let Codex execute and verify.
   - `codex-direct-postflight`: verify completed work and update existing
     state only; create no lifecycle artifacts and do not apply durable
     completion gates.
   - `durable-harness`: continue below.
   A prepared enforced Run always remains durable.
2. For durable work, read `AGENTS.md`, inspect `.harness/config.json`, and load
   the configured adapter, accepted Spec/Goal, active Run, and required gates.
3. Before creating, forking, or handing off a project thread, or delegating a
   worker, resolve work mode from the current user instruction, `AGENTS.md`,
   the accepted Spec/Goal, and `.harness/config.json`. Run `worktree recommend`
   for a Harness-managed project. If the result is `ask` or those sources
   conflict, pause for user direction before calling the runtime tool.
   Authorization to create a thread is not authorization to create a worktree.
   Do not pass `startingState` unless the current user explicitly requests that
   specific existing Git state. Parallel-writer isolation is a reason to ask,
   not permission to override an unresolved work-mode decision.
4. Controller means outcome owner and accepted-state owner. It may implement
   foreground work. Select `gate-only` only when the user or accepted Goal
   explicitly says the controller only reviews evidence; otherwise use
   `implementer` for edits inside accepted scope.
5. For accepted long-running controller work, establish or reuse a compatible
   Codex runtime Goal. Use Codex Plan for multi-step work. Do not emulate
   missing runtime capabilities with extra repository artifacts.
6. Validate or create the repository Goal, then prepare a Run when durable
   execution is required:

```bash
node <plugin-root>/scripts/agent-harness.mjs goal validate --cwd <project> --goal <goal-file>
node <plugin-root>/scripts/agent-harness.mjs run prepare --cwd <project> --goal <goal-file>
```

7. Give ready DAG nodes to the Codex runtime. Harness does not start workers,
   choose concurrency, cancel runtimes, or pin model/effort by default. Record
   node ownership, verification, and candidate evidence before dependents run.
   Do not launch a dependent node before its recorded dependencies complete.
   Workers return candidate evidence and State Sync Notes; only the controller
   writes accepted Goal, Task, status, Run, or gate state.
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

## Domain Invariants

- `harness-rule:path-containment`: every configured write, Goal/Spec reference,
  Run argument, and DAG artifact stays inside its configured project root,
  including existing-parent realpath and symlink checks.
- `harness-rule:run-dag-ownership`: a Run records ready nodes, dependencies,
  ownership, verification, and candidate evidence; scheduling belongs to the runtime.
- `harness-rule:pre-delegation-work-mode`: resolve local, worktree, or ask before
  runtime delegation; unresolved ask or conflicting sources pause for the user.
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
- `harness-rule:durable-tier-boundary`: ordinary clear change/build uses Codex
  directly; already recorded simple work may use postflight-only sync; durable
  ceremony is reserved for recovery, audit, milestone/DAG, multi-worker,
  persistent state sync, or high-risk control.

## Boundaries

- Do not infer authorization for credentials, production access, destructive
  operations, daemons, release, deploy, publish, or other external side effects.
- Do not mark durable work complete without required verification, gates, DAG
  evidence, and state sync.
- Do not apply durable gates to direct or postflight-only work, and do not use
  postflight wording to bypass an existing enforced Run.
- Preserve fixed and adapter contracts and report in the user's language.
