# Spec: Complete Open Task Batch

Created: 2026-06-30
Status: accepted

## Background

The current task index has multiple unfinished Agent Harness tasks that all
touch the same public contract surface: execution roles, gate evidence,
coding-agent delegation, packaging boundaries, bilingual skill discovery, and
conditional bootstrap limits.

The user asked to merge the unfinished tasks and use the current thread as the
main control lane until they are complete.

## Goal

Complete the unfinished task batch in one foreground pass while preserving the
Agent Harness protocol boundary:

- `Add execution-role and gate-evidence enforcement`
- `Do a second-pass README and plugin packaging-boundary cleanup`
- `Add zh-CN/en skill suggestion localization or bilingual fallback`
- `Generalize execute delegation across coding agents`
- `Define multi coding-agent support roadmap`
- `Revisit conditional Agent Harness bootstrap after hook validation support`

## Scope

- Add the smallest CLI validation changes needed for `goal validate` and
  `run record` to make execution role and gate evidence inspectable.
- Align smoke tests with the new validation behavior.
- Clarify packaging boundaries in public docs and install/project-contract
  docs: current-project harness artifacts are not installed plugin content.
- Provide a bilingual fallback for user-visible skill / plugin descriptions
  when platform-native localized metadata is unavailable.
- Document an agent-neutral delegation and multi-coding-agent roadmap without
  claiming support for another agent runtime.
- Re-check the conditional bootstrap boundary and close or defer it based on
  current manifest validation behavior.
- Update `harness/tasks.md`, `harness/status.md`, and run evidence after
  verification.

## Non-Goals

- Do not add new workflow skills, MCP servers, background workers, daemons,
  watchers, push, PR, deploy, publish, or release behavior.
- Do not add `hooks` to `.codex-plugin/plugin.json` unless validation and
  runtime evidence prove non-harness projects receive no injected context.
- Do not claim full support for non-Codex coding agents before capability,
  result-packet, and fixture contracts are implemented and verified.
- Do not move project-local adapter artifacts into the shipped plugin package.
- Do not modify `AGENTS.md`.

## Key Decisions

- Execution role for this batch is `mixed`: the user asked the current thread
  to act as main control and continue until completion, so this thread may both
  implement and accept the final evidence. The tradeoff is acceptable because
  all work is local, foreground, and verified with deterministic checks.
- Keep the work in the current checkout and branch. The project adapter prefers
  local foreground work unless the user asks for an isolated worktree.
- Treat conditional bootstrap as complete only if current validation allows
  hooks and runtime evidence can be added. Otherwise, record a verified deferred
  boundary instead of pretending hook support exists.

## Task Routing

- Level: `execute`
- Reason: user explicitly authorized current-thread main-control execution for
  the unfinished batch.
- Required docs: `AGENTS.md`, `.harness/config.json`, `harness/README.md`,
  `harness/tasks.md`, `harness/status.md`, and this spec.
- Required gates: goal validation, smoke tests, plugin validation, hook
  boundary check, and final state sync.
- Optional competition needed: no. Scope is broad but already constrained by
  accepted tasks and existing project contracts.
- Idea Inbox input: none.
- Escalation triggers: product direction changes, platform-native localized
  metadata support requiring a new manifest contract, hook runtime support that
  would affect non-harness projects, credentials, paid APIs, production access,
  destructive operations, push, PR, deploy, publish, or release.

## Evidence Plan

- Accepted evidence:
  - source diffs for CLI, docs, skills, templates, and tests
  - `goal validate` output for this batch goal
  - `run record` evidence for completed run state
  - `npm run test:smoke`
  - `npm run validate:plugin`
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `git diff --check`
  - plugin hook validation check
- Candidate evidence sources:
  - current checkout diffs
  - smoke fixture behavior
  - plugin manifest validation output
- State records to update:
  - `harness/tasks.md`
  - `harness/status.md`
  - `.harness/runs/`

## Adapter References

- Project adapter: `harness/README.md`
- Source of truth: `harness/tasks.md`, `harness/status.md`
- Hard boundaries: no network service, persistent daemon, downstream-specific
  policy in plugin core, unapproved push/PR/deploy/publish/release, or
  activation / hook behavior without separate validation.

## Acceptance Criteria

- `goal validate` requires an `Execution Role` section and validates one of
  `gate-only`, `implementer`, or `mixed`.
- `run prepare` carries execution role into run artifacts and `status.json`.
- `run record --phase completed` refuses completion without verification
  evidence.
- `run record` refuses `gate-only` completion unless concrete gate evidence is
  supplied, while allowing blocked records without completion evidence.
- Smoke tests cover valid generated goals, invalid execution roles, completed
  run evidence, and gate-only evidence refusal.
- Public docs clearly state that project adapter artifacts in the current repo
  are source/project state, not installed plugin content.
- Plugin / skill descriptions provide a zh-CN/en bilingual fallback without
  relying on unsupported localized manifest fields.
- Agent-neutral delegation and multi-coding-agent roadmap are documented as
  protocol direction, not shipped runtime support.
- Conditional bootstrap is either implemented only with validation/runtime
  proof, or explicitly remains deferred with fresh validation evidence.
- All unfinished task-index entries are either moved to Done with evidence or
  narrowed to a concrete deferred follow-up with an unblock condition.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
git diff --check
npm run test:smoke
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-complete-open-task-batch.md
```

- Run a temporary manifest validation check with `hooks` present to verify the
  conditional bootstrap boundary.
- Review docs for project-neutrality and packaging-boundary wording.

## Pause Conditions

- This spec conflicts with code, production constraints, repo instructions, or
  newer user instructions.
- Requirements are unclear in a way that affects cost, risk, compatibility, or
  product direction.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, or release are required.
- Platform-native localized plugin metadata or hook behavior appears supported
  but requires a new product direction decision before changing the contract.
