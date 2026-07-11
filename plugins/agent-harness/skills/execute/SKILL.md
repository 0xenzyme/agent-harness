---
name: execute
description: Prepare or execute authorized Agent Harness work, including Goal creation, gates, verification, and state sync. Use after scope and safety boundaries are accepted; not for read-only status, rough intake, setup, or ambiguous direction. / 执行已授权范围，不用于未确认需求。
---

# Harness Execute

Execute an authorized implementation slice or act as the control lane for an
authorized Goal/run. Accepted scope may still need a repository Harness Goal;
prepare or validate it before editing. Do not treat a built-in Codex thread
goal as a substitute for the repository Goal artifact.

## Load Only The Active Path

- Route unclear: read [Routing Boundaries](references/routing-boundaries.md),
  [Route To Public Entry Mapping](../../references/route-entry-mapping.md), and
  [First-Principles Scope](../../references/first-principles-scope.md).
- Before editing or accepting output: read
  [Execution Roles](references/execution-roles.md).
- Creating a Goal or run: use the commands below and read
  [Task Routing](../../references/task-routing.md) only when classification or
  work mode is ambiguous.
- Launching or coordinating workers: read
  [Worker Runner Contract](../../references/worker-runner-contract.md) and
  [Controller Communication](../../references/controller-communication.md).
- Accepting completion: read
  [Completion Evidence](references/completion-evidence.md),
  [Adversarial Acceptance](references/adversarial-acceptance.md), and
  [Gate Results](../../references/gate-results.md).
- Final response: read
  [User-Facing Closeout](references/user-facing-closeout.md).

## Core Workflow

1. Read `AGENTS.md`, inspect the Harness config, and load the configured
   adapter, task/status state, and relevant spec/Goal/run.

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
```

2. Reconcile fresh conversation and Git observations with durable artifacts.
   Never inherit credentials, commit/push permission, delivery authorization,
   or product decisions from stale status text.
3. Confirm scope, non-goals, verification, completion conditions, pause
   conditions, execution role, `Execution Context Lock`, and delivery target. Route rough
   direction to `harness:intake`; use `harness:orient` for read-only shaping.
4. Select the role before editing:
   - `gate-only`: review candidate evidence and run gates; do not edit.
   - `implementer`: edit only the authorized scope.
   - `mixed`: edit and gate only after explicit acceptance; do not infer
     `mixed` from low-risk local work alone.
   “main control”, “gate”, “judge”, “review”, or “acceptance” defaults to
   `gate-only` only when the request concerns a confirmed Goal/run.
5. Prepare or validate the repository Goal when accepted scope needs a durable
   handoff. The internal `goal` route maps here; it is not a separate skill.

```bash
node <plugin-root>/scripts/agent-harness.mjs goal create --cwd <project> --task "<task>" --spec <spec-path>
node <plugin-root>/scripts/agent-harness.mjs goal create --cwd <project> --task "<task>" --allow-no-spec
node <plugin-root>/scripts/agent-harness.mjs goal validate --cwd <project> --goal <goal-file>
```

   Use `--allow-no-spec` only for explicitly accepted scope. Generated Goals
   must default to `validated-local` with all delivery authorizations `no`;
   raise the target only from fresh explicit authorization.
6. Prepare or inspect a run when controlled execution is useful.

```bash
node <plugin-root>/scripts/agent-harness.mjs run prepare --cwd <project> --goal <goal-file>
node <plugin-root>/scripts/agent-harness.mjs run status --cwd <project> --run <run-dir> --json
```

7. Follow the DAG. Launch only `readyNodes`. Default to sequential workers.
   Parallel launch is allowed only when every concurrent writer has a separate
   locked worktree/cwd, or all concurrent work is read-only or has proven
   non-overlapping file ownership. Record isolation evidence in the launch
   packets; otherwise launch one node at a time.
8. In `gate-only`, launch a worker subagent by default only after scope,
   verification, context lock, return contract, and isolation are explicit.
   Worker output is candidate evidence. If delegation falls back, report
   `harness-rule:degraded-execution-provenance`; cancellation is cooperative
   and late output remains quarantined candidate evidence.
9. In `implementer` or accepted `mixed`, edit only the owned DAG node or
   foreground scope. `harness-rule:level-0-fast-path` applies only to tiny,
   local, reversible fixes with no accepted Harness artifact, public protocol,
   schema, external system, product semantics, gate, or delivery obligation.
10. Verify, adversarially review completion, then synchronize task/status/run
    evidence. A status file is a bounded current snapshot and must not preserve
    obsolete authorization.

```bash
node <plugin-root>/scripts/agent-harness.mjs run node record --cwd <project> --run <run-dir> --node <node-id> --phase completed --summary "<summary>" --verification "<evidence>"
node <plugin-root>/scripts/agent-harness.mjs run record --cwd <project> --run <run-dir> --phase completed --summary "<summary>" --verification "<evidence>" --gate-evidence "<evidence>"
```

11. Report Delivery State separately. `implemented-local` and
    `validated-local` are not committed, pushed, reviewed, integrated, or
    released. Do not complete a run below its authorized target.
12. Close with changed/reviewed output, verification, Delivery State,
    `Need user`, and `Remaining`. Use `Need user: None` and `Remaining: None`
    when nothing remains.

## Hard Boundaries

Stable anchors applied through the referenced path-specific contracts:
`harness-rule:gate-only-controller`, `harness-rule:local-delivery-ceiling`,
`harness-rule:need-user-digest`, `harness-rule:bounded-status-snapshot`,
`harness-rule:degraded-execution-provenance`,
`harness-rule:controller-cancellation-boundary`,
`harness-rule:cybernetic-stability`, `harness-rule:intent-setpoint-selection`,
`harness-rule:sensor-freshness`, `harness-rule:measurement-snapshot`,
`harness-rule:remaining-gap`, `harness-rule:feedback-quality`, and
`harness-rule:stability-saturation`.

- Do not execute ambiguous product direction or broaden authority from route
  selection.
- Do not let a `gate-only` controller patch candidate output.
- A `gate-only` cannot use Level 0 to edit implementation files.
- Do not invent or inherit delivery authorization; commit, push, PR, review,
  integration, release, deploy, credentials, paid APIs, production,
  destructive operations, and daemons require fresh explicit authority.
- Do not mark work complete without verification, state-sync evidence, all
  enforced DAG nodes, required checklist items, and adapter gates.
- Do not treat worker self-tests, build success, page existence, or narrative
  summaries as accepted completion by themselves.
- Preserve fixed-contract behavior and adapter-configured paths. Keep plugin
  core project-neutral.
- Report in the user's language while preserving code, command, path, package,
  skill, API, model, acronym, and Git commit message spelling.
