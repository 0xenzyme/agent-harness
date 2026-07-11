# Project Contract

This contract defines how Agent Harness finds project control files.

The project-neutral capability matrix is maintained in
[`docs/HARNESSES.md`](HARNESSES.md). It summarizes the runtime/control
surfaces, defaults, boundaries, applicability, verification expectations, and
stable `harness-rule:*` anchors.

The control-theory inspired stability model is maintained in
[`docs/cybernetic-stability.md`](cybernetic-stability.md). It describes how
Harness uses intent/setpoint selection, sensor freshness, measurement
snapshots, remaining-gap comparison, feedback quality, and stability /
saturation pause triggers.

`harness-rule:cybernetic-stability`: Harness should control toward an explicit
target using fresh observations, measurement snapshots, remaining-gap
comparison, feedback-quality checks, and stability/saturation pause triggers.

## Cybernetic Stability

Harness uses the cybernetic stability model as internal product language, not
as required user-facing jargon.

- `harness-rule:intent-setpoint-selection`: recognize user intent before
  routing and treat the normalized target as the setpoint. A request may target
  a `Milestone`, `Goal`, goal-internal `Task`, `Run`, `Priority`, `Spec`,
  question, research note, or ask boundary.
- `harness-rule:sensor-freshness`: prefer newer explicit user instructions and
  fresh local observations such as `git status`, `git diff`, command output,
  and freshly run tests over stale artifacts. Report conflicts instead of
  silently choosing older state.
- `harness-rule:measurement-snapshot`: before execution and closeout, summarize
  target, observed state, evidence, conflicts or stale artifacts, delivery
  state, user-decision state, and remaining gap.
- `harness-rule:remaining-gap`: every non-trivial loop should state what gap
  was closed and what remains. If no gap shrank, re-orient or pause.
- `harness-rule:feedback-quality`: distinguish strong, weak, stale, delayed,
  and advisory feedback. Low-quality feedback is not completion evidence.
- `harness-rule:stability-saturation`: pause or re-route when routes oscillate,
  verification repeats ineffectively, stale state conflicts with fresh state,
  context is saturated, authority is missing, credentials / paid APIs /
  production / destructive approval are needed, or external feedback is
  delayed.

## Degraded Execution Provenance

`harness-rule:degraded-execution-provenance`: when a run packet, controller, or
worker prompt expects a bounded worker surface but execution falls back to
`manual-foreground`, skips `codex-cli-subagent`, cannot launch the planned
surface, or otherwise degrades from the intended delegation path, the
degradation must be explicit in run, gate, or closeout evidence.

The evidence should name:

- actual execution method;
- unavailable or skipped worker surface;
- fallback reason;
- whether output is candidate evidence;
- verification used to compensate for the degraded path.

Degraded provenance does not grant broader scope, accepted-state authority, or
delivery authority. In `gate-only` work, fallback output remains candidate
evidence until the controller validates implementer output, verification, and
gate evidence.

Agent Harness supports two project contracts:

- `fixed` (`contract: "fixed"`): fixed-path project contract.
- `adapter` (`contract: "adapter"`): adapter-driven project contract with configurable
  artifact paths.

## User-Facing Terminology

`harness-rule:terminology-boundary`: keep priority, milestone, goal, task, and
run boundaries explicit in user-facing docs, generated artifacts, templates,
and CLI output.

The formal user-facing hierarchy is:

```text
Roadmap -> Milestone -> Goal -> Task -> Run
```

- `Roadmap`: longer-range product or engineering direction.
- `Milestone`: a phase-level roadmap outcome such as `M5`. It is usually too
  large for Harness to promise in one execution. Milestone completion is
  derived from evidence across multiple Goals.
- `Goal`: the main Harness work unit. Users confirm the Goal direction,
  scope, and acceptance points. Most Goals should finish in one Run, but a Goal
  may take multiple Runs.
- `Task`: a concrete breakdown item inside a Goal, such as checklist items,
  execution steps, or sub-work. Users should be able to inspect Tasks to see
  what a Goal contains.
- `Run`: one execution attempt and evidence record. A Run is not a Codex
  thread, session, worker, or worktree identity.
- `Priority`: `P0`, `P1`, `P2`, and `P3` mean priority only. They are not task
  names, stages, or milestone identifiers.
- `Spec`: a user-visible specification, constraint, and acceptance document.

Intent normalization:

- "complete this task", "develop this task", or "用 harness 做这个任务" maps to
  `Goal` by default.
