---
name: execute
description: Execute confirmed Agent Harness implementation or gate work with verification and state sync. Use only when scope, role, verification, completion conditions, and pause conditions are accepted. Do not use for read-only orientation, new idea intake, harness adoption/init/import, vague next-step questions, or unconfirmed specs/goals; route those to orient, intake, init, shape, goal, or ask. / 执行已确认的 Agent Harness 实现或 gate 工作，并完成验证与状态同步；仅在 scope、role、verification、completion conditions 和 pause conditions 已接受时使用；不要用于只读定位、新想法收集、harness 接入/初始化/导入、模糊下一步问题或未确认 specs/goals。
---

# Harness Execute

Use this skill when the user has authorized a concrete implementation slice or
asked the current thread to act as the control lane for a confirmed task.

## Reference Map

- Use [Routing Boundaries](references/routing-boundaries.md) when the request
  needs route selection before execution.
- Use [Execution Roles](references/execution-roles.md) before editing files,
  accepting worker output, or combining roles.
- Use [Completion Evidence](references/completion-evidence.md) before marking
  task, goal, run, or gate state complete.
- Use [First-Principles Scope](../../references/first-principles-scope.md)
  when scope, source of truth, verification, or pause triggers are ambiguous
  before execution.
- Use [Worker Runner Contract](../../references/worker-runner-contract.md)
  before launching, prompting, recording, or accepting worker / subagent output.
- Use [Controller Communication](../../references/controller-communication.md)
  before launching workers, handing off DAG nodes, or accepting worker result
  packets.
- Use [Gate Results](../../references/gate-results.md) before recording
  acceptance, integration, or adapter-required gate outcomes.
- Use [Adversarial Acceptance](references/adversarial-acceptance.md) before
  accepting worker output, recording completed state, or reporting a gate as
  passed.
- Use [User-Facing Closeout](references/user-facing-closeout.md) before the
  final response to compress execution evidence into a clear delivery-state
  summary.

## Workflow

