# Agent Harness Project Contract

Agent Harness is the durable project control plane around a coding-agent host.
It preserves configured artifact roots, repository Goals/Runs/DAGs,
candidate-versus-accepted evidence, controller gates, authoritative completion
state, and state sync.
The host owns ordinary execution, delegation, concurrency, cancellation,
and model/effort selection when those capabilities are exposed.

Runtime outcome owns the current long-running result; transient plan owns
short-lived steps. Harness does not mirror every plan transition. It records
project facts at durable boundaries or in one bounded postflight closeout.

## Adapter Contract

- `fixed`: `harness/tasks.md`, `.harness/config.json`, `harness/status.md`,
  `harness/goals/`, and `.harness/runs/`.
- `adapter`: `.harness/config.json` plus adapter-declared Goal index, optional
  idea inbox, status, specs, goals, milestones, runs, gate records, and
  deferred-register paths.

Fixed-contract Spec references remain project-local unless `paths.specs` is
explicitly configured. The optional Milestone root defaults to
`harness/milestones/`; fixed `init` does not gain a required directory.

All configured writes and Goal/Spec/Run/DAG references must stay inside their
configured project roots after lexical and existing-parent realpath checks.
Legacy aliases remain readable for one migration boundary, canonical output
writes current fields, and conflicts fail.

## Routing

The three execution paths are `host-direct`, `host-direct-postflight`, and
`durable-harness`. Ordinary clear questions, reviews, changes, and builds use
the current host directly without lifecycle artifacts. Simple completed work
linked to state that already existed may use bounded postflight sync. Use durable
`harness:execute` for recovery, audit, persistent state sync, milestone
acceptance, Run/DAG, multiple workers, or high-risk control.
`harness:orient`, `harness:intake`, and `harness:init` cover read-only
state, unaccepted capture, and setup respectively. Shaping and asking are
ordinary actions; proposal competition is explicit and advanced.

Controller means outcome owner and accepted-state owner. It may implement
foreground work; only explicit `gate-only` or review-only direction makes it
non-editing. Durable execution roles remain `gate-only` and `implementer`. Workers return
candidate evidence; the accepted-state owner alone records accepted Goal,
Task, Run, gate, and status state.

Before session creation, handoff, or worker delegation, durable execution
resolves work mode from current user direction, repository instructions,
accepted Spec/Goal state, and config. An unresolved `ask` result or conflict
pauses before the host call; session authority alone does not authorize a
worktree or host-specific starting checkout state.

## Completion And Run Evidence

An accepted one-entry Goal or Milestone can reference a versioned adjacent
`<target-filename>.plan.json` through `Execution Plan:`. The
[planned execution reference](../plugins/agent-harness/references/planned-execution.md)
defines version 1 plan and receipt fields. Validation enforces configured-root
containment. Every Goal in a Milestone plan references the Milestone-adjacent
plan; only a standalone Goal references its own adjacent plan. The validator checks
complete acceptance/gate mapping, unique Goal and Task IDs,
existing dependencies, and acyclic Goal and Task graphs. Goal dependencies
gate per-Goal Run preparation; Task dependencies compile into the planned Run
DAG. Planned Runs use manifest v2 and enforced checkpoints. Existing manifest
v1 and unplanned Runs retain legacy behavior and are not rebound.
If a Milestone Goal List contains concrete Doc rows, the plan must cover
exactly those Goal paths. Its target contract hash binds declarative row
fields while excluding mutable Status cells.

