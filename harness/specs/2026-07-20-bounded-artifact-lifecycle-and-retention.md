# Bounded Artifact Lifecycle And Retention

Status: Accepted from the current user instruction.
Created: 2026-07-20

## Problem

Long-running Harness projects accumulate three different kinds of state without
an enforceable lifecycle:

- `status.md` drifts from a bounded current snapshot into an append-only log;
- `tasks.md` retains completed work in active sections and becomes an archive;
- `.harness/runs/` grows indefinitely, even when Git tracking is later removed.

The wiki adapter demonstrates all three failure modes: its run directory is
Git-ignored but still contains thousands of local files, its active task index
is dominated by completed work, and its current status includes historical
snapshots and stale focus. Tracked documents also refer to local-only Run paths
as if those paths were durable evidence.

## Objective

Add a project-neutral artifact lifecycle contract and deterministic CLI support
that keeps current control state bounded, makes local Run retention inspectable
and safely prunable, and prevents local-only Run paths from becoming the only
durable evidence. Agent Harness core is the primary product target.

## Contract

### Status

- `status.md` is a replace-in-place current snapshot.
- Historical focus, verification transcripts, and superseded snapshots belong
  in Goal, milestone, archive, owning-domain, or Run artifacts.
- Configurable advisory line limits make unbounded snapshots mechanically
  visible without rejecting valid project-specific formats.

### Task Index

- Active sections contain actionable work only.
- Completed/cancelled work may retain a bounded recent window; older records
  move to a configured archive file.
- Checkbox, section, and explicit `Status` must agree. Doctor/artifact audit
  reports contradictions and duplicate lifecycle sections.
- Compaction is explicit and non-destructive: archived records are written
  before the active index is replaced.

### Runs

- Projects may declare Runs `tracked` or `local-only`.
- Local-only Runs remain recoverable only while present locally unless durable
  conclusions are synchronized elsewhere.
- Audit reports file count, byte size, terminal/active/unknown Runs, retention
  candidates, and tracked documents that reference local-only Run paths.
- Prune defaults to dry-run. Actual deletion requires an explicit apply flag,
  stays inside the configured Runs root, skips non-terminal Runs, and refuses
  candidates whose durable-evidence requirement cannot be established.

### Durable Evidence

- A tracked artifact may record a local Run id/path as a locator, but must also
  preserve the accepted conclusion, verification summary, and durable audit
  reference required after local deletion.
- Historical tracked Runs remain retrievable from Git history, but that is not
  assumed for future local-only Runs.

## CLI

Add deterministic commands:

```bash
agent-harness artifacts inspect --cwd <project> [--json]
agent-harness artifacts compact --cwd <project> [--record] [--json]
agent-harness artifacts prune --cwd <project> [--apply] [--json]
```

- `inspect` is read-only.
- `compact` previews by default and, with `--record`, archives eligible task
  records before rewriting the bounded active index. It reports status limits
  but does not attempt semantic status rewriting.
- `prune` previews by default. `--apply` deletes only eligible terminal Runs
  after all safety checks pass.

## Configuration

Support a top-level `artifactPolicy` with project-neutral settings for:

- Run tracking and retention;
- durable evidence paths;
- status advisory line limit;
- task archive path and recent completed-task retention.

Defaults preserve existing projects: no automatic writes or deletion, tracked
Run behavior remains compatible when policy is absent, and limits are advisory.

## Downstream Compatibility Sample

- The earlier wiki migration may remain as compatibility evidence, as clarified
  by the user after execution began, but no further wiki work is required.
- Do not revert the already completed wiki changes and do not delete its Runs
  or alter its product code.

## Non-Goals

- No daemon, watcher, scheduled cleanup, network service, or background job.
- No automatic semantic rewrite of arbitrary status prose.
- No deletion of wiki local Runs in this Goal.
- No commit, push, PR, release, deploy, production access, or credentials.
- No project-specific wiki assumptions in plugin core.

## Verification

- Schema accepts the canonical artifact policy and rejects invalid values.
- Smoke tests cover inspect, compact preview/record, prune preview/apply,
  containment, active-Run preservation, and durable-evidence refusal.
- Existing fixed and adapter contracts remain compatible.
- `npm run test:all`, `npm run test:eval`, `npm run validate:plugin`, syntax
  checks, and `git diff --check` pass.
- Agent Harness config validation, artifact inspection, orientation, and
  bounded-file checks pass without deleting Runs.

## Completion Conditions

- Core schema, CLI, templates, skills/references, public docs, and tests agree
  on the lifecycle contract.
- Agent Harness dogfood state uses the bounded task/status policy and preserves
  displaced history in a tracked archive.
- The durable Run records accepted execution, integration verification, actual
  Delivery State, and state sync.

## Pause Conditions

- A repository rule, newer user instruction, or existing accepted spec
  conflicts with this contract.
- Safe compaction cannot preserve exact task records before rewriting.
- Pruning would require guessing whether evidence is durable or deleting an
  active/non-terminal Run.
- Credentials, production access, paid APIs, destructive wiki cleanup, commit,
  push, release, deploy, or product-direction judgment becomes necessary.
