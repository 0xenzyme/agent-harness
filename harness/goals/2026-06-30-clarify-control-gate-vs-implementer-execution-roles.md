# Goal: Clarify Control/Gate Vs Implementer Execution Roles

Spec: None - user-provided goal context in the current control thread on 2026-06-30.
Status: Completed.

## Source Task

- User goal: Make this thread act as main control and complete the
  judge-plus-athlete correction task by clarifying why Harness allowed the
  same thread to both implement and accept work, then hardening the contract.

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. `harness/README.md`
4. `harness/tasks.md`
5. `harness/status.md`
6. Current dirty diff
7. `plugins/agent-harness/skills/execute/SKILL.md`
8. `plugins/agent-harness/references/task-routing.md`
9. `plugins/agent-harness/references/adapter-harness.md`
10. `plugins/agent-harness/references/gate-results.md`
11. `plugins/agent-harness/templates/goal.md`
12. `docs/project-contract.md`

## Work Mode Recommendation

Use `local` in the current checkout and current branch. Do not create a branch,
worktree, push, or PR unless the user gives a newer explicit instruction.

## Execution Role

Use `mixed` for this correction because the user explicitly asked this thread
to act as main control and also execute the role-separation repair until
complete. Record the role tradeoff in docs and state sync.

## Route Explanation

- Why this is the right next mode: the user confirmed the diagnosis and asked
  this thread to push the judge-plus-athlete task to completion.
- Confirmation boundary: update Harness protocol/docs/templates/guards so
  future control/gate requests default to `gate-only`; do not implement new
  branch/worktree/thread orchestration.

## Scope

- Add explicit execution roles: `gate-only`, `implementer`, and `mixed`.
- Make "main control", "control lane", "gate", "judge", "reviewer", or
  "acceptance" default to `gate-only` unless same-thread implementation is
  clearly authorized.
- Update `harness:execute`, contract references, public docs, goal template,
  goal generator text, and smoke guards.
- Preserve existing uncommitted README/docs work from the prior goal.
- Update `harness/tasks.md` and `harness/status.md` after verification.

## Non-Goals

- Do not implement branch, worktree, subagent, automation, or thread-spawning
  orchestration.
- Do not make old goal files invalid solely because they lack `Execution Role`.
- Do not change plugin activation hooks, installed skill set, package version,
  marketplace metadata, or release policy.
- Do not commit, push, open a PR, deploy, publish, release, start daemons, or
  launch background sessions.
- Do not use credentials, paid APIs, production data, or destructive
  operations.

## Affected Files

- `README.md`
- `README.zh-CN.md`
- `docs/project-contract.md`
- `plugins/agent-harness/skills/execute/SKILL.md`
- `plugins/agent-harness/references/adapter-harness.md`
- `plugins/agent-harness/references/task-routing.md`
- `plugins/agent-harness/references/gate-results.md`
- `plugins/agent-harness/templates/goal.md`
- `plugins/agent-harness/scripts/agent-harness.mjs`
- `tests/smoke.mjs`
- `harness/goals/`
- `harness/tasks.md`
- `harness/status.md`

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
git diff --check
npm run test:smoke
npm run validate:plugin
```

Manual evidence includes reviewing the updated skill, references, template,
README files, and project contract for consistent execution-role language.

## Evidence And State Sync

- Candidate evidence: the prior thread behavior, user diagnosis, current dirty
  diff, execute skill, contract references, template, and smoke guard.
- Accepted evidence: updated files, passing verification commands, updated
  task index, and updated status file.
- State records to update: this goal, `harness/tasks.md`, and
  `harness/status.md`.

## Completion Conditions

- `harness:execute` documents and routes execution roles.
- Contract docs distinguish `gate-only`, `implementer`, and `mixed`.
- Goal template and generated goals include an `Execution Role` section.
- Smoke coverage guards the role-separation docs.
- Verification commands pass or failures are recorded with blockers and next
  steps.
- Harness task/status records are updated.

## Pause Conditions

- The goal conflicts with the adapter, repo instructions, an existing spec,
  production constraints, or newer user instructions.
- Requirements are unclear in a way that changes product direction,
  compatibility, risk, cost, or public contract semantics.
- The work would require credentials, paid APIs, production access,
  destructive operations, push, PR, deploy, publish, release, hooks, daemons,
  background sessions, branch creation, or worktree creation.
- The implementation would require new runtime orchestration rather than
  protocol/docs/template/guard clarification.
