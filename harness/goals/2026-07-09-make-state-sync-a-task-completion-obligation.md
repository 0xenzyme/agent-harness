# Goal: Make State Sync A Task Completion Obligation

Spec: N/A
Spec Policy: allow-no-spec
Status: Completed; delivery state `validated-local`.

Accepted scope comes from the current conversation on 2026-07-09: optimize the
Harness protocol so updating task state is treated as part of task completion,
while preserving the accepted-state owner boundary. The intended rule is:
every executable task must produce state-sync evidence or notes as part of
Done; only the authorized accepted-state owner may write accepted
task/status/goal/run/gate state.

## Source Task

- `harness/tasks.md`: `Make state sync a task completion obligation.`

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
  it changes public protocol language, templates, and deterministic checks.

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
the `execute` focus preset: goal/run packet, allowed and forbidden scope,
implementation-relevant protocol docs, templates, generated prompts,
verification commands, delivery target, and state-sync requirements.

## Cybernetic Stability

`harness-rule:cybernetic-stability`: target the protocol gap where task
completion currently requires accepted state-sync evidence but does not clearly
state that task executors must produce state-sync notes as part of task Done.
Closeout must state what gap was closed, remaining gap, feedback quality, and
whether any pause trigger remains.

## Execution DAG

Use `run prepare` to generate the run packet. This goal is foreground
implementation by the current thread unless `run prepare` determines a larger
split is needed.

## Route Explanation

- Why this is the right next mode: the user explicitly asked to fix the
  protocol after discussing the desired abstraction.
- Confirmation boundary: do not change worker accepted-state write authority,
  activation behavior, storage schema, daemons, or delivery above
  `validated-local`.

## Scope

- Clarify `harness-rule:state-sync-evidence` so task completion includes
  state-sync evidence or state-sync notes from the executing lane.
- Preserve role separation: execution workers return candidate evidence and
  state-sync notes; accepted-state owners write accepted state after review.
- Update worker contracts, controller communication, gate/completion
  references, templates, generated run/worker prompts, and deterministic tests
  that protect this language.
- Update project state records after verification.

## Non-Goals

- Do not let ordinary execution workers directly update accepted
  task/status/goal/run/gate state.
- Do not change the `.harness/config.json` schema or storage paths.
- Do not add daemons, watchers, network services, automatic worker launching,
  release, publish, push, PR, or deployment behavior.
- Do not make project-specific downstream policy part of plugin core.

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

- Candidate evidence: implementation diff, generated prompt text, protocol
  docs, deterministic test output.
- Accepted evidence: README / README.zh-CN, capability matrix, project
  contract, execute guidance, completion/gate/controller/worker references,
  goal and worker templates, generated prompt text, and smoke assertions now
  require `State Sync Notes` as part of task Done while preserving
  accepted-state owner authority.
- State records to update: `harness/tasks.md`, `harness/status.md`, this goal,
  and `.harness/runs/20260709-184137-make-state-sync-a-task-completion-obligation/`.

## Completion Conditions

- Protocol docs state that task completion includes state-sync evidence or
  state-sync notes.
- Worker docs/templates/generated prompts require `State Sync Notes` while
  preserving that execution-worker output is candidate evidence only.
- Controller/gate/completion docs require the accepted-state owner to verify
  state-sync evidence before marking task, goal, run, or gate complete.
- Deterministic tests protect the new wording.
- Verification commands pass.
- State records are synchronized.

## Result

- Completed: Clarified `harness-rule:state-sync-evidence` so task completion
  includes state-sync evidence or `State Sync Notes` from the executing lane.
- Completed: Preserved role separation: execution workers return candidate
  `State Sync Notes`; the accepted-state owner verifies and writes accepted
  task/status/goal/run/gate state.
- Completed: Updated README / README.zh-CN, `docs/HARNESSES.md`,
  `docs/project-contract.md`, `harness:execute`, completion evidence, gate
  results, controller communication, worker runner contract, goal and worker
  templates, generated run / worker prompt text, and smoke assertions.
- Run:
  `.harness/runs/20260709-184137-make-state-sync-a-task-completion-obligation/`
- Verification: `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
  `node --check scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
  `npm run test:protocol`, `npm run test:smoke`, `npm run validate:plugin`,
  and `git diff --check`.
- Delivery: `validated-local`; no commit, push, review, integration, publish,
  release, deploy, production access, daemon, watcher, paid API, credential,
  or destructive operation was performed.

## Pause Conditions

- The new rule conflicts with accepted-state owner boundaries, worker
  candidate-evidence boundaries, adapter contract behavior, or repository
  instructions.
- Requirements become broad enough to require a separate spec, schema
  migration, storage redesign, daemon, automation, or product direction choice.
- Verification fails in a way that needs a product or protocol decision.
- Credentials, paid APIs, production access, destructive operations, release,
  or delivery above `validated-local` are required.
