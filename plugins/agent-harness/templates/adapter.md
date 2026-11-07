# Project Harness Adapter

Harness contract: adapter

## Artifact Paths

- Goal index: `harness/tasks.md`
- Idea inbox: `harness/intake.md`
- Status file: `harness/status.md`
- Specs: `harness/specs/`
- Goals: `harness/goals/`
- Milestones: `harness/milestones/`
- Deferred register: `harness/milestones/`
- Mental models: `harness/mental-models/`
- Mental model index: `harness/mental-models/README.md`

## Source Of Truth

- Goal/Milestone owns accepted scope and completion.
- Evidence records changed files and actual verification results concisely.
- Status is a bounded current projection.
- Host sessions, resume, workers, terminals and CI own execution detail.

## Config Validation

- Command: `agent-harness config validate --cwd .`
- Legacy Run/checkpoint fields are ignored and are not required for new work.

## Language And Commentary

- Follow `language.default` and `communication.commentary` in `.harness/config.json`.
- Follow the user's language and preserve technical names.

## Artifact Lifecycle

- Keep the task index actionable with a bounded recent-Done window.
- Replace current status sections instead of appending history.
- Do not create execution artifacts for bookkeeping.

## Hard Boundaries

- Do not use credentials, paid APIs, production data, destructive operations,
  push, PR, deploy, publish or release without explicit approval.

## Preflight Requirements

-

## State Sync Requirements

- Update existing Goal/Milestone, task-index and status records only.

## Host Execution

- Runtime outcome and transient plan belong to the host.
- Harness owns accepted scope, dependencies, verification and delivery state.

## Validation Commands

-

## Durable Completion Gates

- spec
- execution
- integration

## Adapter-Owned Overrides

-
