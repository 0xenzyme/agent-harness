# Worker Runner Contract

Use this reference before launching, prompting, recording, or accepting a
worker, subagent, automation run, or external coding-agent result.

## Purpose

Keep delegation bounded and inspectable. A worker is an execution surface that
returns candidate evidence to the controller; it is not the acceptance lane.

## Worker Surfaces

- `codex-cli-subagent`: default bounded worker surface when available.
- `codex-app-thread`: explicit, visible, long-lived handoff lane.
- `command`: adapter- or operator-provided agent runner command.
- `none`: no suitable worker exists; stay in foreground execution or route to
  `ask`.

Use capability and safety to choose the surface. Do not treat worker
availability as permission to broaden scope, skip verification, or change the
controller's execution role.

## Launch Requirements

Every worker launch must name:

- controller thread or lane
- goal, run, and DAG node
- worker surface
- execution cwd, branch, and slot
- prompt artifact or launch packet
- allowed scope and forbidden scope
- required docs and source of truth
- validation command or evidence requirement
- return channel and output artifact, when applicable
- stop conditions

If any item is missing and it affects scope, authority, verification, or state
sync, do not launch the worker. Shape the goal/run or ask for confirmation.

## Worker Rules

- Work only inside the locked execution cwd and allowed scope.
- Do not modify the controller cwd when it differs from the execution cwd.
- Do not touch forbidden scope, credentials, paid APIs, production, destructive
  operations, release, deploy, publish, or daemon launch unless the goal and
  controller explicitly authorize it.
- Do not start dependent DAG nodes.
- Do not update accepted task, status, goal, run, gate, or release state.
- Do not mark work complete or promote candidate evidence to accepted evidence.
- Return concrete changed files, validation, known risks, dirty state, delivery
  state, and deferred items.

## Controller Rules

- Treat worker output as candidate evidence only.
- Record worker output before launching dependent nodes.
- Run or inspect verification before accepting state.
- Use adversarial acceptance before marking a task, goal, run, node, or gate
  complete.
- Record accepted state only from the controller lane.

## Failure Rule

If the worker cannot prove scope, verification, or state sync, record
`request-fix`, `blocked`, or `delivery pending`; do not convert the result into
completed state.
