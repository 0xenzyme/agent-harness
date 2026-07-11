# Task Routing Reference

Task routing chooses the lightest harness flow that is still safe.

`orient`, `intake`, `init`, and `execute` are public skill entries. `shape`,
`goal`, `competition`, and `ask` are internal routes governed by
[Route To Public Entry Mapping](route-entry-mapping.md); never present them as
unshipped skills.

Use [First-Principles Scope](first-principles-scope.md) when objective, source
of truth, scope, non-goals, verification, or pause triggers are ambiguous.

## Decision Inputs

- Priority: `P0`, `P1`, `P2`, `P3`; these labels mean priority only and are
  not task names, stages, or milestone identifiers.
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

## Terminology And Intent Normalization

`harness-rule:terminology-boundary`: keep priority, milestone, goal, task, and
run boundaries explicit before choosing a Harness route.

Formal user-facing hierarchy:

```text
Roadmap -> Milestone -> Goal -> Task -> Run
```

- `Milestone`: a phase-level roadmap outcome such as `M5`; completion is
  derived from evidence across multiple Goals.
- `Goal`: the main Harness work unit. Users confirm direction, scope, and
  acceptance points.
- `Task`: concrete breakdown inside a Goal, such as checklist or execution
  steps.
- `Run`: one execution attempt and evidence record, not a thread/session
  identity.
- `Spec`: a specification, constraint, and acceptance document.

Normalize natural-language user intent before routing:

- "complete this task", "develop this task", or "用 harness 做这个任务" -> `Goal`
- "what steps/subtasks/checklist are inside this task?" -> `Task`
- "complete M2", "完成 M2", or "推进 M5" -> `Milestone`
- "run it again", "this execution", or "上次失败那次" -> `Run`
- `P0` / `P1` / `P2` / `P3` -> `Priority`
- `Spec`, "document", "文档", "规格", or "验收标准" -> `Spec`

`Stage` was renamed to `Milestone`. New routing docs and generated artifacts
should use `Milestone`; existing `Stage Completion Map` artifacts are legacy
compatibility input.

## Context Focus Routing

`harness-rule:context-focus-routing`: normalize intent before choosing context
focus. First map the request to `Milestone`, `Goal`, `Task`, `Run`,
`Priority`, or `Spec`; then select the focus preset that reads the smallest
useful set of artifacts for the workflow.

Public language is `context focus` and `focus preset`. `EnvContext` is only an
internal design reference; this routing model does not add a public parameter,
config/schema field, storage migration, activation behavior, or external
dependency.

Context layers:

- `entry/channel`: workflow entry, request source, thread role, conversation
  route, and worker/controller lane.
- `modality`: text, screenshot, file, URL, terminal output, or other supplied
  input shape.
- `dialog`: current conversation-confirmed decisions, stale artifacts,
  superseded plans, `Need user`, and unresolved questions.
- `project/world`: adapter/config, task/status/spec/goal/run state, git
  posture, delivery posture, and external risk.
- `capability`: available skills, tools, worker surfaces, deterministic
  commands, and validation limits.
- `self/control`: execution role, accepted-state owner, allowed writes,
  delivery authorization, completion conditions, and pause conditions.

Default focus presets:

- `orient`: current state, route recommendation, blockers, stale artifacts,
  and next safe action. Skip implementation detail unless it explains the
  route.
- `intake`: raw idea, duplicates or related work, proposed priority, likely
  route, and whether a spec or accepted scope is needed. Skip execution
  artifacts unless they prove duplication or dependency.
- `shape`: decisions, alternatives, source of truth, non-goals, acceptance,
  risks, verification, and pause triggers. Delay detailed implementation-file
  reading until the shape is accepted.
- `goal`: accepted spec or explicit accepted scope, source task acceptance,
  role, context lock, delivery policy, verification, completion conditions,
  and state-sync obligations.
- `execute`: goal/spec/run packet, execution DAG, allowed and forbidden scope,
  implementation-relevant files, verification commands, delivery target, and
  state-sync requirements.

Token, noise, and lost-in-the-middle controls:

- Prefer current conversation-confirmed state, repo instructions,
  adapter/config, current status/task records, and active spec/goal/run before
  broad docs or historical logs.
- Read historical run logs only when they are directly relevant; otherwise cite
  their path and evidence summary.
- Load modality-specific artifacts only when the request supplies that
  modality or route safety depends on it.
- Keep source of truth, non-goals, verification, completion conditions, and
  pause conditions near the route decision or handoff prompt.

## Cybernetic Stability Routing

`harness-rule:cybernetic-stability`: route toward an explicit target using
fresh observations, measurement snapshots, remaining-gap comparison,
feedback-quality checks, and stability/saturation pause triggers.

- `harness-rule:intent-setpoint-selection`: intent recognition selects the
  target before route selection. A request for a `Milestone`, `Goal`, `Task`,
  `Run`, `Priority`, `Spec`, question, research note, or ask boundary must not
  be collapsed into the nearest locally executable artifact.