- "what steps/subtasks/checklist are inside this task?" maps to `Task`.
- "complete M2", "完成 M2", or "推进 M5" maps to `Milestone`.
- "run it again", "this execution", or "上次失败那次" maps to `Run`.
- `P0` / `P1` / `P2` / `P3` maps to `Priority`.
- `Spec`, "document", "文档", "规格", or "验收标准" maps to `Spec`.

`Stage` was renamed to `Milestone`. New docs, templates, generated artifacts,
and CLI output should use `Milestone`. Existing legacy artifacts with
`Stage Completion Map` remain readable as compatibility input only.

## Context Focus Routing

`harness-rule:context-focus-routing`: Harness selects context in two steps.
First normalize user intent to `Milestone`, `Goal`, `Task`, `Run`,
`Priority`, or `Spec`; then choose the smallest useful context focus for the
workflow. A focus preset narrows what the agent reads. It must not reinterpret
priorities as work units, treat a parent milestone as one leaf goal, or let old
artifacts override newer conversation-confirmed decisions.

Public guidance should use `context focus` and `focus preset`. `EnvContext`
remains an internal design reference only; do not turn it into a public user
concept, parameter, config/schema field, storage migration, activation change,
or external dependency.

Harness context layers:

- `entry/channel`: workflow entry, request source, thread role, conversation
  route, and whether the lane is controller, child controller, or worker.
- `modality`: text, screenshot, file, URL, terminal output, or other input
  shape that changes what evidence can be trusted.
- `dialog`: current conversation-confirmed decisions, stale artifacts,
  superseded plans, `Need user`, open questions, and confirmation boundaries.
- `project/world`: adapter, config, task/status/spec/goal/run state, git
  posture, delivery posture, and external risk.
- `capability`: available workflow skills, tools, worker surfaces,
  deterministic commands, and validation limits.
- `self/control`: current lane, execution role, accepted-state owner, allowed
  writes, delivery authorization, completion conditions, and pause conditions.

Default focus presets:

- `orient`: current state, route recommendation, blockers, stale artifacts,
  delivery posture, and next safe action. Avoid implementation details unless
  they explain the route.
- `intake`: raw idea, duplicates or related work, proposed priority, likely
  route, and whether a spec or accepted scope is needed. Avoid execution
  artifacts unless they prove duplication or dependency.
- `shape`: decisions, alternatives, source of truth, non-goals, acceptance,
  risks, verification, and pause triggers. Avoid detailed implementation files
  until the shape is accepted.
- `goal`: accepted spec or explicit accepted scope, source task acceptance,
  role, context lock, delivery policy, verification, completion conditions,
  and state-sync obligations.
- `execute`: goal/spec/run packet, execution DAG, allowed and forbidden scope,
  implementation-relevant files, verification commands, delivery target, and
  state-sync requirements.

Token, noise, and lost-in-the-middle controls:

- Read conversation-confirmed decisions, repo instructions, adapter/config,
  current task/status, and the active spec/goal/run before broad docs.
- Prefer the current run packet and directly linked artifacts over historical
  run logs. Summarize old logs by path and evidence unless their details are
  directly relevant.
- Load modality-specific evidence only when the user supplied that modality or
  when it is required to resolve the route.
- Keep stale or conflicting artifacts visible as route evidence, but do not
  expand into unrelated history after the current source of truth is clear.
- Put source of truth, non-goals, verification, completion conditions, and
  pause conditions close to the route decision or worker prompt so they are
  not buried behind broad background material.

## Fixed Contract

Fixed projects use these paths:

### `harness/tasks.md`

The human-readable project backlog and task source of truth.

Rules:

- Keep it under `harness/` in the fixed contract.
- The active coding agent should read it before proposing or executing a new
  goal.
- The active coding agent should update it after meaningful work when state
  sync is required.

### `.harness/config.json`

Machine-readable project settings.

Required fields:

- `contract`
- `projectName`
- `paths`
- `worktree`

The config is validated against
`plugins/agent-harness/schemas/config.schema.json` by:

```bash
agent-harness config validate --cwd <project>
```

### `harness/status.md`

Human-readable project status:

- active focus
- current branch/worktree posture
- last verification
- known blockers

`harness-rule:bounded-status-snapshot`: the configured status file is a
bounded current-state snapshot, not an append-only history log. State sync
should replace current status sections instead of appending historical focus
entries. Detailed history belongs in task entries, Goal files, run logs, and
gate records.

