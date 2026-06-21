# Agent Harness

Agent Harness is a reusable Codex workflow package for development projects.
It standardizes the small control plane that every project needs before goal
automation and loop engineering can work reliably.

## Problem

When one person operates many software projects, each project tends to invent
its own backlog file, status notes, branch habits, and goal prompts. That makes
automation brittle. Codex cannot safely decide what to do next if it has to
rediscover each project's task system from scratch.

## Contract

Every harnessed project should use the same paths:

- `tasks.md` - human-readable project backlog and todo source of truth.
- `.agent-harness/config.json` - machine-readable harness config.
- `.agent-harness/status.md` - human-readable current status.
- `.agent-harness/goals/` - generated goal handoff files.
- `.agent-harness/runs/` - loop run logs and automation outputs.

## Package Shape

This repo is both a source project and a Codex local marketplace:

- `.agents/plugins/marketplace.json` exposes the local plugin.
- `plugins/agent-harness/` contains the installable Codex plugin.
- `plugins/agent-harness/skills/` contains reusable Codex skills.
- `plugins/agent-harness/scripts/agent-harness.mjs` provides a small CLI.

## First Commands

Validate the plugin:

```bash
npm run validate:plugin
```

Initialize a downstream project:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd /path/to/project
```

Check a downstream project:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project
```

## Install In Codex

During local development, add this repo as a marketplace root:

```bash
codex plugin marketplace add <path-to-agent-harness-repo>
```

After publishing this repo to GitHub, install it on another machine with:

```bash
codex plugin marketplace add <owner>/<repo>
```

Codex will read `.agents/plugins/marketplace.json` and expose the
`agent-harness` plugin.

## Current Design Bias

The first version is intentionally light:

- It creates stable files and directories.
- It gives Codex a consistent place to read and update tasks.
- It recommends worktree behavior, but does not force branch creation.
- It starts with report-only loops before unattended fix loops.

The goal is to make Codex more predictable before making it more autonomous.
