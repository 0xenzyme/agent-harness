# Agent Harness Repository Instructions

## Scope

This repository builds a reusable Codex harness for project-level task control,
goal handoffs, and loop engineering.

## Rules

- Keep project contracts stable and explicit.
- Prefer deterministic scripts for initialization and checks.
- Do not add network services or persistent daemons without a separate design.
- Do not make project-specific assumptions from one downstream repo part of the core contract.
- Validate the plugin with `npm run validate:plugin` after plugin changes.

## File Contract

- `tasks.md` is the project backlog source of truth in downstream repos.
- `.agent-harness/config.json` stores machine-readable harness settings.
- `.agent-harness/status.md` stores current project status for humans.
- `.agent-harness/goals/` stores generated goal handoff files.
- `.agent-harness/runs/` stores loop run logs and automation outputs.