1. Read repo instructions such as `AGENTS.md`.
2. Resolve harness contract and configured paths:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
```

3. Read `.harness/config.json`, the configured project adapter, task index,
   status file, and the relevant spec / goal / run packet.
4. Determine the execution role before editing files:
   - `gate-only`: the current thread is the control / acceptance lane. It
     may inspect candidate output, run verification, request fixes, and accept
     or block state, but it must not directly edit implementation files.
   - `implementer`: the current thread may edit files inside the authorized
     scope and then present evidence for acceptance.
   - `mixed`: the current thread may both edit and gate only when the user
     explicitly accepts the tradeoff or the confirmed goal/run declares
     `mixed`; do not infer `mixed` from low-risk local work alone.
   User language such as "control lane", "main control", "gate", "judge",
   "review", or "acceptance" defaults to `gate-only` unless the user clearly
   asks the current thread to implement directly.
5. Confirm the Conversation Route and Execution Context Lock before editing:
   - `current-thread`: continue only if the current cwd / branch match the
     lock.
   - `slot-thread`: prepare a handoff packet and continue in the slot thread.
   - `remote-control-worktree`: use the locked execution cwd explicitly and do
     not patch the control-lane cwd.
   For `worktree` goals, `goal validate` must pass the route/lock gate before
   `run prepare`.
6. Confirm the executable scope, non-goals, verification commands, completion
   conditions, and pause conditions. If any of these are missing, route to
   `shape`, `goal`, or `ask`, or pause for confirmation. Continue only when the
   missing item is clearly not applicable or already supplied by a confirmed
   spec, goal, or run.
   Briefly record why this is `shape`, `goal`, `execute`, `competition`, or
   `ask`, and record the execution role when it affects scope or acceptance.
   For ambiguous routing, read [Task Routing](../../references/task-routing.md).
   If source of truth, scope, non-goals, verification, or pause triggers are
   ambiguous, also read
   [First-Principles Scope](../../references/first-principles-scope.md) before
   choosing a route.
   Conservative routing may switch to `orient`, `intake`, `init`, `shape`,
   `goal`, or `ask`, or pause for confirmation; it must not grant broader
   execution permission from inside `execute`.
   For spec-heavy, product, content, security, data, or milestone work, turn
   accepted spec acceptance into a `Spec Acceptance Checklist` before
   implementation. If the checklist is missing and the difference between
   technical completion and product acceptance matters, pause to shape or amend
   the goal instead of implementing against vague prose.
   When the user asks to complete a roadmap stage or milestone, such as
   "complete M5" or "推进完成M5", treat the target as whole-stage completion by
   default. If the spec has implementation phasing items such as `M5-S0` and
   `M5-D1`, create or require a `Stage Completion Map`; source-spec acceptance
   alone must not mark the parent stage done unless the user explicitly narrowed
   the task to that leaf stage.
7. If the user asks what to do next before authorizing work, switch to orient:

```bash
node <plugin-root>/scripts/agent-harness.mjs orient next --cwd <project>
```

8. Create, inspect, or validate a goal when a durable handoff is needed:

```bash
node <plugin-root>/scripts/agent-harness.mjs goal create --cwd <project> --task "<task title>" --spec <spec-path>
node <plugin-root>/scripts/agent-harness.mjs goal create --cwd <project> --task "<task title>" --allow-no-spec
node <plugin-root>/scripts/agent-harness.mjs goal validate --cwd <project> --goal <goal-file>
```

Use `--allow-no-spec` only when accepted scope is already explicit and no
separate spec is intended. Spec-less goals must still validate Scope,
Non-Goals, Verification, Completion Conditions, Pause Conditions, Execution
Role, and Delivery State.

9. Prepare or inspect a run packet when useful for controlled execution:

```bash
node <plugin-root>/scripts/agent-harness.mjs run prepare --cwd <project> --goal <goal-file>
node <plugin-root>/scripts/agent-harness.mjs run status --cwd <project> --run <run-dir> --json
```

10. If the role is `gate-only`, do not implement directly and do not ask the
   user to choose between worker launch and changing the control thread to
   `mixed`. Launch a worker subagent by default when scope, verification,
   context lock, delivery target, and safety boundaries are clear; run packets
   default worker nodes to `codex-cli-subagent`. Review the implementer output,
   compare it to the goal, run verification, and either accept state or request
   concrete corrections. Before launching, prompting, recording, or accepting
   worker output, read
   [Worker Runner Contract](../../references/worker-runner-contract.md) and
   [Controller Communication](../../references/controller-communication.md) and
   use the relevant launch, result, or integration packet fields. Worker output
   is candidate evidence only until the controller validates and accepts it.
   This is `harness-rule:gate-only-controller`: the control lane stays the
   acceptance lane and does not directly edit implementation files.
11. If the run packet has `dag.json`, use it as the execution order:
   - Launch only `readyNodes` from `run status --json`.
   - Nodes in the same ready set may run in parallel.
   - Prefer `codex-cli-subagent` for workers.
   - Use `templates/worker-prompt.md` as the stable prompt shape when preparing
     manual or generated worker handoffs.
   - Create a new Codex App thread only for an explicit, visible, long-lived
     handoff lane.
   - Do not use fork unless the controller explicitly approves inherited
     context and restates the worker role and return contract.
   - Record each worker result before launching dependents:

```bash
node <plugin-root>/scripts/agent-harness.mjs run node record --cwd <project> --run <run-dir> --node <node-id> --phase completed --summary "<summary>" --verification "<verification summary>"
node <plugin-root>/scripts/agent-harness.mjs run node record --cwd <project> --run <run-dir> --node <node-id> --phase blocked --summary "<blocker summary>"
```

12. If the role is `implementer` or accepted `mixed`, implement only the
   authorized scope when the current thread owns the relevant DAG node or the
   run is foreground-only.
13. Run verification, then update configured task/status/run evidence and record
   deferred work. When deterministic maintenance is useful, preview or record
   it explicitly:

```bash
node <plugin-root>/scripts/agent-harness.mjs maintain tasks --cwd <project>
node <plugin-root>/scripts/agent-harness.mjs maintain tasks --cwd <project> --record
```

14. Record a run outcome when a run packet exists:

```bash
node <plugin-root>/scripts/agent-harness.mjs run record --cwd <project> --run <run-dir> --phase completed --summary "<summary>" --verification "<verification summary>" --gate-evidence "<gate-only evidence when needed>"
node <plugin-root>/scripts/agent-harness.mjs run record --cwd <project> --run <run-dir> --phase blocked --summary "<blocker summary>"
```

15. Before accepting worker output, recording completed state, or reporting a
    gate as passed, read
    [Adversarial Acceptance](references/adversarial-acceptance.md) and try to
    reject completion against scope, accepted evidence, required gates, Delivery
    State, stale artifacts, and closeout clarity.
16. Before accepting gate, integration, or adapter-required state, read
    [Gate Results](../../references/gate-results.md) and cite concrete evidence
    for the gate decision. Candidate evidence is not accepted state until the
    control lane validates it.
17. Report Delivery State explicitly. If the state is `implemented-local` or
    `validated-local`, say that local implementation / verification is complete
    but it is not committed, pushed, reviewed, integrated, or released unless
    the recorded delivery fields prove otherwise.
    This is `harness-rule:local-delivery-ceiling`: local verification is not
    delivery evidence above the local ceiling.
    If Target Delivery State is above the actual state and the goal authorizes
    the required delivery steps, continue the delivery pipeline before
    closeout. Use `--review-url`, `--integration-ref`, or `--release-ref` with
    `run record` when Git alone cannot prove review / integration / release
    state. `--pr-url` and `--merge-sha` are accepted as compatibility aliases.
    If Target Delivery State is above the actual state but authorization or
    external evidence is missing, report `delivery pending`; do not mark the
    run completed.
18. Before the final answer, read
    [User-Facing Closeout](references/user-facing-closeout.md) and summarize
    changed files or reviewed output, verification, Delivery State, and remaining
    blocker or next action. Do not paste full run or gate packets unless the user
    asks for audit or handoff detail.

## Boundaries

- Do not execute ambiguous product direction without confirmation.
- Do not use route choice inside `execute` to grant implementation permission
  that the user, confirmed goal, or run packet did not already provide.
- Do not combine control-lane acceptance and implementation when the user has
  asked for gate-only, control-only, review-only, or acceptance-lane behavior.
- Do not present worker launch vs. `mixed` as a routine user choice. In
  `gate-only`, default to worker subagent unless subagent execution is
  unavailable, unsafe, or lacks enough context.
- Do not describe dirty or uncommitted dev-worktree output as complete on the
  integration line, integrated, shipped, or released.
- Do not mark a run completed below its Target Delivery State.
- Do not modify `AGENTS.md` or activation behavior without explicit approval.
- Do not release, deploy, use credentials, use paid APIs, touch production,
  perform destructive operations, start daemons, or execute delivery steps above
  the Delivery State policy without explicit approval.
- Do not mark work complete without verification and state sync.
- Do not mark an enforced-DAG run complete before every DAG node is recorded as
  completed with verification evidence.
- Do not treat candidate evidence, worker self-tests, page existence, build
  success, curl smoke checks, or narrative summaries as accepted completion
  when the goal has checklist items or adapter-required gates.
- Treat subagents, inbox threads, automation, and proposal competition as
  candidate evidence sources. The active control thread owns final acceptance
  after validation.
- Treat forked threads as an exception, not a default worker surface; a fork
  needs explicit controller approval because inherited context can confuse
  controller and execution roles.
- In `gate-only` mode, accepted state must cite implementer output plus
  concrete verification evidence; the control thread should not rewrite the
  candidate output itself.
- Completed run records require verification evidence. Completed `gate-only`
  records also require gate evidence that names the implementer output and
  acceptance evidence reviewed by the control lane.
- Completed runs with `Spec Acceptance Checklist` items require concrete
  evidence and `Status: satisfied` for each item. Completed runs with
  adapter-declared `gates.requiredForCompletion` or `gates.blocking` require
  matching `Required Gate Evidence` items with concrete evidence and
  `Status: satisfied`.
- Completed parent-stage runs with `Stage Completion Map` items require
  concrete evidence and `Status: satisfied` for every stage item. Do not mark a
  parent stage such as `M5` done after only `M5-S0` source-spec acceptance
  unless the remaining implementation items are explicitly outside that stage.
- Keep accepted state inspectable: cite concrete task entries, specs, goals,
  run records, gate records, command summaries, or human review notes.
- Keep plugin core docs and templates project-neutral; put local facts in the
  project adapter and project artifacts.
- Preserve fixed-contract behavior and adapter-configured paths.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