### `harness/goals/`

Generated goal handoff files.

### `.harness/runs/`

Loop run logs and automation outputs.

Prepared runs use:

```text
.harness/runs/
  YYYYMMDD-HHMMSS-<slug>/
    run.md
    prompt.md
    subagents.md
    status.json
    logs/
```

## Adapter Contract

Adapter projects use `.harness/config.json` as the machine entry point
when present, but artifact paths come from config and the project adapter.
Projects that already have `harness/README.md` plus a known task index
such as `todolist.md` can be discovered as adapter projects before config is
imported.

Minimum config:

```json
{
  "contract": "adapter",
  "projectName": "",
  "adapter": {
    "docs": "harness/README.md",
    "machineReadable": ".harness/config.json",
    "preflight": [],
    "stateSync": []
  },
  "paths": {
    "taskIndex": "harness/tasks.md",
    "status": "harness/status.md",
    "specs": "harness/specs",
    "goals": "harness/goals",
    "milestones": "harness/milestones",
    "runs": ".harness/runs",
    "gateRecords": ".harness/runs",
    "deferredRegister": "harness/milestones",
    "mentalModels": "harness/mental-models",
    "mentalModelIndex": "harness/mental-models/README.md"
  }
}
```

Existing adapter projects can persist discovered paths without creating a
second task index:

```bash
agent-harness config import --cwd <project> --task-index todolist.md --dry-run
agent-harness config import --cwd <project> --task-index todolist.md
```

Import supports adapter path overrides for existing projects that already have
their own artifact layout:

```bash
agent-harness config import --cwd <project> --task-index todolist.md \
  --status docs/status.md \
  --specs docs/specs \
  --goals docs/goals \
  --milestones docs/milestones \
  --runs .harness/runs \
  --gate-records .harness/runs \
  --deferred-register docs/milestones \
  --mental-model docs/mental-model.md \
  --mental-model-index docs/mental-model.md \
  --mental-models docs/mental-models \
  --dry-run --json
```

`--dry-run --json` reports the proposed config before writing. Import must not
create a second task index when a configured or discovered task index such as
`todolist.md` already exists.

The real import also creates required support artifacts that do not split
project state, including the configured status file and runs/specs/goals/
milestones directories when missing.

Use `agent-harness config validate --cwd <project>` after initialization or
import. Validation checks the active `.harness/config.json` or legacy
`.agent-harness/config.json` against the plugin-owned schema and reports
invalid contract values, unknown keys, required adapter/fixed paths, and unsafe
absolute or parent-relative paths.

The adapter should declare:

- artifact paths and source-of-truth files
- DB, production, Admin CLI, credential, paid-call, and destructive-operation
  boundaries
- commit, review, integration, release, and ship policies
- validation commands
- enabled gates and project-specific gate details
- UI harness or mental model locations when relevant

Adapters may also declare completion gates in machine config:

```json
{
  "gates": {
    "enabled": ["spec", "execution", "integration", "content-quality"],
    "requiredForCompletion": ["content-quality"],
    "blocking": ["source-coverage"]
  }
}
```

`enabled` and `optional` describe available project gates.
`requiredForCompletion` and `blocking` name gates that must have matching
`Required Gate Evidence` before `run record --phase completed` can accept the
run. The plugin core checks the evidence shape and status; the adapter docs and
gate artifacts define the domain-specific meaning of each gate.

## Adapter Language Policy

Language preference is project adapter policy stored at the top level of
`.harness/config.json`:

```json
{
  "language": {
    "default": "auto"
  }
}
```

Supported policy values are `auto`, `en`, and `zh-CN`. Do not add a duplicate
language field inside the `adapter` object. Human-readable adapter docs may
explain the project choice, while `.harness/config.json` remains the
machine-readable source of truth.

The deterministic CLI resolves language in this order:

```text
--lang -> AGENT_HARNESS_LANG -> language.default -> LC_ALL -> LC_MESSAGES -> LANG -> en
```

`auto` skips to the next available locale signal. A CLI process cannot infer
the language of a Codex conversation. Agent-led responses follow the user's
language under the active skill instructions, while code, commands, paths,
class and function names, package and skill names, APIs, model names,
abbreviations, and Git commit messages preserve their original spelling.

