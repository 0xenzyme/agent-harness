# Goal: Complete Open Task Batch

Spec: harness/specs/2026-06-30-complete-open-task-batch.md
Status: Ready for execution from confirmed spec.

## Source Task

- `harness/tasks.md`: merge and complete all unfinished `Next` and actionable
  `Later` tasks in the current thread.

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. `harness/README.md`
4. `harness/tasks.md`
5. `harness/status.md`
6. `harness/specs/2026-06-30-complete-open-task-batch.md`
7. `docs/project-contract.md`
8. `plugins/agent-harness/references/adapter-harness.md`
9. `plugins/agent-harness/references/task-routing.md`
10. `plugins/agent-harness/references/gate-results.md`
11. `plugins/agent-harness/references/controller-communication.md`

## Work Mode Recommendation

Use `local` because the user asked the current checkout/thread to act as main
control and the project adapter prefers foreground local work unless a worktree
is explicitly requested.

## Execution Role

Use `mixed`.

- The user asked the current thread to act as main control and keep advancing
  the unfinished task batch until completion.
- This thread may implement local files and accept the final evidence after
  deterministic verification.
- Keep evidence explicit because `mixed` combines implementation and gate
  acceptance in one thread.

## Source Task Acceptance Map

- Task: `Add execution-role and gate-evidence enforcement`
  - Acceptance: `goal validate`, `run record`, and smoke tests check
    `Execution Role` and gate evidence so `gate-only` work cannot be marked
    complete without concrete evidence.
  - Evidence: CLI validation, `run record` evidence checks, and smoke coverage
    were added.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Task: `Do a second-pass README and plugin packaging-boundary cleanup`
  - Acceptance: Move most root README CLI material into docs with only a short
    reference link; clarify package boundaries; keep homepage
    coding-agent-first.
  - Evidence: Package boundaries and coding-agent-first positioning were
    improved, but root README still contains the CLI command catalog.
  - Status: `blocked`
  - Unblocker: Move root README CLI details into docs and leave only a short
    root README reference.
- Task: `Add zh-CN/en skill suggestion localization or bilingual fallback`
  - Acceptance: Clarify platform capability and provide Chinese and English
    user-visible fallback without relying on unsupported localized metadata.
  - Evidence: Plugin and skill descriptions include zh-CN/en bilingual
    fallback text in existing metadata fields.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Task: `Generalize execute delegation across coding agents`
  - Acceptance: Define an agent-neutral delegation surface with capability
    detection, safe fallback, context isolation, evidence return contracts, and
    control-lane gate acceptance.
  - Evidence: Project contract and references document capability-driven
    delegation, result packets, and foreground fallback.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Task: `Define multi coding-agent support roadmap`
  - Acceptance: Define the agent-neutral adapter layer, capability
    declarations, result packet contract, safety boundaries, validation
    fixtures, and rollout gates before claiming support for another coding
    agent.
  - Evidence: README roadmap and project contract describe agent-neutral
    adapter direction without claiming runtime support.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Task: `Revisit conditional Agent Harness bootstrap after hook validation support`
  - Acceptance: Add conditional `SessionStart` bootstrap only if hook manifests
    and runtime tests prove non-harness projects receive no injected context.
  - Evidence: Temporary hook-manifest validation still rejects `hooks`, so the
    plugin remains hook-free with a deferred boundary.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Scope

- Implement the accepted spec for the unfinished task batch.
- Keep changes scoped to Agent Harness CLI validation, smoke tests, public docs,
  workflow skills, plugin metadata, templates, task/status state, and run
  evidence.
- Treat conditional bootstrap as complete only when supported by current
  validation/runtime evidence; otherwise record a verified deferred boundary.

## Non-Goals

- Do not push, deploy, publish, release, open a PR, start a daemon, or launch
  background sessions.
- Do not modify `AGENTS.md`.
- Do not add network services, persistent workers, credentials, paid APIs, or
  production behavior.
- Do not claim support for non-Codex coding agents beyond documented protocol
  direction and validation boundaries.

## Context

- User request: merge current unfinished tasks and use the current thread as
  main control to advance them until complete.
- Existing checkout is dirty with prior Agent Harness documentation and
  execution-role changes. Work with those changes; do not revert them.

## Project Adapter Requirements

- Preflight: Read `AGENTS.md` before editing repository files.
- State sync: Update `harness/tasks.md` after meaningful task state changes.
- State sync: Update `harness/status.md` after execution or verification.
- Validate plugin changes with `npm run validate:plugin`.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
git diff --check
npm run test:smoke
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-complete-open-task-batch.md
```

Also run a temporary hook-manifest validation check and record whether
conditional bootstrap remains deferred.

## Completion Conditions

- The source task batch acceptance is satisfied.
- All required verification commands pass, or any failure is documented with a
  concrete blocker and next step.
- `harness/tasks.md`, `harness/status.md`, and run evidence are updated.
- Any remaining work is explicitly deferred with an unblock condition rather
  than left as an ambiguous unfinished task.

## Pause Conditions

- The referenced spec conflicts with code, production constraints, repo
  instructions, or newer user instructions.
- The work requires credentials, paid APIs, production access, destructive
  commands, push, PR, deploy, publish, or release.
- Product direction, platform-native localization behavior, hook support, or
  worktree policy is unclear in a way that changes the contract.
- User gives new instructions that conflict with this goal.