The controller repeats target-scoped `execute next` until whole-target `done`.
An active Milestone keeps its listed Goals in that target scope. A missing
Milestone plan is a `replan` action for the Milestone, not authorization to
switch to standalone Goal execution. Standalone `execute next --goal` and
`run prepare --goal` require `--goal-slice` for a Goal listed in an active
Milestone; use it only when the user explicitly selects the narrower target.
Its stable fields are `action`, `target`, `goal`, `run`, `node`, `reason`,
`checkpointRevision`, `requiredEvidence`, and `needUser`. `target` is a
`{kind, path}` object; `goal`, `run`, `node`, and `reason` are strings;
`checkpointRevision` is an integer or null; `requiredEvidence` is an array;
`needUser` is a string or null. It may return
`execute-node`, `wait`, `review-node`, `verify-node`, `sync`, `prepare-run`,
`complete-goal`, `complete-milestone`, `reconcile`, `replan`, `need-user`,
or `done`. `reconcile` with `needUser: null` denotes a non-user blocker;
`need-user` identifies a concrete decision. `complete-milestone` supplies
the anchor Run and its checkpoint revision; completion must pass that expected
revision and advances the anchor checkpoint. A completed leaf does not imply
parent completion. The read-only target-scoped `orient next` shares this
selection. No scheduler is part of this contract.

Planned node starts/blocks, reviews, sync and Goal completion require the
current checkpoint revision. A worker result is a candidate receipt; the
controller checks actual node validation logs inside that node's bound Run,
check timestamps at or after manifest creation, and content hashes of current
verification inputs before accepting it. Only accepted nodes release
dependents. Failed verification can request bounded repair; three identical
failures without progress block that item while other ready nodes continue.
Task source write scope cannot include authoritative Harness artifacts.
For a delegated node recorded as running, the candidate's optional
`executor.thread` must match its recorded worker identity.
Input snapshots exclude configured control artifacts, including Specs,
config, sync journal, and project lock. A source-root `.` input omits those
controls so state sync cannot invalidate its own verification hash.
For a single-Goal plan, any root verification check must be identical to a
check assigned to that Goal's Task; Milestone root verification is mandatory.
The controller runs necessary checks and saves actual logs; the CLI validates
recorded evidence. Milestone completion synchronizes `Current Status` and
`Goal List`, records `Completion Evidence Hash`, and advances the anchor Run's
checkpoint revision.
Stage validation logs stay inside the Milestone anchor Run. Stage checks must
be observed at or after the latest required Goal Run completion time
(`completedAt`, with a legacy `updatedAt` fallback). A Goal already marked
`blocked` cannot be prepared, executed, or completed until it is recovered;
target-scoped routing returns `reconcile` for that Goal.
Ready human Tasks with all mapped items already `satisfied` and backed by
concrete Evidence route to `verify-node`; the controller records the existing
accepted decision in receipt `humanDecision`. Missing approval routes to
`need-user` with a concrete question. Three identical verification failures
without progress produce `reconcile` with a reason naming the attempt count
and failure summary and the review receipt in `requiredEvidence`.
Unknown worker liveness is inspected through the host before retry.
An explicitly blocked root Milestone prevents Run preparation and Task starts
until accepted recovery clears it. A completed Run with an active Goal routes
to Goal closeout rather than preparing another Run. Planned Goals use explicit
map labels; legacy batch and M-number phasing heuristics apply to unplanned work.
Plan validation also validates each Goal contract, including adapter gates.
Completion rejects pending requirements, placeholders, stale evidence,
incomplete dependencies, and unfinished project sync. Interrupted multi-file
sync resumes under lock before new implementation and detects intervening
user edits instead of overwriting them.
Repeated successful closeout is idempotent and keeps the checkpoint revision.
Status projects the current target; later accepted work may replace that
bounded projection without reopening historical completed Goals or Milestones.

Task/Goal is the accepted-state authority and uses `active`, `completed`, or
`blocked`. `blocked` is resumable and non-complete. A Run records DAG
dependencies, ready nodes, ownership, verification, gates, and candidate or
accepted evidence. The configured status file is a bounded projection and does
not define completion.

Completion requires accepted scope, fresh verification, required durable
gates, and synchronized authoritative state. External side effects still need
fresh authority, but they do not form a Harness completion-state ladder.

## Configuration