Current implementation boundary: resolved language is used by the supported
human-facing CLI message catalog. `init` copies English base templates, and the
Goal/Run artifact renderers currently emit English document bodies. Neither
`language.default` nor `--lang` translates generated artifacts yet. Docs and
adapters must state this limitation until localized artifact renderers and
matching validation fixtures are shipped.

## Design Principles

Agent Harness contracts, adapters, templates, and skills should preserve these
principles:

- optional proposal competition: use competition only as a Shape protocol for
  ambiguous or high-risk route selection; it proposes routes and tradeoffs but
  does not execute the chosen route.
- inspectable evidence trail: accepted task, status, goal, run, and gate state
  must point to concrete evidence such as specs, command summaries, run logs,
  gate records, or human review notes.
- packaging discipline: public docs, install docs, marketplace metadata, skill
  files, templates, validation commands, and version metadata must stay aligned
  with the behavior the plugin actually exposes.
- project-neutral docs (`harness-rule:project-neutral-core`): plugin core docs,
  examples, and templates must avoid
  private repository names, local absolute paths, customer names, provider-only
  rules, ports, credentials, and downstream production procedures.
- state sync evidence (`harness-rule:state-sync-evidence`): task completion
  includes state-sync evidence or state-sync notes from the executing lane.
  Accepted task, status, goal, run, and gate state must cite concrete
  state-sync evidence, and accepted-state writes remain limited to the
  authorized accepted-state owner.
- lightweight route explanation: at workflow transitions, the active coding
  agent should briefly state why it is choosing orientation, intake, shape,
  goal, execute, competition, local, worktree, or ask.
- Level 0 Fast Path (`harness-rule:level-0-fast-path`): tiny direct execution
  is allowed only for small local, reversible, low-risk fixes with concrete
  verification and no Harness artifact, adapter gate, Controller role, or
  product/source-of-truth impact that requires normal flow.
- role separation: control / gate work and implementation work should have an
  explicit execution role. A thread asked to act as main control, gate,
  reviewer, judge, or acceptance lane defaults to `gate-only` unless the user
  explicitly authorizes direct implementation in that same thread.
- master acceptance: candidate output, worker self-tests, route proposals,
  page existence, build success, and smoke checks are evidence, not accepted
  completion. Required checklist and adapter gate evidence must be satisfied
  before accepted state moves to done.

These principles are protocol constraints. Project adapters may add local
policy, but plugin core must not absorb downstream-specific facts.

## Task Kinds And States

`kind` describes the work pattern. `state` describes where the task is in that
pattern.

Default task kinds:

- `development`
- `observe`
- `research`
- `ops`
- `docs`

Default development states:

- `todo`
- `spec-draft`
- `spec-ready`
- `goal-ready`
- `doing`
- `review`
- `blocked`
- `done`
- `cancelled`

Observe tasks use a separate harness-defined lifecycle:

- `watching`
- `signal`
- `triage`
- `action-needed`
- `paused`
- `closed`

Harness core defines the `observe` protocol. Project adapters declare observe
sources, signal records, triage gates, and whether follow-up tasks may be
created automatically.

## Adapter Artifacts

Adapter artifacts record facts; they are not plugin rules.

Common artifacts:

- task index
- specs
- goals
- milestones
- run logs
- gate results
- deferred / follow-up register
- project status
- mental models / invariants

## Conversation Reconciliation Rules

Artifacts are durable state, but the active control thread can contain a newer
explicit user or controller decision that has not been recorded yet. Treat that
conversation-confirmed state as the current route context for orientation and
gate decisions, while reporting the artifact mismatch as stale state that must
be synced before execution.

If a revised milestone, spec, goal, or route supersedes an older artifact,
orientation must not recommend the older artifact as the active next path just
because it remains on disk. Route to state sync, shaping, intake, goal
creation, or `ask`, and cite both the newer decision and the stale artifact.

## Activation Rules

Adapter files do not automatically inject instructions into Codex or any other
coding agent. The primary user-facing activation path is an explicit request to
use `harness:init`, `harness:orient`, `harness:intake`, or `harness:execute`
inside a target project. Project-scope `AGENTS.md` instructions can make that
route persistent after review. CLI commands remain deterministic tooling for
agents, operators, and maintainers; they are not the main first-use workflow.

The plugin manifest intentionally does not declare `hooks`. Conditional
`SessionStart` bootstrap is deferred until plugin validation accepts hook
manifests and runtime tests prove that non-harness projects receive no
additional context.

