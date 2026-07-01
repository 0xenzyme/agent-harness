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

You are an execution worker for one DAG node. You are not the controller or
acceptance lane.

## Read First

- `{goal}`
- `{run}/run.md`
- `{run}/dag.md`
- `{run}/prompt.md`
- `{worker_contract}`
- Additional required docs: `{must_read}`

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

- Use the default worker surface contract (`harness-rule:worker-surface-default`)
  from the run packet. Worker output is candidate evidence regardless of
  surface.
- Work only inside the locked execution cwd and allowed scope.
- Do not update accepted task, status, goal, run, gate, or release state.
- Do not mark work complete.
- Do not start dependent DAG nodes.
- Return candidate evidence only; the controller accepts or rejects it.
- Include state-sync evidence (`harness-rule:state-sync-evidence`) such as
  changed files, verification, known risks, dirty state, Delivery State, and
  deferred items.

## Return Contract

Return an `Execution Result Packet` with changed files, validation, known risks,
dirty state, Delivery State, deferred items, and whether the controller was
notified.
