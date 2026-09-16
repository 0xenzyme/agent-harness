# Install Agent Harness

Agent Harness has two install surfaces:

1. **Control plane (CLI)** — any host that can run Node.
2. **Skill discovery** — project-local `.agents/skills/` so hosts that scan
   the Agent Skills convention can find `orient`, `intake`, `init`, and
   `execute`.

`.agents/skills/` is the cross-client discovery path. It is not every host's
only directory. Cursor may also read `.cursor/skills/`; Claude Code may also
read `.claude/skills/`. Do not use `.agent/skill`.

Codex marketplace install remains valid and is documented in the appendix.
`npm run validate:plugin` validates the Codex pack, not the core protocol.

## Control Plane

From this checkout:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd /path/to/project --contract adapter
node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd /path/to/project
```

If your environment provides the `agent-harness` binary, use the same
subcommands.

## Skill Discovery

Install the four public skills into a downstream project:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs skills install --cwd /path/to/project
```

This copies:

```text
.agents/skills/orient/
.agents/skills/intake/
.agents/skills/init/
.agents/skills/execute/
.agents/references/
```

Source remains `plugins/agent-harness/skills/`. Use `--dry-run --json` to
preview and `--force` to replace. Personal global installs may use
`~/.agents/skills/`; do not write into Cursor's reserved
`~/.cursor/skills-cursor/`.

Then ask the current host:

```text
Use harness:orient to inspect this project.
```

The four public skills are `harness:orient`, `harness:intake`, `harness:init`,
and `harness:execute`. Ordinary clear change/build requests use the current
host directly; execute is for durable recovery, audit, persistent state sync,
milestones, DAGs, multi-worker work, high-risk control, or explicit bounded
postflight sync to state that already existed. Long-running controller work
uses runtime outcome and transient plan when those capabilities are exposed.

## Appendix: Codex Marketplace

For a local checkout:

```bash
codex plugin marketplace add /path/to/agent-harness
```

The repository metadata declares the unique marketplace identity
`agent-harness-local`. Registration only adds the marketplace; it does not
install the plugin.

Open Codex's Plugins Directory and install `harness` from
`agent-harness-local`. Use the Plugins Directory again for removal or updates.

Codex-specific Goal/Plan/Thread names live in
`plugins/agent-harness/hosts/codex/execution.md`. The optional advanced
`harness_reviewer.toml` template is read-only and inherits the parent model
and reasoning effort.