Installed plugin content is limited to the plugin package under
`plugins/agent-harness/`. A repository's own `harness/` and `.harness/`
directories are project adapter state. They may exist in this source repository
for Agent Harness development, but they are not copied into downstream projects
as plugin content.

## Execution Role Rules

Execution role is independent from work mode:

- `harness-rule:gate-only-controller`: a thread asked to act as main control,
  gate, reviewer, judge, or acceptance lane defaults to `gate-only`. It may
  review worker output and evidence, but it must not directly edit
  implementation files or promote candidate evidence without controller review.

- `gate-only`: current thread owns control / acceptance. It may inspect
  candidate implementation output, run verification, request corrections, and
  accept or block state. It must not directly edit implementation files.
- `implementer`: current thread may edit files within the accepted scope and
  provide verification evidence and state-sync notes for review.
- `mixed`: current thread may both edit and gate only when the user explicitly
  accepts that tradeoff, or when the confirmed goal/run declares `mixed`. Do
  not infer `mixed` from low-risk local work alone.

If the user asks the thread to be "main control", "control lane", "gate",
"judge", "reviewer", or "acceptance", default to `gate-only`. If the user
asks the same thread to "implement", "modify", "fix", or "execute until
complete", use `implementer` unless the user explicitly accepts `mixed` or the
confirmed goal/run declares `mixed`. Record the role choice and confirmation
boundary before editing.

`goal validate` must reject executable goals that do not name one of
`gate-only`, `implementer`, or `mixed`. `run prepare` must carry the execution
role into the prepared run packet. `run record --phase completed` must not
accept completion without verification evidence; for `gate-only`, it must also
cite gate evidence from implementer output and acceptance review.
Every executable task's Done contract includes state-sync evidence or
state-sync notes, even when a worker is not authorized to write accepted state.
The accepted-state owner verifies those notes before marking task, goal, run,
or gate state complete.

## Level 0 Fast Path Direct Execution

`harness-rule:level-0-fast-path`: Level 0 is a direct-execution exception, not
a replacement for Harness routing. It exists for small local fixes where full
spec / goal / run ceremony and worker delegation would add more cost than
safety.

Level 0 may be used only when every condition is true:

- The fix is small, local, obvious, reversible, and low risk.
- Scope is limited to typo repair, formatting, broken-link repair, small docs
  clarification, mechanical local cleanup, or a clear local bug fix.
- The work does not change product or project semantics, source-of-truth
  policy, public protocol contracts, default routing behavior, schemas,
  storage, adapter contracts, public APIs, security/privacy behavior, reusable
  abstractions, external systems, or cross-module behavior.
- No credentials, paid APIs, production data, destructive operation, daemon,
  watcher, network service, deploy, publish, release, review, integration, or
  external authorization is involved.
- No existing accepted Harness spec, Goal, Run, DAG node, checklist,
  adapter-required gate, or state-sync obligation covers the work.
- The current thread's execution role is `implementer`, or the user /
  accepted artifact explicitly declares `mixed`.

Level 0 may skip a durable spec, goal file, prepared run packet, and worker
delegation only when no accepted Harness artifact or adapter gate requires
state sync. If the user asks to use Harness, shape policy, act as Controller /
gate / reviewer / judge / acceptance lane, or complete a larger Goal or
Milestone, use normal Harness flow. If an accepted Goal or Run already exists,
do not bypass its checklist, DAG, gate, or state-sync obligations.

`gate-only` Controller threads cannot use Level 0 to edit implementation
files. A control lane reviews candidate output and verification evidence; it
does not downgrade its own role because the edit looks small. Direct execution
requires `implementer` or explicitly accepted `mixed`.

The invariant is explicit: direct execution requires `implementer` or explicitly accepted `mixed`.

Level 0 closeout is lightweight but mandatory:

- short route reason
- scoped diff summary
- concrete verification
- Delivery State
- `Need user`
- `Remaining`

If verification is not run or cannot prove the local fix, report
`implemented-local` or the appropriate lower state instead of
`validated-local`.

Context focus changes, broader intent routing, control-theory research,
storage/schema migration, downstream-specific policy, and source-of-truth
contract changes are outside Level 0. Keep them as shaped specs, deferred
references, or normal Harness Goals.

## Agent-Neutral Delegation Rules

Agent Harness may coordinate coding-agent workers only through explicit
capabilities and result packets. A worker surface must declare or demonstrate
whether it can provide isolated execution, changed-file reporting,
verification summaries, stop-condition reporting, and no-daemon / no-push
compliance.

