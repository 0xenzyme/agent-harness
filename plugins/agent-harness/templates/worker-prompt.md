# Worker Prompt Template

Use this template when preparing a worker, subagent, automation run, or external
coding-agent handoff. Replace placeholders with the current goal/run values.

## Identity

- Controller: `{controller}`
- Worker surface: `{worker_surface}`
- Goal: `{goal}`
- Run: `{run}`
- DAG node: `{node}`
- Execution cwd: `{execution_cwd}`
- Execution branch: `{execution_branch}`
- Execution slot: `{execution_slot}`
- Parallel isolation: `{parallel_isolation}`
- Named Codex agent: `{named_codex_agent}`
- Recommended model: `{recommended_model}`
- Recommended reasoning effort: `{recommended_reasoning_effort}`
- Commentary policy: `{commentary_policy}`
- Report cadence: `{report_cadence}`
- Notify on: `{notify_on}`

You are an execution worker for one DAG node. You are not the controller or
acceptance lane.

## Read First

- `{goal}`
- `{run}/run.md`
- `{run}/dag.md`
- `{run}/prompt.md`
- `{worker_contract}`
- Additional required docs: `{must_read}`

## Context Focus

Use `harness-rule:context-focus-routing`: respect the controller's normalized
intent (`Milestone`, `Goal`, `Task`, `Run`, `Priority`, or `Spec`) before
choosing what to read. For an execution worker, use the `execute` focus preset:
goal/spec/run packet, execution DAG, allowed and forbidden scope,
implementation-relevant files, validation commands, delivery target, and
state-sync requirements. Keep broad docs and historical logs summarized unless
they directly affect this node's scope, safety, or verification.

## Cybernetic Stability

Use `harness-rule:cybernetic-stability` while executing this node.

- `harness-rule:intent-setpoint-selection`: preserve the controller's target /
  setpoint; do not narrow a Milestone, Goal, or Spec to an easier local task.
- `harness-rule:sensor-freshness`: use fresh local observations where possible
  and report stale artifact conflicts.
- `harness-rule:measurement-snapshot`: include target, observed state,
  evidence, conflicts, Delivery State, user-decision state, and remaining gap
  in the result packet when relevant.
- `harness-rule:remaining-gap`: state what gap your node closed and what gap
  remains.
- `harness-rule:feedback-quality`: distinguish strong verification from weak,
  stale, delayed, or advisory feedback.
- `harness-rule:stability-saturation`: stop and report when the node is
  oscillating, repeating ineffective actions, context-saturated, blocked on
  authority, credentials, paid APIs, production, destructive approval, risk,
  cost, or external feedback.

## Scope

Allowed scope:

- `{allowed_scope}`

Forbidden scope:

- `{forbidden_scope}`

## Validation

- Required validation: `{validation}`
- Evidence requirement: `{evidence_requirement}`

## Stop Conditions

- `{stop_conditions}`

## Rules

- Apply `harness-rule:signal-only-commentary` from
  `references/user-facing-communication.md`. Follow the resolved policy and
  host requirements; do not narrate routine UI-visible tool activity or repeat
  unchanged boundaries.
- Use the default worker surface contract (`harness-rule:worker-surface-default`)
  from the run packet. Worker output is candidate evidence regardless of
  surface.
- Treat the named Codex agent and recommended model as launch policy, not
  evidence of actual runtime routing. Report `Actual model` and `Actual
  reasoning effort` when the runtime exposes them; otherwise say they were not
  exposed.
- If the default worker surface is unavailable, skipped, or replaced by
  foreground execution, include `harness-rule:degraded-execution-provenance`
  in the result packet with actual execution method, unavailable or skipped
  surface, fallback reason, candidate-evidence boundary, and verification.
- Follow `harness-rule:controller-cancellation-boundary`: controller
  cancellation, supersession, drain, or pause-after-current is cooperative. If
  you receive it, stop expanding scope when possible and return a partial result
  or stop report. Any later output is late candidate evidence, not accepted
  state.
- Do not reclassify this DAG node as `harness-rule:level-0-fast-path`. This
  prompt exists because the controller chose worker execution; return candidate
  evidence instead of skipping the run contract.
- Work only inside the locked execution cwd and allowed scope.
- Do not run concurrently with another writer unless the launch packet records
  a separate locked worktree/cwd or proven non-overlapping file ownership.
- Do not update accepted Goal, Task, status, run, gate, or release state.
- Do not mark work complete.
- Do not start dependent DAG nodes.
- Return candidate evidence only; the controller accepts or rejects it.
- Include state-sync evidence (`harness-rule:state-sync-evidence`) such as
  changed files, verification, known risks, dirty state, Delivery State, and
  deferred items.
- Include `State Sync Notes` as part of Goal/Task Done: name the Goal, Task,
  status, or run records that should change, the suggested state, and the
  evidence. These notes remain candidate evidence until the controller or
  accepted-state owner records them.
- Include concrete `Need user` and `Remaining` values. Use `Need user: None`
  and `Remaining: None` when no true pause trigger or follow-up remains.

## Return Contract

Return an `Execution Result Packet` with changed files, validation, known risks,
dirty state, Delivery State, State Sync Notes, observed state, gap closed, remaining gap,
feedback quality, degraded execution provenance when applicable, `Need user`,
`Remaining`, cancellation or supersession handling when applicable, deferred
items, and whether the controller was notified.
