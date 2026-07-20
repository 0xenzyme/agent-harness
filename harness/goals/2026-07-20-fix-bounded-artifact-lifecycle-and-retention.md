# Goal: Fix Bounded Artifact Lifecycle And Retention.

Spec: `harness/specs/2026-07-20-bounded-artifact-lifecycle-and-retention.md`
Status: Completed at `validated-local`.

## Source Task

- `harness/tasks.md`: `P0 Fix bounded artifact lifecycle and retention.`

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. `harness/README.md`
4. `harness/specs/2026-07-20-bounded-artifact-lifecycle-and-retention.md`
5. `harness/status.md`
6. Current Agent Harness task/status/archive and Run policy.

## Work Mode Recommendation

Use `local` in the current checkout and current branch as required by repository
instructions and the user's controller direction.

## Execution Role

Use `implementer`. The current thread is controller, outcome owner, and
accepted-state owner; it may edit inside accepted scope.

## Codex-Native Execution

- Runtime Goal: established for this long-running controller outcome.
- Codex Plan: owns transient implementation and verification progress.
- Repository Goal/Run: owns durable recovery, evidence, gates, and state sync.
- Runtime execution remains in the current thread; no worker delegation is
  required by the accepted scope.

## Conversation Route

Use `current-thread`.

## Execution Context Lock

- Conversation lane: `current-thread`
- Controller thread: `current-thread`
- Accepted-state owner: `current-thread`
- Execution cwd: `/Users/liuyj/project/skills/agent-harness`
- Execution branch: `main`
- Execution slot: `N/A`
- Remote-control worktree: `no`
- Downstream compatibility sample: the already completed wiki migration; no
  further wiki edits required by the user's newer instruction.

## Delivery State

- Delivery intent: `local-commit-and-plugin-refresh`
- Target delivery state: `committed`
- Commit authorized: `yes`
- Push authorized: `no`
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`

## Durable Control Invariants

- `harness-rule:path-containment`
- `harness-rule:run-dag-ownership`
- `harness-rule:candidate-accepted-evidence`
- `harness-rule:local-delivery-ceiling`
- `harness-rule:run-scoped-delivery`
- `harness-rule:state-sync-evidence`
- `harness-rule:bounded-status-snapshot`
- `harness-rule:project-neutral-core`
- `harness-rule:durable-tier-boundary`

## Spec Acceptance Checklist

- Item: `Project-neutral artifact policy`
  - Acceptance: Schema and resolved config support bounded status/task policy,
    tracked/local-only Runs, retention, and durable evidence paths.
  - Evidence: `artifactPolicy` schema/templates and resolved defaults cover
    tracked/local-only Runs, retention, status limits, task archive, recent-Done
    retention, and durable evidence paths.
  - Status: `satisfied`
- Item: `Deterministic lifecycle CLI`
  - Acceptance: Inspect is read-only; compact archives before rewriting; prune
    defaults to preview and applies only safe terminal candidates.
  - Evidence: `artifacts inspect|compact|prune` implement read-only defaults,
    archive-first `--record`, explicit `--apply`, configured-root containment,
    active/unknown preservation, keepLatest/age gates, and non-empty durable
    State Sync Notes checks.
  - Status: `satisfied`
- Item: `Protocol and documentation alignment`
  - Acceptance: Templates, execute/orient guidance, references, README/CLI docs,
    and tests describe the same lifecycle boundary.
  - Evidence: Canonical artifact-lifecycle reference, execute/orient skills,
    config/adapter/task templates, bilingual CLI docs, project contract,
    READMEs, protocol checks, and smoke tests are aligned.
  - Status: `satisfied`
- Item: `Core dogfood state sync`
  - Acceptance: Agent Harness config validates and its active task/status files
    remain bounded while exact displaced task blocks are archived.
  - Evidence: `harness/tasks.md` fell from 1,059 to 254 lines; 55 exact terminal
    task blocks moved to `harness/tasks-archive.md`; final inspection reports
    zero active tasks, ten recent Done tasks, zero lifecycle issues, bounded
    status, and no prune deletion.
  - Status: `satisfied`

## Required Gate Evidence

- Gate: `spec`
  - Required: `yes`
  - Evidence: Accepted lifecycle spec above.
  - Status: `satisfied`
- Gate: `execution`
  - Required: `yes`
  - Evidence: Core schema, CLI, task-state normalization, templates, references,
    docs, tests, and dogfood state sync implement the accepted scope.
  - Status: `satisfied`
- Gate: `integration`
  - Required: `yes`
  - Evidence: Syntax checks, `npm run test:all`, `npm run test:eval`,
    `npm run validate:plugin`, four skill validators, config/Goal validation,
    lifecycle preview checks, and `git diff --check` pass together.
  - Status: `satisfied`

## Scope

- Implement the accepted core schema, CLI, templates, references, docs, and
  tests.
- Apply the lifecycle policy to Agent Harness's own task/status/Run surfaces.
- Record Run/DAG evidence and bounded repository state sync.

## Non-Goals

- Do not delete wiki Runs, alter wiki product code, or exceed local validation.
- Do not push, create a Git tag or GitHub Release, publish remotely, access
  production, or use credentials.

## Verification

Passed:

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
node --check tests/smoke.mjs
node --check scripts/test-suites.mjs
npm run test:all
npm run test:eval
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs config validate --cwd . --json
node plugins/agent-harness/scripts/agent-harness.mjs artifacts inspect --cwd . --json
node plugins/agent-harness/scripts/agent-harness.mjs artifacts compact --cwd . --json
node plugins/agent-harness/scripts/agent-harness.mjs artifacts prune --cwd . --json
git diff --check
```

All four plugin skills passed `quick_validate.py` using the repository YAML
shim. Smoke coverage includes missing-policy compatibility, schema rejection,
inspect read-only behavior, archive-first compaction, tracked-policy refusal,
preview-only pruning, active/unknown preservation, durable-evidence refusal,
configured Goals-root containment, and eligible terminal deletion in a temp
project.

## State Sync Notes

- `.harness/config.json` declares the core `local-only` Run policy, 30-day
  terminal retention, latest-20 protection, 160-line status limit, and
  ten-recent-Done task window.
- `harness/tasks.md` is the bounded active index; 54 exact historical records
  are preserved in `harness/tasks-archive.md`.
- `harness/status.md` is replaced with the accepted current result.
- Run `.harness/runs/20260720-105524-fix-bounded-artifact-lifecycle-and-retention`
  records execution and verification evidence.
- Final lifecycle inspection reported 64/160 status lines, zero active tasks,
  ten recent Done tasks, zero lifecycle issues, and zero remaining compaction
  candidates. Prune preview reported zero candidates/deletions. Existing
  tracked references to local-only Runs remain
  visible as an audit warning rather than being silently discarded.
- Delivery State is `validated-local`; the user authorized a local commit and
  local plugin-cache refresh after the release gate. Push, review, integration,
  Git tag, GitHub Release, remote publish, production access, credential use,
  paid API, and Run deletion remain unauthorized.

## Completion Conditions

- All checklist items and required gates are satisfied with fresh evidence.
- Core state sync is bounded and verified.
- Delivery State remains truthful and no unauthorized destructive action occurs.

## Pause Conditions

- Accepted scope conflicts with repository facts or newer instructions.
- Exact task archival cannot be proven before active-index replacement.
- Destructive wiki cleanup or an unauthorized delivery step is required.
- Credentials, paid APIs, production access, or external services are required.
- Product direction or a cost/risk boundary requires user judgment.
- Evidence cannot validate the full Agent Harness core objective.
