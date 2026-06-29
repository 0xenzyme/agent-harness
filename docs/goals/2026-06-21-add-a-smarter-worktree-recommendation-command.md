# Goal: Add A Smarter Worktree Recommendation Command

Spec: docs/superpowers/specs/2026-06-21-smarter-worktree-recommendation-command-design.md
Status: Completed.

## Source Task

- `tasks.md`: `P1 Add a smarter worktree recommendation command`

## Read First

1. `AGENTS.md`
2. `tasks.md`
3. `.agent-harness/config.json`
4. `.agent-harness/status.md`
5. `docs/superpowers/specs/2026-06-21-smarter-worktree-recommendation-command-design.md`

## Work Mode Recommendation

Use `ask` until the goal has a confirmed spec and clear file ownership.

## Scope

- CLI reports `local`, `worktree`, or `ask` with reasons from git status and config.

## Non-Goals

- Do not push, deploy, publish, or open a PR unless separately requested.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.

## Context

- Source: Codex branch/worktree behavior should be explicit and contextual.

## Verification

```bash
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd .
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd . --json
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .
```

Also cover `local`, `worktree`, `ask`, non-git, and invalid-config cases with temporary projects or equivalent deterministic checks.

## Completion Conditions

- The source task acceptance is satisfied.
- Verification commands pass or any failure is documented with next steps.
- `tasks.md` and `.agent-harness/status.md` are updated.

## Pause Conditions

- The work requires credentials, paid APIs, production access, destructive commands, push, PR, or release.
- Product direction, file ownership, or worktree policy is unclear.
- User gives new instructions that conflict with this goal.