`harness-rule:worker-surface-default`: prepared run packets default worker
nodes to `codex-cli-subagent` when that surface is available. A new Codex App
thread is an explicit long-lived handoff lane, and fork is not a default worker
surface.

Preferred worker surface is a Codex CLI subagent. A new Codex App thread is an
explicit, visible, long-lived handoff lane, not the default execution worker.
Fork is not a default execution surface. A fork may be used only when the
controller explicitly approves context inheritance and restates the worker's
thread role, controller thread, allowed scope, return channel, and forbidden
scope.

`harness-rule:child-controller-boundary`: any visible long-lived thread must be
launched as either a child controller or an execution worker. A child controller
owns accepted task/status/goal/run/gate state only inside the authorized scope
named by the launch packet. Its parent controller receives status snapshots,
decision requests, and final result packets for portfolio or milestone sync,
not duplicate same-scope acceptance. An execution worker remains candidate
evidence only.

`harness-rule:controller-cancellation-boundary`: controller cancellation,
supersession, drain, or pause-after-current is a cooperative control-plane
signal, not a runtime kill guarantee. A controller may stop new dependent
launches, quarantine late worker output, reject stale candidate evidence, or
switch to manual foreground fallback with degraded provenance, but it must not
present the signal itself as proof that a Codex subagent stopped. Same-scope
accepted state must wait until active worker state is resolved, superseded with
stale-output handling, or revalidated by the controller.

If the current thread is `gate-only`, the harness should launch worker
subagents by default when scope, verification, context lock, delivery target,
and safety boundaries are clear. It should not routinely ask the user to choose
between launching a worker and changing the control thread to `mixed`.

When those capabilities are unavailable, route to foreground manual execution
or `ask`; do not imply that parallel worker execution, cross-agent handoff, or
automatic acceptance is supported. Support for another coding agent requires
fixtures and validation for its result packet before it can become accepted
state.

Parallel execution must be represented as an execution DAG and obey
`harness-rule:parallel-worker-isolation`. Ready nodes default to sequential
launch. Multiple writers may run together only with separate locked
worktrees/cwds; read-only or non-overlapping workers require recorded ownership
evidence. `run node record --phase running` must reject a second concurrent
worker without `--isolation-evidence`. Dependent nodes wait for concrete result
packets from prerequisites.

## Intake Rules

- `intake idea` turns a new idea or requirement into a candidate harness entry.
- Preview is read-only by default and must not start implementation.
- `--record` appends to the configured task index only for supported markdown
  task lists.
- Table-based or unknown task-index formats must refuse automatic recording
  rather than risk corrupting project state.
- `maintain tasks --record` may read table-based task indexes, but it must
  refuse automatic task-index writes until table row updates can be matched by
  a unique task title, a recognized `Status` column, and a bounded status
  transition. Status snapshots may still be written to the configured status
  file.
- Intake must not create specs, goals, runs, branches, review requests,
  deployments, or background automation.
- Idea Inbox Threads are capture lanes. They preserve raw notes, questions,
  and rough requirements while a control thread continues the active goal.
- Promotion from Idea Inbox to accepted state requires intake / triage. The
  promoted result may become a task candidate, spec draft, goal-ready task, or
  clarification question, but raw capture notes are not executable scope.

## Optional Competition Rules

- Competition is a Shape protocol for ambiguous, broad, high-risk, or
  repeatedly failing work.
- Competition may output candidate routes, tradeoffs, coverage union, risks,
  verification plans, and a recommendation.
- Competition must not directly edit files, prepare runs, mark tasks done,
  start daemons, create branches/worktrees, push, open review requests, deploy,
  or accept state.
- The control thread must validate the recommendation before routing to goal
  creation or execution.
- This package currently documents the protocol; it does not install a
  separate `harness:compete` skill.

## Evaluation Fixtures And Examples

- `evals/` defines fixture blueprints for new-project, legacy-project,
  non-harness-project, and messy-realistic scenarios.
- `docs/examples/downstream-project-shapes.md` describes representative
  project shapes and route choices.
- Evaluation should score agent behavior: contract detection, artifact
  reading, route choice, boundary preservation, state discipline, and evidence
  quality.
- Examples and fixtures must stay project-neutral. They should describe
  harness artifact shapes and workflows without copying private downstream
  facts into plugin core.

## Default Fixed Task Format

