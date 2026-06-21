# Install

Agent Harness is distributed as a Codex marketplace repo.

## Local Development

From any directory:

```bash
codex plugin marketplace add <path-to-agent-harness-repo>
```

Then restart Codex and install `agent-harness` from the plugin directory.

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

Once installed, use `$harness-init` in the target project, or run the CLI
directly from a checked-out copy:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd /path/to/project
```

Then create and prepare controlled handoffs:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title"
node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd /path/to/project --goal .agent-harness/goals/YYYY-MM-DD-task-title.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .agent-harness/runs/YYYYMMDD-HHMMSS-task-title
```
