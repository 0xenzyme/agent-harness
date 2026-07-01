# Goal: Agent Harness Docs Engineering Audit

Spec: harness/specs/2026-07-01-docs-engineering-audit.md
Status: Ready for execution from confirmed spec.

## Source Task

- `harness/tasks.md`: `P2 最近做了很多改动，想用 harness 做一次文档工程：审计并同步 Agent Harness 最近交付后的 README、CLI docs、project...`

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. `harness/README.md`
4. `harness/tasks.md`
5. `harness/status.md`
6. `harness/specs/2026-07-01-docs-engineering-audit.md`
7. `README.md`
8. `README.zh-CN.md`
9. `docs/cli.md`
10. `docs/cli.zh-CN.md`
11. `docs/install.md`
12. `docs/project-contract.md`
13. `plugins/agent-harness/README.md`
14. `plugins/agent-harness/skills/`
15. `plugins/agent-harness/references/`
16. `plugins/agent-harness/templates/`
17. `tests/smoke.mjs`

## Work Mode Recommendation

Use `local`.

The repository is on branch `main`, the checkout was clean before this task was
recorded, and the adapter defaults to the current checkout unless the user asks
for a worktree.

## Execution Role

Use `gate-only`.

- The current thread is the main control / acceptance lane.
- The current thread may create and update harness control artifacts, inspect
  worker output, run verification, and record acceptance evidence.
- The current thread must not directly perform implementation edits to the
  scoped documentation surfaces.
- A worker owns documentation implementation edits and must return changed
  files, summary, verification, known risks, and deferred work.

## Conversation Route

Use `current-thread`.

- The current conversation owns the control lane in the locked cwd.
- Worker execution is dispatched from the run packet; worker output is
  candidate evidence until the control lane accepts it.
- Do not fork unless the controller explicitly approves inherited context.

## Execution Context Lock

- Conversation lane: `current-thread-main-control`
- Controller thread: `current-thread`
- Execution cwd: `/Users/liuyj/project/skills/agent-harness`
- Execution branch: `main`
- Execution slot: `worker-subagent`
- Remote-control worktree: `no`

## Delivery State

