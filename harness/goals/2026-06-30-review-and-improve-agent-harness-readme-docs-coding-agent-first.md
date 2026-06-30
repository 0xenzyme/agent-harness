# Goal: Review And Improve Agent Harness README/Docs From A Coding-Agent-First User Perspective

Spec: None - user-provided goal context in the current control thread on 2026-06-30.
Status: Completed.

## Source Task

- User goal: Review and improve Agent Harness README/docs so the primary user
  path is coding-agent-first rather than terminal-first.
- Related task: `harness/tasks.md`: `P2 Define multi coding-agent support
  roadmap.`

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. `harness/README.md`
4. `harness/tasks.md`
5. `harness/status.md`
6. Current dirty diff
7. `README.md`
8. `README.zh-CN.md`
9. `docs/install.md`
10. `docs/project-contract.md`
11. `plugins/agent-harness/skills/init/SKILL.md`
12. `plugins/agent-harness/skills/orient/SKILL.md`
13. `plugins/agent-harness/skills/intake/SKILL.md`
14. `plugins/agent-harness/skills/execute/SKILL.md`

## Work Mode Recommendation

Use `local` in the current checkout and current branch. Do not create a branch,
worktree, push, or PR unless the user gives a newer explicit instruction.

## Route Explanation

- Why this is the right next mode: the user explicitly authorized
  `harness:execute` for a confirmed documentation goal in the current repo.
- Confirmation boundary: only documentation and necessary smoke/validation
  guards are in scope; feature implementation and release work are out of
  scope.

## Scope

- Reframe `README.md` and `README.zh-CN.md` so the homepage primary workflow
  starts with users asking Codex or a coding agent to use `harness:init`,
  `harness:orient`, `harness:intake`, or `harness:execute`.
- Keep CLI and `npm` commands documented, but place them under operator
  verification, deterministic diagnostics, maintainer tooling, or internal
  skill execution context.
- Preserve the short b3ehive influence note as inspiration, while avoiding
  downstream-specific b3ehive project strategy in core contracts.
- Add roadmap language for future multi coding-agent support around
  agent-neutral contracts, capability declarations, result packets, and
  verification evidence.
- Review and update `docs/install.md`, `docs/project-contract.md`, and plugin
  skill user-entry language where needed.
- Add only minimal smoke/validation guard coverage needed to keep the docs
  entry path coding-agent-first.
- Update `harness/tasks.md` and `harness/status.md` after verification.

## Non-Goals

- Do not implement support for other coding agents.
- Do not change CLI behavior, plugin activation behavior, hooks, command
  syntax, schemas, package version, marketplace metadata, or installed skills
  unless a documentation guard requires it.
- Do not copy b3ehive project structure, local policy, product strategy, ports,
  credentials, provider rules, or production procedures into Agent Harness
  core docs.
- Do not create a branch or worktree.
- Do not commit, push, open a PR, deploy, publish, release, start daemons, or
  launch background sessions.
- Do not use credentials, paid APIs, production data, or destructive
  operations.

## Affected Files

- `README.md`
- `README.zh-CN.md`
- `docs/install.md`
- `docs/project-contract.md`
- `tests/smoke.mjs`, only for a minimal documentation-positioning guard if
  needed
- `harness/goals/`
- `harness/tasks.md`
- `harness/status.md`

## Verification

```bash
git diff --check
npm run test:smoke
npm run validate:plugin
```

Run `npm run validate:plugin` because public docs, smoke guard behavior, and
plugin contract/documentation alignment are in scope. Manual evidence also
includes reviewing README, install, project-contract, and workflow skill docs
for terminal-first user-entry language.

## Evidence And State Sync

- Candidate evidence: user goal text, existing README diffs, current dirty
  diff, adapter docs, workflow skill docs, install docs, and project contract
  docs.
- Accepted evidence: updated docs, minimal smoke guard if present, passing
  verification commands, updated task index, and updated status file.
- State records to update: this goal, `harness/tasks.md`, and
  `harness/status.md`.

## Completion Conditions

- Homepage docs present a coding-agent-first first-use path.
- CLI and `npm` commands remain documented but are clearly framed as
  agent/operator verification, deterministic diagnostics, maintainer tooling,
  or internal tooling.
- b3ehive is described only as inspiration and does not become core project
  policy or a downstream-specific contract.
- Roadmap covers future coding-agent support through agent-neutral contracts,
  capability declarations, result packets, and verification evidence.
- Verification commands pass, or failures are recorded with blockers and next
  steps.
- Harness task/status state records are updated with the result.

## Pause Conditions

- The goal conflicts with the adapter, repo instructions, an existing spec,
  production constraints, or newer user instructions.
- Requirements are unclear in a way that changes product direction,
  compatibility, risk, cost, or public contract semantics.
- The work would require credentials, paid APIs, production access,
  destructive operations, push, PR, deploy, publish, release, hooks, daemons,
  background sessions, branch creation, or worktree creation.
- Documentation changes would require implementing new agent support, changing
  plugin activation behavior, or making release/version decisions.
