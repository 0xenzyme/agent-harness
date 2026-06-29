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

- Fixed `contract: "fixed"` projects use `harness/tasks.md`,
  `.harness/config.json`, `harness/status.md`,
  `harness/goals/`, and `.harness/runs/`.
- Adapter `contract: "adapter"` projects use `.harness/config.json` plus a
  project adapter to declare task index, specs, goals, milestones, runs, gates,
  status, and deferred-register paths.
- Plugin core defines protocol; project adapters define project-specific
  overrides; documentation artifacts record project facts and execution
  evidence.
