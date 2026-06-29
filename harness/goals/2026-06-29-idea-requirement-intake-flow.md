# Goal: Idea / Requirement Intake Flow

Spec: harness/specs/2026-06-29-idea-requirement-intake-flow-design.md
Status: Completed.

## Source Task

- `harness/tasks.md`: `P2 Add idea / requirement intake flow.`

## Read First

1. `harness/specs/2026-06-29-idea-requirement-intake-flow-design.md`
2. `AGENTS.md`
3. `.harness/config.json`
4. `harness/README.md`
5. `harness/tasks.md`
6. `harness/status.md`
7. `harness/mental-models/01-user-scenario.md`
8. `plugins/agent-harness/scripts/agent-harness.mjs`
9. `plugins/agent-harness/skills/harness-adapter/SKILL.md`
10. `plugins/agent-harness/skills/harness-tasks/SKILL.md`
11. `tests/smoke.mjs`

## Work Mode Recommendation

Use `local`. The checkout is clean and the adapter says to use the current
checkout unless the user explicitly asks for an isolated worktree.

## Scope

- Implement `agent-harness intake idea`.
- Keep preview read-only by default.
- Add explicit `--record` task-index append for supported markdown task
  indexes.
- Update docs, skills, smoke tests, task state, and status.

## Non-Goals

- Do not implement any intake idea.
- Do not auto-create specs, goals, runs, branches, PRs, deployments, daemons,
  or background automation.
- Do not silently modify task indexes.
- Do not corrupt unknown or table-based task indexes.

## Context

- Source: User asked to add a mental model and follow-up for new ideas or new
  requirements entering the harness.
- Current mental model: intake turns external intent into harness state before
  implementation.
- Relationship to `orient next`: orientation starts from existing state; intake
  starts from a new external idea.

## Verification

```bash
git diff --check
npm run validate:plugin
npm run test:smoke
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd . --idea "Add an intake flow for new ideas" --json
```

## Completion Conditions

- The source task acceptance is satisfied.
- Preview and record paths are implemented and tested.
- Docs and skills describe the workflow.
- `harness/tasks.md` and `harness/status.md` are updated.
- Verification passes.

## Pause Conditions

- The spec conflicts with repo instructions, adapter boundaries, or newer user
  instructions.
- Unknown task-index format would make recording unsafe.
- Product direction, priority, or scope requires human judgment beyond
  candidate preview.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, release, daemons, watchers, or automatic execution are required.