```md
# Project Tasks

## Now

- [ ] P1 short task title
  - Source:
  - Acceptance:
  - Notes:

## Next

- [ ] P2 short task title

## Later

- [ ] P3 short task title

## Done

- [x] Completed task title
```

In task indexes, the `P*` prefix is priority only. It must not be used as the
task name, milestone number, or roadmap phase identifier.

## Run Rules

- `run.md` records source goal, work mode, execution role, manual checkpoints,
  and verification.
- `prompt.md` is the ready-to-use prompt for `/goal` or a new coding-agent
  session.
- `subagents.md` gives bounded split guidance for `small`, `medium`, `large`,
  and `ask` tasks.
- `dag.json` stores the machine-readable execution DAG, worker surfaces,
  dependency edges, parallel layers, and completion enforcement mode.
- `dag.md` gives the human-readable controller plan for launching ready nodes.
- `agents/<node>/prompt.md` and `agents/<node>/status.json` provide per-node
  launch prompts and node state. `agents/<node>/result.md` is written when the
  node is recorded.
- `status.json` stores machine-readable run state.
- `logs/` is reserved for command output summaries and automation logs.
- `goal validate` is the gate before `run prepare`: executable goals must
  reference a repo-local confirmed spec unless they explicitly declare `Spec
  Policy: allow-no-spec`, include required execution sections, name a valid
  work mode and execution role, and provide verification or manual evidence
  guidance.
- `run prepare` must not start daemons, spawn coding-agent sessions, push,
  deploy, or open review requests. It may prepare per-node prompts for
  controller-launched workers.
- `run node record` records a DAG node start or result. It rejects starts and
  completions whose dependencies are incomplete, rejects a second running node
  without isolation evidence, and requires verification for completed nodes.
- `run record` updates only the target run directory's `status.json` and
  `logs/`; it does not update source files, task indexes, review requests,
  deployments, or releases. Completed records require verification evidence;
  completed `gate-only` records also require gate evidence. Runs with enforced
  DAGs cannot be completed until every DAG node is completed, and active
  `running` worker nodes must be resolved before completed run acceptance.

## Conversation Route And Execution Context Lock

Work mode only says where files may be changed. Conversation route says which
conversation owns the execution lane:

- `current-thread`: the current conversation owns execution in the locked cwd.
- `slot-thread`: execution must move to a dedicated slot conversation before
  editing.
- `remote-control-worktree`: the current conversation may control a different
  locked worktree only when explicitly approved and recorded.

Worktree goals must include `Conversation Route` and `Execution Context Lock`
before `run prepare`. The lock records conversation lane, controller thread,
execution cwd, execution branch, execution slot, and whether remote-control
worktree execution is allowed.

If the current conversation lane does not match the locked execution cwd or
branch, the agent must pause, switch to the slot thread, or explicitly treat the
current thread as remote-controlling the locked worktree. Patches must land only
in the locked execution cwd; control-lane cwd defaults are not proof of the
correct execution context.

`goal validate` must reject `worktree` goals that omit this route/lock or set
`remote-control-worktree` without `Remote-control worktree: yes`.

## Spec-Less Goal Policy

Adapter goal creation is strict by default: omitting `--spec` fails unless the
caller explicitly passes `--allow-no-spec`. The generated goal records:

```md
Spec: TBD
Spec Policy: allow-no-spec
Status: Ready for execution from accepted scope without a separate spec.
```

Spec-less goals do not weaken execution safety. `goal validate` must still
require `Scope`, `Non-Goals`, `Verification`, `Completion Conditions`, `Pause
Conditions`, `Execution Role`, and `Delivery State`. The goal's accepted scope
acts as the source of truth for execution, and pause conditions must cover
accepted-scope conflicts, newer instructions, credentials, paid APIs,
production access, destructive operations, and product direction.

## Delivery State Gate

Implementation state and delivery state are distinct. Harness records must not
describe local verified work as integrated, shipped, or complete on an
integration line unless the delivery evidence proves it.

`harness-rule:local-delivery-ceiling`: `implemented-local` and
`validated-local` are local evidence states only. They do not prove commit,
push, review, integration, release, or ship state without matching delivery
evidence.

Delivery state vocabulary:

- `implemented-local`: implementation exists in the local working tree.
- `validated-local`: implementation has verification evidence locally but is
  not necessarily committed, pushed, reviewed, integrated, released, or shipped.
- `committed`: a local commit records the work.
- `pushed`: the commit is pushed to its upstream branch.
- `review-open`: a provider-neutral review request is open, such as a GitHub
  PR, GitLab MR, Gerrit change, or patch series.
