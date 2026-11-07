# Agent Harness Repository Instructions

## Scope

This repository builds a reusable coding-agent harness for project-level task control,
goal handoffs, and loop engineering.

## Product Value Proposition

Agent Harness exists to reduce the human's task-routing burden after product
direction, constraints, and true pause conditions are accepted. In downstream
projects, the installed harness should turn accepted roadmap or milestone
direction into explicit stage maps, executable goals, verification, and state
sync. The host owns sessions, resume, workers, terminals and execution detail.
Delivery is the primary outcome; Harness records only the accepted result,
concise verification, remaining gaps and true pause conditions.

When developing this repository, preserve that promise: the harness should not
stop at the first locally satisfiable artifact if the accepted user intent is a
larger roadmap stage. Source-spec acceptance, implementation slices, delivery
state, and parent-stage completion must remain distinct and mechanically
checkable.

## Rules

- Keep project contracts stable and explicit.
- Prefer deterministic scripts for initialization and checks.
- Do not add network services or persistent daemons without a separate design.
- Do not make project-specific assumptions from one downstream repo part of the core contract.
- Keep README value proposition, workflow skills, templates, CLI gates, and
  project contract docs aligned when changing harness behavior.
- Validate the plugin with `npm run validate:plugin` after plugin changes.

## File Contract

- Fixed `contract: "fixed"` projects use `harness/tasks.md`,
  `.harness/config.json`, `harness/status.md`, and `harness/goals/`.
- Adapter `contract: "adapter"` projects use `.harness/config.json` plus a
  project adapter to declare task index, specs, goals, milestones, gates,
  status, and deferred-register paths.
- Plugin core defines protocol; project adapters define project-specific
  overrides; documentation artifacts record accepted outcomes and concise
  verification. Legacy Run/checkpoint fields are ignored during migration.
- The core does not create Runs, hash source files, copy logs, seal receipts,
  or monitor code drift. Completed targets do not reopen because source changed.
- Target Delivery Contracts own outcomes, global hard constraints, whole-target
  verification, delivery authority, and final reporting. Nodes inherit them and
  add only local scope, constraints, and checks.
