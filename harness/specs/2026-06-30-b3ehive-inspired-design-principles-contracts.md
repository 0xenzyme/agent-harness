# B3ehive-Inspired Design Principles Contract Update

Status: Implemented.
Created: 2026-06-30
Updated: 2026-06-30

## Background

`harness/specs/2026-06-29-b3ehive-design-reference-review.md` recorded five
principles worth adopting in Agent Harness:

- optional proposal competition
- inspectable evidence trail
- packaging discipline
- project-neutral docs
- lightweight route explanation

The review is source evidence, not a runtime dependency. The implementation
should translate these ideas into Agent Harness terminology and contracts
without copying external project structure, names, local paths, automation
machinery, or distribution workflow.

## Goal

Make the five design principles explicit requirements in Agent Harness
contracts, docs, templates, and the skill architecture blueprint so future
tasks can apply them consistently.

## Scope

### Contract And Reference Updates

Update the core contract and references so the principles are visible where
agents make routing, state, and acceptance decisions:

- `docs/project-contract.md`
- `plugins/agent-harness/references/adapter-harness.md`
- `plugins/agent-harness/references/task-routing.md`
- `plugins/agent-harness/references/gate-results.md`
- `plugins/agent-harness/references/work-mode-policy.md`
- `plugins/agent-harness/references/model-routing.md` or
  `plugins/agent-harness/references/controller-communication.md` if their
  existing text is the right place for route or master-lane guidance

The contract update should define the principles as generic Agent Harness
rules, not as imported external-methodology rules.

### Template Updates

Update starter templates only where the principle changes what a new adapter
or handoff should record:

- `plugins/agent-harness/templates/adapter.md`
- `plugins/agent-harness/templates/spec.md`
- `plugins/agent-harness/templates/goal.md`
- `plugins/agent-harness/templates/status.md`
- `plugins/agent-harness/templates/mental-models.md`
- relevant `plugins/agent-harness/templates/mental-model-*.md` files

The templates should make it natural to record route explanations,
authoritative evidence, packaging / validation expectations, and project-local
boundaries without adding noisy boilerplate.

### Skill And Blueprint Updates

Update workflow skills and the existing skill architecture blueprint so the
principles constrain behavior:

- `harness/specs/2026-06-29-agent-harness-skill-architecture-blueprint.md`
- `plugins/agent-harness/skills/orient/SKILL.md`
- `plugins/agent-harness/skills/execute/SKILL.md`
- compatibility wrappers only if their routing text would otherwise conflict

Expected behavior:

- `harness:orient` explains why it recommends `orient`, `intake`, `shape`,
  `goal`, `execute`, `competition`, or `ask`.
- `harness:execute` treats subagents, automation, inbox notes, and competition
  output as candidate evidence until the control lane validates it.
- proposal competition remains an optional Shape protocol for ambiguous work,
  not a default path and not an implementation launcher.

### Public Documentation Updates

Update public docs only where needed to expose the principles to users:

- `README.md`
- `README.zh-CN.md`
- `docs/install.md`
- `docs/versioning.md` if packaging discipline needs clearer version /
  manifest alignment language

Public docs should stay project-neutral and should not mention private local
reference paths.

### Tests And Guards

Update tests when templates, CLI text, or skill surface expectations change:

- `tests/smoke.mjs`
- existing plugin validation and smoke commands
- a grep guard proving public docs/plugin files did not gain external project
  names or local absolute paths

## Non-Goals

- Do not implement a standalone `harness:compete` skill in this task.
- Do not add cron, daemon, watcher, background Codex session, worker pool,
  scheduled automation, tmux orchestration, or release machinery.
- Do not copy external project vocabulary as public Agent Harness API.
- Do not change plugin activation or add `.codex-plugin/plugin.json` hooks.
- Do not make downstream-project product rules part of plugin core.
- Do not bump package versions unless the implementation intentionally changes
  installable release semantics; if versions are changed, keep `package.json`
  and `plugins/agent-harness/.codex-plugin/plugin.json` aligned.
- Do not commit, push, open PRs, deploy, publish, or release without explicit
  user approval.

## Key Decisions

- The five principles are adopted as Agent Harness design principles, not as a
  dependency on the source reference project.
- Proposal competition is a documented Shape protocol first. It may recommend
  routes, tradeoffs, risks, and coverage union, but execution remains under
  `harness:execute` after control-lane acceptance.
- Inspectable evidence means accepted state must point to concrete artifacts:
  task entries, specs, goals, runs, gate records, command summaries, or human
  review notes.