- `harness-rule:sensor-freshness`: prefer newer explicit user instructions and
  fresh local observations over stale task/status/spec/goal/run artifacts.
  Report stale artifact conflicts as route evidence.
- `harness-rule:measurement-snapshot`: before execution and closeout, record or
  summarize target, observed state, evidence, conflicts or stale artifacts,
  delivery state, user-decision state, and remaining gap.
- `harness-rule:remaining-gap`: every non-trivial execution loop should state
  what gap was closed and what remains. If no gap shrank, route to verification,
  re-orientation, shaping, or pause.
- `harness-rule:feedback-quality`: do not treat low-quality, stale, delayed, or
  advisory feedback as completion evidence. Distinguish fresh tests, CI,
  command output, review, user confirmation, agent narrative, and old status.
- `harness-rule:stability-saturation`: pause or re-route when the loop
  oscillates, repeats ineffective actions, conflicts with fresh state, hits
  context limits, lacks authority, needs credentials / paid APIs / production /
  destructive approval, exceeds risk or cost, or waits on external feedback.

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

`harness-rule:level-0-fast-path`: Level 0 is a narrow direct-execution
exception for small local, reversible, low-risk fixes. It may skip a durable
spec, goal, prepared run, and worker delegation only when no accepted Harness
artifact, adapter-required gate, or user-requested control role requires state
sync.

Use Level 0 only when all of these are true:

- The requested change is obvious, local to the current checkout, and scoped to
  a typo, formatting repair, broken link, small docs clarification, mechanical
  local cleanup, or clear local bug fix.
- The diff is small, easy to review, and reversible without schema, storage,
  migration, source-of-truth, public protocol, adapter, or default routing
  impact.
- The change does not alter product or project semantics, security/privacy
  behavior, public APIs, reusable abstractions, cross-module behavior, or
  external systems.
- Verification is concrete and quick, such as a targeted test, markdown check,
  syntax check, `git diff --check`, or direct inspection of the changed file.
- The current thread is `implementer`, or the user / accepted artifact
  explicitly declares `mixed`.

Level 0 is not allowed when any of these are true:

- The user asks to use Harness, shape policy, act as Controller, gate, reviewer,
  judge, acceptance lane, or complete a larger Goal or Milestone.
- An accepted spec, goal, run, DAG node, checklist, adapter-required gate, or
  state-sync obligation already exists for the work.
- The change touches product/project semantics, source-of-truth policy,
  schemas, public protocol contracts, default routing behavior, adapter
  contracts, credential handling, paid APIs, production data, destructive
  operations, daemons, watchers, network services, or external systems.
- The work needs product direction, user authorization, credentials,
  paid/production access, destructive-operation approval, or broad research.

In Level 0, direct execution may skip ceremony but not discipline. The closeout
still needs a short route reason, scoped diff summary, concrete verification,
Delivery State, `Need user`, and `Remaining`. If verification is missing, the
Delivery State cannot be `validated-local`.

The invariant is explicit: direct execution requires `implementer` or explicitly accepted `mixed`.
Level 0 may skip spec/goal/run/worker ceremony only when there is no existing Harness Goal/Run, accepted artifact, or adapter-required gate to satisfy.

`gate-only` threads cannot use Level 0 to edit implementation files. If the
active lane is Controller / gate / review / acceptance, route through normal
Harness execution, worker evidence, or `ask` for a corrected role instead of
downgrading the work to Level 0.

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

`harness-rule:child-controller-boundary`: when a new visible thread is used, the
handoff must declare whether the thread is a `child-controller` or an
`execution-worker`. A child controller owns accepted state only inside its
authorized scope and reports snapshots, decision requests, and final result
packets to the parent controller. An execution worker returns candidate
evidence only. Do not let a parent controller and child controller both accept
the same scope unless a superseding decision records which authority changed.

When the active conversation is `gate-only`, route clear implementation work to
a worker subagent by default. Do not ask the user to choose between launching a
worker and changing the controller to `mixed` unless subagent execution is
unavailable, unsafe, or under-specified.

Parallel worker execution must follow the run packet's execution DAG and
`harness-rule:parallel-worker-isolation`. Ready nodes default to sequential
launch. Launch them together only with separate locked worktrees/cwds for
writers, or recorded proof that all concurrent work is read-only or has
non-overlapping file ownership. Dependent nodes wait until prerequisites are
recorded with `run node record`.

`harness-rule:controller-cancellation-boundary`: route cancellation,
supersession, drain, and pause-after-current as cooperative control-plane
signals. They may stop new dependent launches and quarantine late worker output,
but they do not prove that a subagent runtime stopped. If the controller
switches to same-scope manual foreground work, record degraded provenance and
revalidate or reject any late worker output before accepted state moves.

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
