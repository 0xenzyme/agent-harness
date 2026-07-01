# Task Routing Reference

Task routing chooses the lightest harness flow that is still safe.

Use [First-Principles Scope](first-principles-scope.md) when objective, source
of truth, scope, non-goals, verification, or pause triggers are ambiguous.

## Decision Inputs

- Priority: `P0`, `P1`, `P2`, `P3`.
- Scope: single-file, single-area, cross-area, cross-module, milestone.
- Product or domain risk.
- Source-of-truth risk.
- Engineering abstraction or reuse risk.
- External risk: credentials, paid APIs, production data, destructive changes.
- Existing coverage by a spec, adapter, helper, or gate.
- Current conversation-confirmed state from the active control thread,
  including explicit user or controller decisions that revise older artifacts.
- User intent: question, discussion, review, or implementation.
- Requested execution role: `gate-only`, `implementer`, or `mixed`.

## Task Kinds

`kind` describes the work pattern. It is separate from `state`.

- `development`: scoped implementation, review, repair, or documentation work
  with a concrete completion condition.
- `observe`: ongoing monitoring that records signals before deciding whether
  follow-up action is needed.
- `research`: bounded investigation that produces findings, recommendations,
  or a spec.
- `ops`: operational work such as maintenance, release coordination, or manual
  checks.
- `docs`: documentation-only work.

Adapter projects may add project-specific labels, but they should preserve the
generic meaning of `development` and `observe`.

## Observe Tasks

Observe tasks are first-class harness tasks. They model:

```text
observe -> signal -> triage -> action
```

Use `observe` when the task is not complete after one implementation pass and
instead monitors a source over time. Examples include SEO indexing, traffic
changes, error rates, provider status, or recurring content quality checks.

Observe task states:

- `watching`: observation is active.
- `signal`: a notable signal has been recorded.
- `triage`: the signal is being evaluated.
- `action-needed`: follow-up work should be created or linked.
- `paused`: observation is intentionally paused.
- `closed`: observation is no longer active.

Harness core defines the observe protocol. Project adapters declare the
project's observe sources, signal records, triage gates, and whether follow-up
tasks may be created automatically.

## Levels

### Level 0: Fast Path

Use for typos, small local fixes, and clear bugs that do not change product or
project semantics. No spec is required by default.

### Level 1: Light Adapter

Use for bounded changes covered by existing docs or adapter rules. Record a
short route decision when useful.

### Level 2: Standard Adapter

Use for important tasks, cross-area changes, new abstractions, source-of-truth
changes, or user-visible semantics. Require a spec or explicit existing spec
coverage.

### Level 3: Full Roadmap / Milestone

Use for milestone work, multi-task DAGs, high-risk operations, or parallel
execution. Require milestone gates and explicit state sync.

## Conversation Vs Artifact State

Artifacts are the durable source of truth, but the active control thread may
contain newer conversation-confirmed state that has not been recorded yet. If
the user or controller explicitly accepts a revised plan, milestone, spec,
goal, or execution route, use that newer decision for route selection and
report any older artifacts as stale.

Do not route execution through a superseded artifact just because it is still
on disk. Recommend `shape`, `goal`, `intake`, state sync, or `ask` until the
durable artifacts match the active decision. Cite both sides of the mismatch:
the newer conversation-confirmed state and the artifact that still reflects the
old plan.

## Optional Competition

Use proposal competition only as an optional Shape protocol for ambiguous
route selection, broad audits, repeated repair failure, or high-risk design
choices. Competition should return candidate routes, tradeoffs, coverage union,
risks, and a recommendation. It must not directly execute the selected route;
execution starts only after the control lane accepts a route.

Competition must not create branches/worktrees, write task/status state, start
daemons, prepare runs, push, open PRs, deploy, or mark tasks done. This package
documents the protocol; it does not install `harness:compete` as a workflow
skill.

## Idea Inbox Routing

Use `intake` when the source is a rough idea, capture-thread note, requirement,
bug report, or question that has not been accepted as executable scope.

Idea Inbox routing should return:

- the raw idea or summary
- duplicate or related tasks/artifacts
- suggested priority and section
- whether a spec is likely needed
- the confirmation needed before recording or execution

Do not route directly from Idea Inbox to `execute` unless the control lane has
accepted scope, non-goals, verification, completion conditions, and pause
conditions.

## Task-State Recommendations

`orient next` must not recommend a command that the goal toolchain will reject.

Before recommending execution, reduce the request through the
first-principles scope check: objective, source of truth, hard constraints,
non-goals, verification evidence, and pause trigger must be concrete enough to
execute safely.

