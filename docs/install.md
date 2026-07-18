# Install Agent Harness

## Register A Marketplace

For a local checkout:

```bash
codex plugin marketplace add /path/to/agent-harness
```

The repository metadata declares the unique marketplace identity
`agent-harness-local`. Registration only adds the marketplace; it does not
install the plugin.

## Install From The Plugins Directory

Open Codex's Plugins Directory and install `harness` from
`agent-harness-local`. Use the Plugins Directory again for removal or updates.

## Verify

Start a fresh Codex task, then ask:

```text
Use harness:orient to inspect this project.
```

The four public skills are `harness:orient`, `harness:intake`, `harness:init`,
and `harness:execute`. Ordinary clear change/build requests use Codex directly;
execute is for durable recovery, audit, state sync, milestones, DAGs,
multi-worker work, and high-risk control.

Harness does not install explorer/implementer agents or pin model/effort. The
optional advanced `harness_reviewer.toml` template is read-only and inherits
the parent model and reasoning effort.