- `integrated`: the work has entered the target integration line.
- `released/shipped`: release or deploy evidence exists.

Run records and closeout proof must include delivery state, dirty working tree
status, commit, push, review, integration, and release fields. If commit /
push / review / integration / release was not explicitly authorized or
performed, final wording must say local implementation and verification are
complete but not durably delivered. Dirty development worktrees are reviewable
state, not durable completion state.

Harness core does not assume the integration line is named `main`. The current
control branch, locked execution branch, target integration line, and release
source may differ. Project adapters, confirmed goals, or explicit user
instructions own those branch decisions; otherwise the current checkout is only
execution context, not proof of the integration target.

`Delivery State` also declares a Target delivery state and authorization fields
for commit, push, review, integration, and release. `goal validate` must reject
targets that cannot be reached with the recorded authorization. `run record
--phase completed` must reject a run whose actual delivery state is below
target.

When gates pass and the target is above `validated-local`, the harness route
must continue the authorized delivery pipeline. It should not hand a passing
dirty worktree back to the user as the normal endpoint. If authorization or
external evidence is missing, record delivery pending and make the missing
authorization/evidence the next action.

Generated development Goals default to `local-validation` with target
`validated-local` and every delivery authorization set to `no`. Commit, push,
review, integration, release, and ship targets require fresh explicit authority
from the current conversation or accepted source spec. Status history must
never supply or extend that authority.

## User-Facing Closeout And Need User Digest

`harness-rule:need-user-digest`: final answers are user-facing closeouts, not
raw control packets. Routine closeouts must state `Need user: None` when no true
pause trigger exists and `Remaining: None` when no non-user follow-up remains.

Use this default shape:

```text
Work completed: <what changed or what gate was reviewed>.
Verification: <commands or checks run, with pass/fail status>.
Delivery state: <implemented-local | validated-local | committed | pushed | review-open | integrated | released/shipped | delivery pending>.
Need user: <concrete decision, manual verification, authorization, external evidence, or None>.
Remaining: <missing verification, delivery pending, follow-up, blocker, or None>.
```

`Need user` is only for concrete human action: a decision, required manual
verification, authorization, credential or paid API handoff, production access,
destructive-operation approval, product-direction choice, or external evidence
that the agent cannot provide. Agent-performed manual inspection belongs in
`Verification`; it does not create a user need by itself.

Do not end routine work by asking broad questions such as whether there is
anything else to confirm. If no user action is needed, say so explicitly.

## Batch Acceptance Coverage

When a goal or spec merges multiple source tasks, or describes batch /
unfinished-task completion, it must include `Source Task Acceptance Map` before
execution:

```md
## Source Task Acceptance Map

- Task: `source task title`
  - Acceptance: `original source task acceptance`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`
```

`goal validate` must reject batch goals without this map or with malformed
items. `run record --phase completed` must reject batch runs unless every map
item is `satisfied` and has concrete evidence. If any source task is deferred
or blocked, the task must stay out of Done or the run should be recorded as
blocked with an unblock condition.

## Milestone Completion Coverage

When the user asks to complete a roadmap milestone, such as `complete M5` or
`推进完成M5`, the default target is whole-milestone completion. Source-spec
acceptance is only one milestone item unless the user or artifact names the
leaf explicitly, such as `M5-S0`.

Goals or specs that represent parent milestone completion and declare
implementation phasing with items such as `M5-S0`, `M5-D1`, `M5-D2`, and
`M5-D3` must include a `Milestone Completion Map` before execution:

```md
## Milestone Completion Map

- Item: `M5-D1 Diagnosis Read Model`
  - Acceptance: `diagnosis read model is implemented and verified`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`
```

`goal validate` must reject parent milestone goals that omit this map or omit
required milestone items from the referenced `Implementation Phasing`.
`run record --phase completed` must reject milestone runs unless every map item
is `satisfied` and has concrete evidence. If only `M5-S0` is complete, the
parent `M5` milestone must stay open and the remaining `D*` items must remain
visible in the task index, milestone, deferred register, or active milestone
map.

Legacy migration note: `Stage Completion Map` was renamed to
`Milestone Completion Map`. New artifacts should use the milestone name;
existing legacy artifacts may still be read for compatibility.

## Compatibility

Fixed contract remains supported. Adapter contract must not rewrite or migrate old
projects unless the user explicitly requests migration.
