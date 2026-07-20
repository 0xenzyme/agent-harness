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

## Workflow

1. Classify the request:
   - `codex-direct`: stop Harness execution; let Codex execute and verify.
   - `codex-direct-postflight`: verify completed work and update existing
     tracked state only; create no lifecycle artifacts and do not apply durable
     completion gates.
   - `durable-harness`: continue below.
   A prepared enforced Run always remains durable.
2. For durable work, read `AGENTS.md`, inspect `.harness/config.json`, and load
   the configured adapter, accepted Spec/Goal, active Run, and required gates.
3. Controller means outcome owner and accepted-state owner. It may implement
   foreground work. Select `gate-only` only when the user or accepted Goal
   explicitly says the controller only reviews evidence; otherwise use
   `implementer` for edits inside accepted scope.
4. For accepted long-running controller work, establish or reuse a compatible
   Codex runtime Goal. Use Codex Plan for multi-step work. Do not emulate
   missing runtime capabilities with extra repository artifacts.
5. Validate or create the repository Goal, then prepare a Run when durable
   execution is required:

```bash
node <plugin-root>/scripts/agent-harness.mjs goal validate --cwd <project> --goal <goal-file>
node <plugin-root>/scripts/agent-harness.mjs run prepare --cwd <project> --goal <goal-file>
```

6. Give ready DAG nodes to the Codex runtime. Harness does not start workers,
   choose concurrency, cancel runtimes, or pin model/effort by default. Record
   node ownership, verification, and candidate evidence before dependents run.
7. Verify the accepted scope and durable required gates. Worker output remains
   candidate evidence until the accepted-state owner validates it.
   Before acceptance, challenge scope coverage, stale evidence, missing
   dependencies, path ownership, required checklist items, and whether the
   user's Milestone/Goal objective is larger than the local artifact.
8. Record run-scoped Delivery State from the Run start snapshot, current delta,
   and explicit evidence. A clean upstream checkout alone is not this Run's
   push evidence.
9. Synchronize the configured Goal/Task/status/Run state. Keep status bounded;
   preview artifact compaction when configured limits are exceeded. Pruning is
   a separate explicit destructive action and never follows from state sync.
   Completion evidence must name changed files, commands/results, gate evidence,
   Delivery State, State Sync Notes, remaining work, and any true user decision.
10. Close with changed output, verification, Delivery State, `Need user`, and
   `Remaining`.

## Domain Invariants

- `harness-rule:path-containment`: every configured write, Goal/Spec reference,
  Run argument, and DAG artifact stays inside its configured project root,
  including existing-parent realpath and symlink checks.
- `harness-rule:run-dag-ownership`: a Run records ready nodes, dependencies,
  ownership, verification, and candidate evidence; scheduling belongs to the runtime.
- `harness-rule:candidate-accepted-evidence`: executors return candidate
  evidence; only the accepted-state owner accepts gates or durable state.
- `harness-rule:local-delivery-ceiling`: local implementation or validation is
  not commit, push, review, integration, release, or deploy evidence.
- `harness-rule:run-scoped-delivery`: delivery claims require this Run's Git
  delta or explicit evidence relative to its recorded start snapshot.
- `harness-rule:state-sync-evidence`: durable completion includes verified
  State Sync Notes and updates to already configured records.
- `harness-rule:bounded-status-snapshot`: status is a bounded current snapshot,
  while Goals, Runs, and gate records retain durable history.
- `harness-rule:project-neutral-core`: adapters own downstream paths and facts;
  plugin core stays project-neutral.
- `harness-rule:durable-tier-boundary`: ordinary clear change/build uses Codex
  directly; already tracked simple work may use postflight-only sync; durable
  ceremony is reserved for recovery, audit, milestone/DAG, multi-worker,
  persistent state sync, or high-risk control.

## Boundaries

- Do not infer delivery authorization, credentials, production access,
  destructive operations, daemons, release, deploy, publish, commit, or push.
- Do not mark durable work complete without required verification, gates, DAG
  evidence, and state sync.
- Do not apply durable gates to direct or postflight-only work, and do not use
  postflight wording to bypass an existing enforced Run.
- Preserve fixed and adapter contracts and report in the user's language.
