---
name: execute
description: Execute accepted durable Harness Goals and Runs for recovery, audit, milestones, DAGs, multi-worker or high-risk work; ordinary clear changes use Codex directly. / 执行已接受的持久化控制工作。
---

# Harness Execute

Use this skill only when accepted work needs durable recovery, audit, state
sync, milestone acceptance, a Run/DAG, multiple workers, or high-risk control.
A clear ordinary change/build request should be executed directly by Codex.

Read [Completion Evidence](references/completion-evidence.md) before accepting
or recording durable completion.

## Workflow

1. Read `AGENTS.md`, inspect `.harness/config.json`, and load the configured
   adapter, accepted Spec/Goal, active Run, and required gates.
2. Select `gate-only` or `implementer`. A gate-only lane reviews candidate
   evidence and accepted state; an implementer edits only its owned scope.
3. Validate or create the repository Goal, then prepare a Run when durable
   execution is required:

```bash
node <plugin-root>/scripts/agent-harness.mjs goal validate --cwd <project> --goal <goal-file>
node <plugin-root>/scripts/agent-harness.mjs run prepare --cwd <project> --goal <goal-file>
```

4. Give ready DAG nodes to the Codex runtime. Harness does not start workers,
   choose concurrency, cancel runtimes, or pin model/effort by default. Record
   node ownership, verification, and candidate evidence before dependents run.
5. Verify the accepted scope and required gates. Worker output remains
   candidate evidence until the accepted-state owner validates it.
   Before acceptance, challenge scope coverage, stale evidence, missing
   dependencies, path ownership, required checklist items, and whether the
   user's Milestone/Goal objective is larger than the local artifact.
6. Record run-scoped Delivery State from the Run start snapshot, current delta,
   and explicit evidence. A clean upstream checkout alone is not this Run's
   push evidence.
7. Synchronize the configured Goal/Task/status/Run state. Keep status bounded.
   Completion evidence must name changed files, commands/results, gate evidence,
   Delivery State, State Sync Notes, remaining work, and any true user decision.
8. Close with changed output, verification, Delivery State, `Need user`, and
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
  directly; durable ceremony is reserved for recovery, audit, milestone/DAG,
  multi-worker, state-sync, or high-risk control.

## Boundaries

- Do not infer delivery authorization, credentials, production access,
  destructive operations, daemons, release, deploy, publish, commit, or push.
- Do not mark durable work complete without required verification, gates, DAG
  evidence, and state sync.
- Preserve fixed and adapter contracts and report in the user's language.
