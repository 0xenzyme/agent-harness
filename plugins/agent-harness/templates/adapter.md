# Project Harness Adapter

Harness contract: adapter

This adapter records project-specific harness decisions. Generic rules live in
the Agent Harness plugin references.

## Artifact Paths

- Task index: `tasks.md`
- Status file: `.agent-harness/status.md`
- Specs: `docs/specs/`
- Goals: `docs/goals/`
- Milestones: `docs/milestones/`
- Runs / logs: `.agent-harness/runs/`
- Gate records: `.agent-harness/runs/`
- Deferred register: `docs/milestones/`
- Mental model / invariants:

## Source Of Truth

-

## Hard Boundaries

- Do not use credentials, paid APIs, production data, destructive operations,
  push, PR, deploy, publish, or release without explicit approval.

## Preflight Requirements

-

## State Sync Requirements

-

## Commit / PR / Ship Policy

-

## Validation Commands

-

## Enabled Gates

- spec
- execution
- integration

## Adapter-Owned Overrides

-