- Packaging discipline means public docs, install docs, marketplace metadata,
  skill files, templates, validation commands, and version metadata must not
  drift apart.
- Project-neutral docs means plugin core examples and templates avoid private
  repo names, local absolute paths, customer names, provider-specific rules,
  ports, credentials, and project-only production procedures.
- Lightweight route explanation means a short reason at transition points, not
  a heavy route ledger.

## Task Routing

- Level: 2 Standard Adapter.
- Reason: The change touches contracts, templates, public docs, skill behavior,
  and validation expectations, but it should not change runtime execution
  semantics or launch automation.
- Required docs: this spec, the b3ehive reference review, `AGENTS.md`,
  `.harness/config.json`, `harness/README.md`, `harness/tasks.md`,
  `harness/status.md`, and relevant mental models.
- Required gates: spec, execution, integration.
- Execution mode: `local` if the checkout only contains this work; `ask` if
  unrelated dirty files or release/version decisions appear.
- Validation: plugin validation, smoke tests, diff whitespace check, goal
  validation, and public-doc neutrality grep.
- Escalation triggers: new skill surface, activation hooks, version/release
  policy changes, automation/daemon behavior, public API naming, or unclear
  product direction.

## Affected Files

Expected implementation files:

- `docs/project-contract.md`
- `README.md`
- `README.zh-CN.md`
- `docs/install.md`
- `docs/versioning.md` if needed
- `plugins/agent-harness/references/*.md`
- `plugins/agent-harness/templates/*.md`
- `plugins/agent-harness/skills/orient/SKILL.md`
- `plugins/agent-harness/skills/execute/SKILL.md`
- selected compatibility wrapper `SKILL.md` files if needed
- `harness/specs/2026-06-29-agent-harness-skill-architecture-blueprint.md`
- `tests/smoke.mjs` if template, CLI, or skill expectations change
- `harness/tasks.md`
- `harness/status.md`

Implementation should keep edits scoped to those surfaces unless validation
shows another file is part of the same public contract.

## Acceptance Criteria

- The five principles are explicitly defined in Agent Harness terms in the
  core contract or references.
- The principles are propagated to the templates that generate adapter, spec,
  goal, status, or mental model artifacts when relevant.
- `harness:orient` and `harness:execute` instructions reflect route
  explanation, candidate evidence, and optional competition boundaries.
- The skill architecture blueprint records the principles as durable
  requirements rather than only review notes.
- Public docs describe the behavior without exposing private local paths or
  presenting absent skills as installed features.
- No new daemon, watcher, hook, PR, release, or autonomous session behavior is
  added.
- Task/status state records the implementation and verification evidence.

## Implementation Summary

- Added the five design principles to the core project contract and plugin
  references.
- Propagated route explanation, candidate evidence, packaging discipline, and
  project-neutral boundaries into starter templates.
- Updated `harness:orient` and `harness:execute` instructions for route
  reasoning and control-lane acceptance.
- Updated public docs and version/install guidance without introducing
  project-specific public examples.
- Added smoke guards for principle coverage and public-doc neutrality.

## Verification

Run:

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
git diff --check
npm run validate:plugin
npm run test:smoke
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-add-b3ehive-inspired-design-principles-to-agent-harness-contracts.md --json
rg -n "b3ehive|~/project|/Users/" README.md README.zh-CN.md docs plugins/agent-harness
```

Expected grep result: no matches in public docs or plugin files. Repo-local
specs and tasks may cite the source review by name.

## Completion Conditions

- All acceptance criteria are satisfied.
- Verification commands pass, or any failure is documented with a follow-up
  task and blocker status.
- `harness/tasks.md` records the task as done with spec / goal / verification
  references.
- `harness/status.md` records current focus, verification, blockers, and any
  deferred work.
- No branch/worktree, push, PR, deploy, publish, release, daemon, watcher, or
  background session is created.

## Pause Conditions

- This spec conflicts with `AGENTS.md`, the project adapter, code behavior,
  production constraints, or newer user instructions.
- A principle cannot be expressed without changing public API, skill names,
  package version, activation hooks, or release policy.
- Public docs would need to mention external project names, local absolute
  paths, private repo facts, customer names, credentials, provider rules,
  ports, production procedures, or downstream-project assumptions.
- The implementation would require credentials, paid APIs, production access,
  destructive operations, push, PR, deploy, publish, release, daemons,
  watchers, background sessions, or automatic execution.
- Product direction, ownership, or compatibility impact is unclear.
