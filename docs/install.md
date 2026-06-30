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

## Downstream Project Setup

Once installed, use `harness:init` in the target project, or run the CLI
directly from a checked-out copy:

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

Then create and prepare controlled handoffs:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title"
node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title
```

After execution, preview deterministic state sync from git state and recent
run records before writing:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project --record
```

In the adapter contract, create goals from confirmed specs:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title" --spec harness/specs/task-title.md
```

## Skill Entry Points

Agent Harness intentionally ships four workflow skills:

- `harness:orient` for read-only project state and next-step recommendation.
- `harness:intake` for ideas, requirements, bugs, and capture-thread notes.
- `harness:execute` for confirmed implementation, verification, and state sync.
- `harness:init` for setup, migration, import, doctor, and activation preview.

Legacy artifact-oriented `harness-*` wrapper skills are not shipped. Route old
usage to one of the four workflow skills instead.

| Situation | Skill |
| --- | --- |
| Read-only status, todo, blocker, and next-route inspection. | `harness:orient` |
| New idea, requirement, bug, or capture-thread note triage. | `harness:intake` |
| Setup, migration, config import, doctor, or activation preview. | `harness:init` |
| Confirmed task, spec, goal, run, verification, and state sync. | `harness:execute` |

## Packaging Discipline

Before documenting or distributing a changed plugin surface, verify that install
docs, README files, skill files, templates, marketplace metadata, validation
commands, and version metadata describe the same shipped behavior. Public
examples should stay project-neutral; project-specific policy belongs in the
target project's adapter and artifacts.

Project-neutral downstream shapes are documented in
`docs/examples/downstream-project-shapes.md`. Evaluation fixture blueprints live
under `evals/` and should be used to check adoption behavior before adding
project-specific assumptions to plugin core.
