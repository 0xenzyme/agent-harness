# Agent Harness Project Contract

Agent Harness is the durable project control plane around Codex. It preserves
configured artifact roots, repository Goals/Runs/DAGs, candidate-versus-
accepted evidence, controller gates, run-scoped Delivery State, and state sync.
Codex runtime owns ordinary execution, delegation, concurrency, cancellation,
and model/effort selection.

Runtime Goal owns the current long-running outcome; Codex Plan owns transient
steps. Harness does not mirror every Plan transition. It records project facts
at durable boundaries or in one bounded postflight closeout.

## Contracts

- `fixed`: `harness/tasks.md`, `.harness/config.json`, `harness/status.md`,
  `harness/goals/`, and `.harness/runs/`.
- `adapter`: `.harness/config.json` plus adapter-declared Goal index, status,
  specs, goals, milestones, runs, gate records, and deferred-register paths.

All configured writes and Goal/Spec/Run/DAG references must stay inside their
configured project roots after lexical and existing-parent realpath checks.
Legacy aliases remain readable for one migration boundary, canonical output
writes current fields, and conflicts fail.

## Routing

The three execution paths are `codex-direct`, `codex-direct-postflight`, and
`durable-harness`. Ordinary clear questions, reviews, changes, and builds use
Codex directly without lifecycle artifacts. Simple completed work linked to
state that already existed may use bounded postflight sync. Use durable
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

## Run And Delivery

`run prepare` records `startHead`, `startBranch`, `startUpstream`, and a
comparable `startDirtyState`. A Run records DAG dependencies, ready nodes,
ownership, verification, and candidate evidence. A clean checkout with an
upstream is not this Run's push evidence: commit/push claims require a Run HEAD
delta or explicit delivery evidence.

Delivery states are `implemented-local`, `validated-local`, `committed`,
`pushed`, `review-open`, `integrated`, and `released/shipped`. Local evidence
never implies a higher state. Commit, push, review, integration, release,
deploy, credentials, paid APIs, production, destructive work, and daemons need
fresh authority.

## Configuration

Canonical behavior fields include adapter/configured paths,
`worktree.defaultPolicy`, `gates.requiredForCompletion`, and `gates.blocking`.
These configured gates apply to durable Goal/Run completion. They do not apply
to `codex-direct` or postflight-only synchronization, and postflight cannot
bypass an existing enforced Run.
Legacy `mode`, `paths.tasks`, `paths.mentalModel`, `workMode.defaultPolicy`, and
`gates.enabled` remain readable at the migration boundary. `loops`, `lifecycle`,
`gates.optional`, and worktree auto-rules do not drive current behavior and are
not emitted by canonical templates.

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

Postflight sync updates existing tracked state only with fresh verification,
observed outcome, actual Delivery State, and remaining gap. It does not create
a Goal, Run, DAG, gate, or status artifact solely for bookkeeping.
