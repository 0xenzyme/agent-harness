# Project Contract

This contract defines how Agent Harness finds project control files.

Agent Harness supports two project contracts:

- `fixed` (`contract: "fixed"`): fixed-path project contract.
- `adapter` (`contract: "adapter"`): adapter-driven project contract with configurable
  artifact paths.

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
- project-neutral docs: plugin core docs, examples, and templates must avoid
  private repository names, local absolute paths, customer names, provider-only
  rules, ports, credentials, and downstream production procedures.
- lightweight route explanation: at workflow transitions, the active coding
  agent should briefly state why it is choosing orientation, intake, shape,
  goal, execute, competition, local, worktree, or ask.
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

- `gate-only`: current thread owns control / acceptance. It may inspect
  candidate implementation output, run verification, request corrections, and
  accept or block state. It must not directly edit implementation files.
- `implementer`: current thread may edit files within the accepted scope and
  provide verification evidence for review.
- `mixed`: current thread may both edit and gate only when the user explicitly
  accepts that tradeoff, or when the task is low-risk and local enough that the
  route explanation records why mixed execution is acceptable.

If the user asks the thread to be "main control", "control lane", "gate",
"judge", "reviewer", or "acceptance", default to `gate-only`. If the user
asks the same thread to "implement", "modify", "fix", or "execute until
complete", use `implementer` or `mixed` only after recording that role choice
and the confirmation boundary.

`goal validate` must reject executable goals that do not name one of
`gate-only`, `implementer`, or `mixed`. `run prepare` must carry the execution
role into the prepared run packet. `run record --phase completed` must not
accept completion without verification evidence; for `gate-only`, it must also
cite gate evidence from implementer output and acceptance review.

## Agent-Neutral Delegation Rules

Agent Harness may coordinate coding-agent workers only through explicit
capabilities and result packets. A worker surface must declare or demonstrate
whether it can provide isolated execution, changed-file reporting,
verification summaries, stop-condition reporting, and no-daemon / no-push
compliance.

Preferred worker surface is a Codex CLI subagent. A new Codex App thread is an
explicit, visible, long-lived handoff lane, not the default execution worker.
Fork is not a default execution surface. A fork may be used only when the
controller explicitly approves context inheritance and restates the worker's
thread role, controller thread, allowed scope, return channel, and forbidden
scope.

If the current thread is `gate-only`, the harness should launch worker
subagents by default when scope, verification, context lock, delivery target,
and safety boundaries are clear. It should not routinely ask the user to choose
between launching a worker and changing the control thread to `mixed`.

When those capabilities are unavailable, route to foreground manual execution
or `ask`; do not imply that parallel worker execution, cross-agent handoff, or
automatic acceptance is supported. Support for another coding agent requires
fixtures and validation for its result packet before it can become accepted
state.

Parallel execution must be represented as an execution DAG. The controller may
launch all ready nodes in the same ready set in parallel, but it must not launch
or accept dependent nodes until their dependencies have completed with concrete
result packets.

## Intake Rules

- `intake idea` turns a new idea or requirement into a candidate harness entry.
- Preview is read-only by default and must not start implementation.
- `--record` appends to the configured task index only for supported markdown
  task lists.
- Table-based or unknown task-index formats must refuse automatic recording
  rather than risk corrupting project state.
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
  reference a repo-local confirmed spec, include required execution sections,
  name a valid work mode and execution role, and provide verification or manual
  evidence guidance.
- `run prepare` must not start daemons, spawn coding-agent sessions, push,
  deploy, or open review requests. It may prepare per-node prompts for
  controller-launched workers.
- `run node record` records a single DAG node result. It must reject a completed
  node whose dependencies are not completed, and completed nodes require
  verification evidence.
- `run record` updates only the target run directory's `status.json` and
  `logs/`; it does not update source files, task indexes, review requests,
  deployments, or releases. Completed records require verification evidence;
  completed `gate-only` records also require gate evidence. Runs with enforced
  DAGs cannot be completed until every DAG node is completed.

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

## Delivery State Gate

Implementation state and delivery state are distinct. Harness records must not
describe local verified work as integrated, shipped, or mainline complete unless
the delivery evidence proves it.

Delivery state vocabulary:

- `implemented-local`: implementation exists in the local working tree.
- `validated-local`: implementation has verification evidence locally but is
  not necessarily committed, pushed, reviewed, integrated, released, or shipped.
- `committed`: a local commit records the work.
- `pushed`: the commit is pushed to its upstream branch.
- `review-open`: a provider-neutral review request is open, such as a GitHub
  PR, GitLab MR, Gerrit change, or patch series.
- `integrated`: the work has entered the target development line.
- `released/shipped`: release or deploy evidence exists.

Run records and closeout proof must include delivery state, dirty working tree
status, commit, push, review, integration, and release fields. If commit /
push / review / integration / release was not explicitly authorized or
performed, final wording must say local implementation and verification are
complete but not durably delivered. Dirty development worktrees are reviewable
state, not durable completion state.

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

For development goals, the default delivery intent is `integrate-after-gates`:
commit the accepted work and integrate it into the target development line once
the required gates pass. Release / ship remains separate and must be explicitly
authorized. Local-only goals should lower the target to `validated-local`
instead of putting commit, review, or integration into `Non-Goals`.

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

## Compatibility

Fixed contract remains supported. Adapter contract must not rewrite or migrate old
projects unless the user explicitly requests migration.
