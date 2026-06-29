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
- Codex should read it before proposing or executing a new goal.
- Codex should update it after meaningful work when state sync is required.

### `.harness/config.json`

Machine-readable project settings.

Required fields:

- `contract`
- `projectName`
- `paths`
- `worktree`

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

The adapter should declare:

- artifact paths and source-of-truth files
- DB, production, Admin CLI, credential, paid-call, and destructive-operation
  boundaries
- commit, PR, release, and ship policies
- validation commands
- enabled gates and project-specific gate details
- UI harness or mental model locations when relevant

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

## Activation Rules

Adapter files do not automatically inject instructions into Codex. Agent
Harness currently activates through project-scope `AGENTS.md` instructions,
explicit user requests, harness skills, and CLI commands.

The plugin manifest intentionally does not declare `hooks`. Conditional
`SessionStart` bootstrap is deferred until plugin validation accepts hook
manifests and runtime tests prove that non-harness projects receive no
additional context.

## Intake Rules

- `intake idea` turns a new idea or requirement into a candidate harness entry.
- Preview is read-only by default and must not start implementation.
- `--record` appends to the configured task index only for supported markdown
  task lists.
- Table-based or unknown task-index formats must refuse automatic recording
  rather than risk corrupting project state.
- Intake must not create specs, goals, runs, branches, PRs, deployments, or
  background automation.

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

- `run.md` records source goal, work mode, manual checkpoints, and verification.
- `prompt.md` is the ready-to-use prompt for `/goal` or a new Codex session.
- `subagents.md` gives bounded split guidance for `small`, `medium`, `large`,
  and `ask` tasks.
- `status.json` stores machine-readable run state.
- `logs/` is reserved for command output summaries and automation logs.
- `goal validate` is the gate before `run prepare`: executable goals must
  reference a repo-local confirmed spec, include required execution sections,
  name a valid work mode, and provide verification or manual evidence guidance.
- `run prepare` must not start daemons, spawn Codex sessions, push, deploy, or
  open PRs.
- `run record` updates only the target run directory's `status.json` and
  `logs/`; it does not update source files, task indexes, PRs, deployments, or
  releases.

## Compatibility

Fixed contract remains supported. Adapter contract must not rewrite or migrate old
projects unless the user explicitly requests migration.
