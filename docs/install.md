# Install

Agent Harness is distributed as a Codex marketplace repo.

## Local Development

From any directory:

```bash
codex plugin marketplace add <path-to-agent-harness-repo>
```

Then restart Codex and install `harness` from the plugin directory.

## GitHub Distribution

After this repo is pushed to GitHub:

```bash
codex plugin marketplace add <owner>/<repo>
```

The marketplace entry points to:

```text
./plugins/agent-harness
```

Only `plugins/agent-harness/` is installed as plugin content. The source
repository's own `harness/` and `.harness/` directories are its project adapter
state, not packaged downstream state. Each downstream project owns its own
adapter artifacts after `harness:init` or CLI init/import.

The project-neutral
[Agent Harness capability matrix](HARNESSES.md) summarizes available control
surfaces, worker defaults, rule anchors, boundaries, and verification suites.

## Downstream Project Setup

Once installed, ask Codex or another coding agent with access to the plugin to
use the workflow skill that matches the route. The primary
workflow-controller entry path is `harness:init`, `harness:orient`,
`harness:intake`, and `harness:execute`:

```text
Use harness:init in /path/to/project to adopt Agent Harness. Preview activation and do not edit AGENTS.md without my approval.
Use harness:orient in /path/to/project and tell me the next safe route.
Use harness:intake to triage this idea without implementing it: Add a new import flow.
Use harness:execute for the confirmed goal in harness/goals/YYYY-MM-DD-task-title.md. Verify and sync state evidence.
```

Use the CLI directly only as operator verification, deterministic diagnostics,
scripted adoption, or maintainer tooling from a checked-out copy:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd /path/to/project --contract adapter
```

For an existing adapter project that already has `harness/README.md`
and a task index such as `todolist.md`, import the adapter config without
creating a second task index:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md --dry-run
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md
```

For projects that already use paths such as `docs/mental-model.md` or
`docs/milestones`, pass path overrides and inspect the proposed config before
writing:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md --milestones docs/milestones --deferred-register docs/milestones --mental-model docs/mental-model.md --mental-model-index docs/mental-model.md --mental-models docs/mental-models --dry-run --json
```

The real import writes `.harness/config.json` and creates missing
support artifacts such as the configured status file and runs directory. It
does not create a second task index.

Inspect the resolved paths:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config inspect --cwd /path/to/project --json
node plugins/agent-harness/scripts/agent-harness.mjs config validate --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs adapter inspect --cwd /path/to/project --json
```

For Chinese human-facing command output, pass `--lang zh-CN` or set
`AGENT_HARNESS_LANG=zh-CN`:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project --lang zh-CN
AGENT_HARNESS_LANG=zh-CN node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project
```

The CLI can also create and prepare controlled handoffs when an agent/operator
needs durable packets:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title"
node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title
```

Prepared run packets default worker nodes to `codex-cli-subagent` when that
surface is available. A main control, gate, reviewer, judge, or acceptance lane
is `gate-only` by default: it reviews candidate worker output and verification
evidence, then accepts, blocks, or requests corrections without directly
editing implementation files.

After execution, agents/operators can preview deterministic state sync from git
state and recent run records before writing:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project --record
```

In the adapter contract, create goals from confirmed specs by default:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title" --spec harness/specs/task-title.md
```

If an adapter task has accepted scope but intentionally no standalone spec,
use `--allow-no-spec`. The generated goal records `Spec Policy:
allow-no-spec` and still must validate `Scope`, `Non-Goals`, `Verification`,
`Completion Conditions`, `Pause Conditions`, `Execution Role`, and `Delivery
State`.

## Skill Entry Points

Agent Harness intentionally ships four workflow skills:

- `harness:init` for setup, migration, import, doctor, and activation preview.
- `harness:orient` for read-only project state and next-step recommendation.
- `harness:intake` for ideas, requirements, bugs, and capture-thread notes.
- `harness:execute` for confirmed implementation, verification, and state sync.

Plugin and skill descriptions use a zh-CN/en bilingual fallback in the existing
description fields. Do not add new localized manifest keys until the Codex
plugin contract documents and validates them.

Legacy artifact-oriented `harness-*` wrapper skills are not shipped. Route old
usage to one of the four workflow skills instead.

| Situation | Skill |
| --- | --- |
| Setup, migration, config import, doctor, or activation preview. | `harness:init` |
| Read-only status, todo, blocker, and next-route inspection. | `harness:orient` |
| New idea, requirement, bug, or capture-thread note triage. | `harness:intake` |
| Confirmed task, spec, goal, run, verification, and state sync. | `harness:execute` |

## Packaging Discipline

Before documenting or distributing a changed plugin surface, verify that install
docs, README files, skill files, templates, marketplace metadata, validation
commands, and version metadata describe the same shipped behavior. Public
examples should stay project-neutral; project-specific policy belongs in the
target project's adapter and artifacts.

Run records are evidence artifacts, not source edits. Completed run records
must include verification evidence; `gate-only` completed records must also
include gate evidence that cites implementer output and acceptance evidence.
Candidate output is not accepted completion by itself. Goals with a
`Spec Acceptance Checklist` must satisfy every checklist item, and
adapter-required gates must be recorded under `Required Gate Evidence` with
concrete evidence and `Status: satisfied`.

For documentation or plugin-surface changes in this repository, run:

```bash
git diff --check
npm run test:protocol
npm run test:smoke
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/<goal-file>.md
```

Run `npm run test:eval` only when eval docs or eval fixtures change. Use
`npm run test:all` when protocol and smoke coverage should both run before
handoff; plugin validation remains the packaging gate.

Project-neutral downstream shapes are documented in
`docs/examples/downstream-project-shapes.md`. Evaluation fixture blueprints live
under `evals/` and should be used to check adoption behavior before adding
project-specific assumptions to plugin core.
