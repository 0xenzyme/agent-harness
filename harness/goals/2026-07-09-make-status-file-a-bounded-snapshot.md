# Goal: Make Status File A Bounded Snapshot

Spec: N/A
Spec Policy: allow-no-spec
Status: Completed; delivery state `validated-local`.

Accepted scope comes from the current conversation on 2026-07-09: fix the
unbounded growth risk in `harness/status.md`. The intended rule is that the
configured status file is a bounded current-state snapshot, not an append-only
history log. Historical completion details belong in the task index, Goal
files, run logs, and gate records.

## Source Task

- `harness/tasks.md`: `Make status file a bounded snapshot.`

`harness-rule:terminology-boundary`: user-facing hierarchy is
`Roadmap -> Milestone -> Goal -> Task -> Run`. `P0` / `P1` / `P2` / `P3`
are priorities only, `M*` identifies roadmap milestones, and Runs are
execution attempts rather than threads or sessions.

## Read First

1. `AGENTS.md`
2. `harness/tasks.md`
3. `harness/README.md`
4. `.harness/config.json`
5. `harness/status.md`

## Work Mode Recommendation

Use `local`.

## Execution Role

Use `implementer`.

- `gate-only`: the current thread reviews candidate output and verification
  evidence, but does not directly edit implementation files.
- `implementer`: the current thread may edit files inside the accepted scope.
- `mixed`: the current thread may both edit and gate only after recording why
  the tradeoff is acceptable.
- `harness-rule:level-0-fast-path`: do not use Level 0 for this change because
  it changes public protocol language, templates, CLI guidance, and project
  state.

## Conversation Route

Use `current-thread`.

## Execution Context Lock

- Conversation lane: `current-thread`
- Parent controller thread: `N/A`
- Controller thread: `current-thread`
- Accepted-state owner: `current-thread`
- Execution cwd: `/Users/liuyj/project/skills/agent-harness`
- Execution branch: `main`
- Execution slot: `N/A`
- Remote-control worktree: `no`

## Delivery State

- Delivery intent: `local-validation`
- Target delivery state: `validated-local`
- Commit authorized: `no`
- Push authorized: `no`
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`

`harness-rule:local-delivery-ceiling`: `validated-local` is local verification
evidence only; it is not commit, push, review, integration, release, or ship
evidence.

## Context Focus Routing

`harness-rule:context-focus-routing`: normalize user intent to `Goal` and use
the `execute` focus preset: goal/run packet, status contract, templates,
generated prompt text, tests, delivery target, and state-sync requirements.

## Cybernetic Stability

`harness-rule:cybernetic-stability`: target the protocol gap where status file
updates can accumulate stale historical focus entries. Closeout must state the
gap closed, remaining gap, feedback quality, and whether any pause trigger
remains.

## Execution DAG

Use `run prepare` to generate the run packet. This goal is foreground
implementation by the current thread unless `run prepare` determines a larger
split is needed.

## Route Explanation

- Why this is the right next mode: the user explicitly asked to fix the
  unbounded `status.md` growth risk.
- Confirmation boundary: do not change storage schema, run log retention,
  task index history retention, activation behavior, daemons, or delivery
  above `validated-local`.

## Scope

- Define configured status files as bounded current-state snapshots.
- Update project contract, adapter docs, status template, workflow guidance,
  generated goal/run prompts, CLI docs, and smoke/protocol checks.
- Compress the repository's current `harness/status.md` to a bounded snapshot.
- Keep detailed historical evidence in `harness/tasks.md`, Goal files, and
  `.harness/runs/`.

## Non-Goals

- Do not delete Goal files, task history, run logs, or gate records.
- Do not change `.harness/config.json` schema or configured paths.
- Do not add daemons, watchers, network services, automatic cleanup jobs,
  release, publish, push, PR, or deployment behavior.
- Do not make downstream project-specific retention policies part of plugin
  core.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
node --check scripts/test-suites.mjs
node --check tests/smoke.mjs
npm run test:protocol
npm run test:smoke
npm run validate:plugin
git diff --check
```

## Evidence And State Sync

- Candidate evidence: implementation diff, bounded `harness/status.md`,
  generated prompt text, protocol docs, deterministic test output.
- Accepted evidence: capability matrix, project contract, execute skill, status
  template, adapter template, generated goal/run/worker prompts, CLI docs,
  README files, adapter docs, mental model, smoke/protocol checks, and this
  repository's `harness/status.md` now preserve bounded status snapshot
  semantics.
- State Sync Notes: update `harness/tasks.md`, bounded `harness/status.md`,
  this goal, and the prepared run packet.
- State records to update: `harness/tasks.md`, `harness/status.md`, this goal,
  and `.harness/runs/20260709-192149-make-status-file-a-bounded-snapshot/`.

## Completion Conditions

- Protocol docs state that status files are bounded current-state snapshots.
- Generated goal/run prompts tell agents to replace status snapshot sections
  rather than append historical focus logs.
- `plugins/agent-harness/templates/status.md` carries the bounded snapshot
  rule.
- Current repository `harness/status.md` is compacted to current state and
  links to durable evidence elsewhere.
- Deterministic tests protect the rule.
- Verification commands pass.
- State records are synchronized.

## Result

- Completed: Added `harness-rule:bounded-status-snapshot` to define configured
  status files as bounded current-state snapshots, not append-only history
  logs.
- Completed: Updated status template, adapter template, capability matrix,
  project contract, `harness:execute`, generated goal/run/worker prompt text,
  CLI docs, README / README.zh-CN, project adapter docs, mental model, and
  deterministic tests.
- Completed: Compacted this repository's `harness/status.md` to a short
  current-state snapshot that links to durable task, Goal, and run evidence.
- Run:
  `.harness/runs/20260709-192149-make-status-file-a-bounded-snapshot/`
- Verification: `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
  `node --check scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
  `npm run test:protocol`, `npm run test:smoke`, `npm run validate:plugin`,
  and `git diff --check`.
- Delivery: `validated-local`; no commit, push, review, integration, publish,
  release, deploy, production access, daemon, watcher, paid API, credential,
  or destructive operation was performed.

## Pause Conditions

- The rule conflicts with adapter-configured paths, state-sync obligations,
  run evidence retention, task history retention, or repository instructions.
- Requirements become broad enough to need schema migration, retention policy
  design, archival tooling, daemon/automation behavior, or product direction.
- Verification fails in a way that needs a protocol decision.
- Credentials, paid APIs, production access, destructive operations, release,
  or delivery above `validated-local` are required.