Canonical behavior fields include adapter/configured paths (an adapter may
declare `paths.ideaInbox` for unaccepted intake candidates),
`worktree.defaultPolicy`, `checkpoint.defaultPolicy`, optional finite
`checkpoint.stages` and `checkpoint.adapterDimensions`,
`gates.requiredForCompletion`, `gates.blocking`, `language.default`, and
`communication.commentary`.
These configured gates apply to durable Goal/Run completion. They do not apply
to `host-direct` or postflight-only synchronization, and postflight cannot
bypass an existing enforced Run.
Legacy `mode`, `paths.tasks`, `paths.mentalModel`, `workMode.defaultPolicy`, and
`gates.enabled` remain readable at the migration boundary. `loops`, `lifecycle`,
`gates.optional`, and worktree auto-rules do not drive current behavior and are
not emitted by canonical templates.

## Adapter Language Policy

`language.default` is `auto`, `en`, or `zh-CN`. CLI selection is `--lang`,
`AGENT_HARNESS_LANG`, `language.default`, `LC_ALL`, `LC_MESSAGES`, then
`LANG`; unresolved `auto` falls back to English. This localizes supported
CLI messages only. Deterministic artifacts from `init`, `goal create`, and
`run prepare` stay on English templates. Command details live in the
[CLI language section](cli.md#language).

## Commentary Policy

`communication.commentary` is `minimal`, `balanced`, or `audit`; omitted
config defaults to `minimal`. The policy shapes Harness skill and generated
Run guidance. It does not filter host messages or override host-required
tool, safety, approval, or heartbeat updates.

## State Sync

Durable completion includes verified State Sync Notes. The Goal index records
actionable work plus a bounded recent-Done window; status is a bounded current
snapshot; task archives, Goals, milestones, and owning-domain documents retain
durable conclusions. Runs retain detailed execution evidence according to
`artifactPolicy`. Plugin core stays project-neutral and the adapter owns
downstream facts.

Artifact lifecycle commands are deterministic and dry-run-first. Inspection is
read-only, task compaction requires `--record` and archives before replacement,
and Run deletion requires `prune --apply`, `local-only` policy, terminal state,
expired retention, containment, and durable State Sync Notes.

Prepared Runs include a manifest that binds the Goal/Spec execution contract and
DAG shape at preparation time. Node and Run mutation is lock-protected and
atomically written. Status-only legacy Run directories remain inspectable but
are `unmanaged`: they cannot drive automatic Task completion or pruning.
Completed Run evidence must reference the exact Run path from the Goal, and a
blocked Goal is never a completed Run.

Goals persist a resolved `Checkpoint Policy: disabled|enforced`; omission on
legacy Goals resolves to `disabled`. New Goals also persist a finite
`Checkpoint Stages` vocabulary; stage labels are nullable and manifest-bound.
Enforced managed Runs bind an independent
`checkpoint.json` from the manifest and reference it from status without
duplicating checkpoint revision/control state. Checkpoint mutation holds the
Run lock, writes atomically, and requires `expectedRevision`. Contract drift
quarantines the old Run as `replan-required`, then a validated replacement may
make it `superseded`; the immutable manifest is never rebound. When an external
effect may have occurred, `reconciliation-required` permits authoritative
inspection only and prohibits blind retry. Checkpoint/Run completion remains
evidence and never replaces authoritative Task/Goal completion.

Postflight sync updates existing state only with fresh verification, observed
outcome, and remaining gap. It does not create
a Goal, Run, DAG, gate, or status artifact solely for bookkeeping.


### Historical completion and portable evidence

Planned completion seals accepted input hashes and exact receipt logs inside the
Run. A sealed terminal target validates historical acceptance; current source
freshness is reported separately in `currentVerification`. Active execution,
unfinished stages and new dependencies still require current inputs. Legacy
Runs retain strict checks until `run seal` validates original source and logs.
Completed source tasks may resolve from `artifactPolicy.tasks.archive` when absent
from the active index; duplicate, non-done and mismatched Doc records fail closed.
Verification checks may declare explicit `exclude` descendants for build output.
Tracked acceptance rejects ignored source inputs and ignored durable log paths.