- Delivery intent: `validated-local-docs-audit`
- Target delivery state: `validated-local`
- Commit authorized: `no`
- Push authorized: `no`
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`

This docs audit stops at validated local changes and harness evidence. Commit,
push, review, integration, publish, and release remain out of scope unless the
user gives a new explicit instruction.

## Execution DAG

Use `run prepare` to generate `dag.json`, `dag.md`, and per-node
`agents/<node>/prompt.md` files. Prefer a Codex worker subagent for
implementation nodes. The control lane records node results before completing
the run.

## Route Explanation

- Why this is the right next mode: the user accepted the harness route, asked
  to switch back to `main`, and asked the current thread to act as main
  control while completing a bounded documentation engineering task.
- Confirmation boundary: pause before behavior changes, schema changes, skill
  activation changes, release/publish steps, credentials, paid APIs,
  production access, destructive operations, daemons, watchers, background
  sessions, PRs, push, or commit.

## Spec Acceptance Checklist

- Item: `Current protocol terminology`
  - Acceptance: Docs do not present stale `PR-open` / `merged` as primary
    states, old local-only delivery ceilings, or old worker-surface defaults.
  - Evidence: `docs/cli.md`, `docs/cli.zh-CN.md`,
    `plugins/agent-harness/references/task-routing.md`,
    `plugins/agent-harness/references/controller-communication.md`,
    `plugins/agent-harness/skills/execute/references/completion-evidence.md`,
    and controller `rg` review show `review-open` / `integrated` as primary
    delivery terms; remaining `PR-open` / `merged` mentions are compatibility
    aliases or source-task batching language.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Workflow-controller entry path`
  - Acceptance: Public and plugin docs consistently describe
    `harness:init`, `harness:orient`, `harness:intake`, and
    `harness:execute` as the primary user workflow.
  - Evidence: `README.md`, `README.zh-CN.md`, and `docs/install.md` now
    describe the four workflow skills as the primary workflow-controller entry
    path and route setup, orient, intake, and execute use cases consistently.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Gate-only and subagent execution`
  - Acceptance: Docs consistently explain that a main control / gate-only lane
    reviews worker output and that default worker dispatch uses
    `codex-cli-subagent` when a run packet requires implementation.
  - Evidence: `README.md`, `README.zh-CN.md`, `docs/install.md`,
    `plugins/agent-harness/references/adapter-harness.md`,
    `plugins/agent-harness/references/task-routing.md`,
    `plugins/agent-harness/skills/execute/SKILL.md`, and
    `plugins/agent-harness/templates/goal.md` document gate-only review and
    `codex-cli-subagent` worker defaults.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Acceptance and evidence gates`
  - Acceptance: Docs consistently distinguish candidate evidence from
    accepted completion and describe checklist / required gate evidence for
    completed run records.
  - Evidence: `README.md`, `README.zh-CN.md`, `docs/install.md`,
    `plugins/agent-harness/references/controller-communication.md`,
    `plugins/agent-harness/skills/execute/references/completion-evidence.md`,
    and `plugins/agent-harness/templates/goal.md` document candidate evidence,
    `Spec Acceptance Checklist`, and `Required Gate Evidence` requirements.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Verification guidance`
  - Acceptance: Documentation changes are backed by the configured validation
    commands, and any touched eval docs are covered by `npm run test:eval`.
  - Evidence: Verification node
    `.harness/runs/20260701-120641-agent-harness-docs-engineering-audit/agents/verification/result.md`
    records passing `git diff --check`, `npm run test:smoke`,
    `npm run validate:plugin`, goal validation, and run status inspection;
    `npm run test:eval` was skipped because eval docs and fixtures were not
    changed.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Required Gate Evidence

- Gate: `controller-acceptance`
  - Required: `yes`
  - Evidence: Controller reviewed and recorded explorer, CLI/contract,
    docs/skill, and verification node results under
    `.harness/runs/20260701-120641-agent-harness-docs-engineering-audit/agents/`;
    reviewed implementation diffs for owned files; confirmed no commit, push,
    review, integration, publish, or release step was taken; and accepted the
    local documentation changes against this goal.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Scope

- Audit and update the documentation surfaces listed in the spec when they are
  stale or inconsistent with current Agent Harness protocol.
- Keep changes documentation-only unless a narrow smoke-doc guard is needed to
  prevent the same inconsistency from returning.
- Preserve project-neutral plugin core language and adapter-owned local facts.
- Update harness task/status/run evidence after accepted worker output.

## Non-Goals

- Do not change runtime behavior, CLI semantics, schemas, package metadata, or
  skill activation behavior unless a narrow documentation guard is required.
- Do not modify `AGENTS.md`.
- Do not add downstream project-specific facts to plugin core docs.
- Do not commit, push, open a PR, deploy, publish, release, start a daemon,
  launch a watcher, create a network service, use credentials, use paid APIs,
  touch production data, or perform destructive operations.

## Verification

```bash
git diff --check
npm run test:smoke
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-07-01-agent-harness-docs-engineering-audit.md
```

Run `npm run test:eval` if eval docs or eval fixtures change.

## Evidence And State Sync

- Candidate evidence: worker result packet, implementation diff, worker
  self-checks, and changed-file list.
- Accepted evidence: controller review against every checklist item, passing
  verification commands, recorded node result, and completed run record.
- State records to update: `harness/tasks.md`, `harness/status.md`, and run
  artifacts under `.harness/runs/`.

## Completion Conditions

- The docs audit is complete across the scoped surfaces.
- Any stale or inconsistent documentation found by the audit is corrected.
- Every `Spec Acceptance Checklist` item is `satisfied` with concrete
  evidence.
- `Required Gate Evidence` is `satisfied` with controller acceptance evidence.
- Verification commands pass or a blocked run records the exact blocker.
- `harness/tasks.md`, `harness/status.md`, and run evidence are synchronized.

## Pause Conditions

- The goal conflicts with the spec, adapter, repo instructions, production
  constraints, or newer user instructions.
- Requirements or product direction are unclear in a way that affects cost,
  risk, compatibility, or public contract semantics.
- The task expands into runtime behavior, public CLI semantics, schema changes,
  activation behavior, packaging changes, release policy, or project direction.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  commit, deploy, publish, release, daemons, watchers, network services,
  background sessions, or automations become necessary.
