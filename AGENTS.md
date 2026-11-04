# Agent Harness Repository Instructions

## Scope

This repository builds a reusable coding-agent harness for project-level task control,
goal handoffs, and loop engineering.

## Product Value Proposition

Agent Harness exists to reduce the human's task-routing burden after product
direction, constraints, and true pause conditions are accepted. In downstream
projects, the installed harness should turn accepted roadmap or milestone
direction into explicit stage maps, executable goals, run orchestration, worker
execution, verification, and state sync. Delivery is the primary outcome;
evidence and process artifacts should be proportionate to verification, recovery,
and explicit audit needs rather than becoming extra deliverables.

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
  `.harness/config.json`, `harness/status.md`,
  `harness/goals/`, and `.harness/runs/`.
- Adapter `contract: "adapter"` projects use `.harness/config.json` plus a
  project adapter to declare task index, specs, goals, milestones, runs, gates,
  status, and deferred-register paths.
- Plugin core defines protocol; project adapters define project-specific
  overrides; documentation artifacts record project facts and execution
  evidence.
- New durable Runs require an explicit plan, manifest v2, and an enforced
  checkpoint. Existing manifest v1 Runs remain readable and recoverable;
  `--legacy` is reserved for explicit migration compatibility.
- Target Delivery Contracts own outcomes, global hard constraints, whole-target
  verification, delivery authority, and final reporting. Nodes inherit them and
  add only local scope, constraints, and checks.
