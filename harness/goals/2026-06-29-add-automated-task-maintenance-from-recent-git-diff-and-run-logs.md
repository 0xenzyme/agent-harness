# Goal: Add Automated Task Maintenance From Recent Git Diff And Run Logs.

Spec: harness/specs/2026-06-29-automated-task-maintenance-design.md
Status: Ready for execution from confirmed spec.

## Source Task

- `harness/tasks.md`: `P2 Add automated task maintenance from recent git diff and run logs.`

## Read First

1. `AGENTS.md`
2. `harness/tasks.md`
3. `harness/README.md`
4. `.harness/config.json`
5. `harness/status.md`
6. `harness/specs/2026-06-29-automated-task-maintenance-design.md`

## Work Mode Recommendation

Use `local` until the goal has a confirmed spec and clear file ownership.

## Scope

- Define concrete acceptance before implementation.

## Non-Goals

- Do not push, deploy, publish, or open a PR unless separately requested.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.

## Context

- Source: harness/tasks.md


## Project Adapter Requirements

- Read `harness/README.md` for project-specific hard boundaries, validation rules, preflight requirements, and state-sync requirements.
- If a linked Doc is a goal prompt, read the spec and context documents referenced by that goal before editing.
- Agent Harness plugin references: adapter-harness, task-routing, and work-mode-policy.
- Preflight: Read AGENTS.md before editing repository files.
- Preflight: Validate plugin changes with npm run validate:plugin.
- State sync: Update harness/tasks.md after meaningful task state changes.
- State sync: Update harness/status.md after execution or verification.


## Verification

Run the smallest relevant deterministic checks for the files changed by this goal.
If no deterministic command exists, document the manual verification evidence before completion.

## Completion Conditions

- The source task acceptance is satisfied.
- Verification commands pass or any failure is documented with next steps.
- Update configured state records (`harness/tasks.md`, `harness/status.md`) when the project adapter requires state sync.

## Pause Conditions

- The referenced spec is missing, unconfirmed, or conflicts with code, production constraints, or newer user instructions.
- The work requires credentials, paid APIs, production access, destructive commands, push, PR, or release.
- Product direction, file ownership, or worktree policy is unclear.
- User gives new instructions that conflict with this goal.
