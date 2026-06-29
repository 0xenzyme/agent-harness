# Project Harness Adapter

Harness contract: adapter

This adapter records project-specific harness decisions. Generic rules live in
the Agent Harness plugin references.

## Artifact Paths

- Task index: `harness/tasks.md`
- Status file: `harness/status.md`
- Specs: `harness/specs/`
- Goals: `harness/goals/`
- Milestones: `harness/milestones/`
- Runs / logs: `.harness/runs/`
- Gate records: `.harness/runs/`
- Deferred register: `harness/milestones/`
- Mental models: `harness/mental-models/`
- Mental model index: `harness/mental-models/README.md`

## Source Of Truth

-

## Design Principles

- Optional proposal competition:
- Inspectable evidence trail:
- Packaging / validation discipline:
- Project-neutral public docs:
- Lightweight route explanation:

## Config Validation

- Schema: `plugins/agent-harness/schemas/config.schema.json`
- Command: `agent-harness config validate --cwd .`
- Result:

## Idea Inbox Policy

- Capture thread:
- Promotion rule:
- Non-execution boundary:

## Optional Competition Policy

- Recommended when:
- Allowed outputs:
- Forbidden actions:
- Control-lane acceptance:

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

## Task Kinds

- `development`: scoped implementation, review, repair, or documentation work.
- `observe`: ongoing monitoring that records signals and may produce follow-up
  tasks after triage.

## Adapter-Owned Overrides

-
