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