- P0/P1 `todo` or `spec-draft` without a linked spec routes to `shape` or
  accepted-scope confirmation, not `goal create`.
- `spec-ready` with a linked spec routes to
  `goal create --spec <spec-path>`.
- `spec-ready` without a linked spec routes to fixing the task/spec link first.
- `goal-ready` routes to an existing goal when one is linked or discoverable:
  validate the goal and prepare a run. If no goal exists, create one from the
  confirmed spec or use the explicit `--allow-no-spec` path only when accepted
  scope is already the source of truth.

## Execution Roles

Execution role is separate from work mode. Work mode says where work happens
(`local`, `worktree`, or `ask`); execution role says what the current thread is
allowed to do.

- `gate-only`: the current thread is the control / acceptance lane. It may
  inspect candidate output, run verification, request corrections, and accept
  or block state. It must not directly edit implementation files.
- `implementer`: the current thread may edit files inside the authorized scope
  and then present evidence for acceptance.
- `mixed`: the current thread may both edit and gate only when the user
  explicitly accepts that tradeoff, or the confirmed goal/run declares `mixed`.
  Do not infer `mixed` from low-risk local work alone.

If the user says "main control", "control lane", "gate", "judge", "review",
or "acceptance", default to `gate-only` unless they explicitly ask the current
thread to implement directly.

Completed state must be backed by run evidence. `gate-only` completion requires
both verification evidence and gate evidence that cites implementer output.

## Conversation Route And Delivery State

When routing work to `worktree`, return both file-location state and
conversation ownership:

- `current-thread`: the active thread owns the locked cwd / branch.
- `slot-thread`: continue in a dedicated slot thread before editing.
- `remote-control-worktree`: the active thread may control a different locked
  worktree only after explicit approval.

Before execution, record an Execution Context Lock with conversation lane,
controller thread, execution cwd, execution branch, execution slot, and
remote-control worktree yes/no. If the lock does not match the current cwd /
branch, pause or migrate to the correct thread unless remote-control execution
is explicitly allowed.

Closeout must report Delivery State separately from implementation status:
`implemented-local`, `validated-local`, `committed`, `pushed`, `review-open`,
`integrated`, or `released/shipped`. `PR-open` and `merged` are compatibility
aliases for provider-specific inputs, not the primary terms. If work is only
dirty or uncommitted in a dev worktree, route the next action to review local
diff, then explicit commit / review request or discard. Do not route that state
as integrated or complete on the integration line.

When the goal's Target Delivery State is above the actual state and the matching
authorization fields are `yes`, route forward into the delivery pipeline
instead of stopping at local validation. Only route to user handoff when the
target is `validated-local`, authorization is missing, or external review /
integration / release evidence must be supplied.

## Agent-Neutral Delegation

Delegation is capability-driven, not Codex-specific. A controller may hand work
to Codex CLI subagents, explicit Codex App handoff threads, another
coding-agent worker, or no worker at all only when that surface can return a
concrete result packet: changed files, summary, verification, known risks, stop
conditions, and state-sync notes.

Use [Worker Runner Contract](worker-runner-contract.md) before worker launch or
acceptance. The contract makes worker output candidate evidence, not accepted
state.

Prefer `codex-cli-subagent` for worker execution; run packets should default
worker nodes to that surface when it is available. A new Codex App thread is
for explicit, visible, long-lived handoff lanes, not the default worker
surface. Avoid fork as the default because inherited history can confuse
controller and execution roles. Use fork only when the controller explicitly
approves inherited context and repeats the worker role, source controller
thread, allowed scope, forbidden scope, return channel, and result packet
contract.

When the active conversation is `gate-only`, route clear implementation work to
a worker subagent by default. Do not ask the user to choose between launching a
worker and changing the controller to `mixed` unless subagent execution is
unavailable, unsafe, or under-specified.

Parallel worker execution must follow the run packet's execution DAG. Ready
nodes with no unmet dependencies may be launched together; dependent nodes must
wait until their prerequisites are recorded with `run node record`.

If those capabilities are missing, stay in foreground execution or route to
`ask`. Do not treat unavailable worker features as accepted state.

## Route Decision Format

```text
Route Decision

Level:
Reason:
Required docs:
Required gates:
Execution role:
Execution mode:
Validation:
Escalation triggers:
```

Keep route decisions lightweight. The useful part is the reason and the
confirmation boundary, not a heavy ledger.

Escalate or pause when implementation discovers broader scope, unclear source
of truth, production risk, missing approval, conflicting instructions, or a
need for optional competition before implementation.
