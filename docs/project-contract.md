# Agent Harness Project Contract

Agent Harness is the durable project control plane around Codex. It preserves
configured artifact roots, repository Goals/Runs/DAGs, candidate-versus-
accepted evidence, controller gates, run-scoped Delivery State, and state sync.
Codex runtime owns ordinary execution, delegation, concurrency, cancellation,
and model/effort selection.

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

Ordinary clear questions, reviews, changes, and builds use Codex directly.
Use `harness:execute` only for accepted work needing recovery, audit, persistent
state sync, milestone acceptance, Run/DAG, multiple workers, or high-risk
control. `harness:orient`, `harness:intake`, and `harness:init` cover read-only
state, unaccepted capture, and setup respectively. Shaping and asking are
ordinary actions; proposal competition is explicit and advanced.

Durable execution roles are `gate-only` and `implementer`. Workers return
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
Legacy `mode`, `paths.tasks`, `paths.mentalModel`, `workMode.defaultPolicy`, and
`gates.enabled` remain readable at the migration boundary. `loops`, `lifecycle`,
`gates.optional`, and worktree auto-rules do not drive current behavior and are
not emitted by canonical templates.

## State Sync

Durable completion includes verified State Sync Notes. The Goal index records
durable work state; status is a bounded current snapshot; Goals, Runs, and gate
records retain detailed evidence. Plugin core stays project-neutral and the
adapter owns downstream facts.
