# Project Contract

This contract defines how Agent Harness finds project control files.

Agent Harness supports two project contracts:

- `fixed` (`contract: "fixed"`): fixed-path project contract.
- `adapter` (`contract: "adapter"`): adapter-driven project contract with configurable
  artifact paths.

## Fixed Contract

Fixed projects use these paths:

### `tasks.md`

The human-readable project backlog and task source of truth.

Rules:

- Keep it at the repository root in the fixed contract.
- Codex should read it before proposing or executing a new goal.
- Codex should update it after meaningful work when state sync is required.

### `.agent-harness/config.json`

Machine-readable project settings.

Required fields:

- `contract`
- `projectName`
- `paths`
- `worktree`

### `.agent-harness/status.md`

Human-readable project status:

- active focus
- current branch/worktree posture
- last verification
- known blockers

### `.agent-harness/goals/`

Generated goal handoff files.

### `.agent-harness/runs/`

Loop run logs and automation outputs.

Prepared runs use:

```text
.agent-harness/runs/
  YYYYMMDD-HHMMSS-<slug>/
    run.md
    prompt.md
    subagents.md
    status.json
    logs/
```

## Adapter Contract

Adapter projects use `.agent-harness/config.json` as the machine entry point
when present, but artifact paths come from config and the project adapter.
Projects that already have `docs/harness/README.md` plus a known task index
such as `todolist.md` can be discovered as adapter projects before config is
imported.

Minimum config:

```json
{
  "contract": "adapter",
  "projectName": "",
  "adapter": {
    "docs": "docs/harness/README.md",
    "machineReadable": ".agent-harness/config.json",
    "preflight": [],
    "stateSync": []
  },
  "paths": {
    "taskIndex": "tasks.md",
    "status": ".agent-harness/status.md",
    "specs": "docs/specs",
    "goals": "docs/goals",
    "milestones": "docs/milestones",
    "runs": ".agent-harness/runs",
    "gateRecords": ".agent-harness/runs",
    "deferredRegister": "docs/milestones",
    "mentalModel": "docs/mental-model.md"
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
- mental model / invariants

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
- `run prepare` must not start daemons, spawn Codex sessions, push, deploy, or
  open PRs.

## Compatibility

Fixed contract remains supported. Adapter contract must not rewrite or migrate old
projects unless the user explicitly requests migration.
