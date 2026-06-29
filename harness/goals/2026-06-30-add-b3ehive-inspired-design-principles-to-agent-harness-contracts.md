# Goal: Add B3ehive-Inspired Design Principles To Agent Harness Contracts.

Spec: harness/specs/2026-06-30-b3ehive-inspired-design-principles-contracts.md
Status: Completed.

## Source Task

- `harness/tasks.md`: `P2 Add b3ehive-inspired design principles to Agent Harness contracts.`

## Read First

1. `AGENTS.md`
2. `harness/tasks.md`
3. `harness/README.md`
4. `.harness/config.json`
5. `harness/status.md`
6. `harness/specs/2026-06-30-b3ehive-inspired-design-principles-contracts.md`
7. `harness/specs/2026-06-29-b3ehive-design-reference-review.md`
8. `harness/mental-models/README.md`
9. `plugins/agent-harness/references/adapter-harness.md`
10. `plugins/agent-harness/references/task-routing.md`
11. `plugins/agent-harness/references/gate-results.md`
12. `plugins/agent-harness/references/work-mode-policy.md`

## Work Mode Recommendation

Use `local` while the checkout only contains this foreground docs / contract
work. Pause and ask if unrelated dirty files, version/release decisions, or
activation hook changes appear.

## Scope

- Implement
  `harness/specs/2026-06-30-b3ehive-inspired-design-principles-contracts.md`.
- Translate the five confirmed principles into Agent Harness contract language:
  optional proposal competition, inspectable evidence trail, packaging
  discipline, project-neutral docs, and lightweight route explanation.
- Update the scoped contracts, references, templates, workflow skill
  instructions, public docs, and smoke coverage named by the spec.
- Keep plugin core project-neutral; cite the source review only in repo-local
  specs/tasks/status where historical context belongs.
- Update `harness/tasks.md` and `harness/status.md` after verification.

## Non-Goals

- Do not push, deploy, publish, or open a PR unless separately requested.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.
- Do not create `harness:compete`, add hooks, start daemons/watchers, launch
  background sessions, or copy external project vocabulary into public API.
- Do not bump package versions unless release semantics explicitly change; if
  versions change, keep `package.json` and plugin manifest aligned.

## Context

- Source: The b3ehive review identified five principles worth adopting:


## Project Adapter Requirements

- Read `harness/README.md` for project-specific hard boundaries, validation rules, preflight requirements, and state-sync requirements.
- If a linked Doc is a goal prompt, read the spec and context documents referenced by that goal before editing.
- Agent Harness plugin references: adapter-harness, task-routing, and work-mode-policy.
- Preflight: Read AGENTS.md before editing repository files.
- Preflight: Validate plugin changes with npm run validate:plugin.
- State sync: Update harness/tasks.md after meaningful task state changes.
- State sync: Update harness/status.md after execution or verification.


## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
git diff --check
npm run validate:plugin
npm run test:smoke
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-add-b3ehive-inspired-design-principles-to-agent-harness-contracts.md --json
rg -n "b3ehive|~/project|/Users/" README.md README.zh-CN.md docs plugins/agent-harness
```

The final `rg` command should return no matches; repo-local harness specs,
tasks, goals, and status may cite the source review.

## Completion Conditions

- The source task acceptance is satisfied through concrete contract, docs,
  template, skill, and blueprint updates.
- Public docs and plugin files remain project-neutral and do not advertise
  absent skills or automation behavior.
- Verification commands pass or any failure is documented with next steps.
- Update configured state records (`harness/tasks.md`, `harness/status.md`)
  when the project adapter requires state sync.

## Pause Conditions

- The referenced spec is missing, unconfirmed, or conflicts with code, production constraints, or newer user instructions.
- The work requires credentials, paid APIs, production access, destructive commands, push, PR, or release.
- Product direction, file ownership, or worktree policy is unclear.
- User gives new instructions that conflict with this goal.
- The implementation would require public API naming, package version,
  activation hook, daemon/watcher, or release-policy decisions not already
  authorized by the spec.
