# Simplify Completion And Remove Git-Derived Delivery State

Status: Accepted from the current user discussion.
Created: 2026-07-21

## Problem

Agent Harness currently mixes accepted Task/Goal completion with Git-derived
Delivery State. A completed Run first observes commit or push evidence and then
writes tracked Task, Goal, Run, status, and log records. Those state-sync writes
change the repository after the observed delivery boundary, so the completion
record cannot prove its own commit or push state without another write. The
result is a self-referential closeout contract and unnecessary state complexity.

Repository-wide Git status is also transient and unrelated to the acceptance
state of one Task or Goal. Unrelated local changes must not promote, downgrade,
or block accepted project work.

## Objective

Define completion positively from accepted Task/Goal state, fresh verification
evidence, required gates, and state synchronization. Keep the protocol focused
on project control rather than source-control delivery classification.

## Accepted Contract

### Authoritative State

- Task/Goal phase uses `active`, `completed`, or `blocked`.
- `blocked` is resumable and non-complete; removing the blocker returns work to
  `active`.
- Task/Goal is the authoritative accepted-state record.
- Run records execution, DAG, verification, gate, and candidate/accepted
  evidence; it does not define a second independent Task/Goal completion state.
- The configured status file is a bounded derived snapshot and never defines
  completion.

### Completion

- Completion requires accepted scope, fresh verification, required durable
  gates, and synchronized authoritative state.
- Completion does not derive from repository cleanliness, branch, upstream,
  commit, push, review, integration, release, or publication state.
- Normal CLI and generated artifacts contain no Git-derived delivery fields,
  checkpoints, start snapshots, or delivery gates.
- Explicit source-control or worktree operations remain separate user actions;
  they do not become Harness lifecycle evidence.

### Compatibility

- Existing Goals and Runs containing `Delivery State`, `deliveryState`,
  `deliveryPolicy`, `startHead`, `startBranch`, `startUpstream`, or
  `startDirtyState` remain readable for one compatibility release.
- Legacy fields are ignored by generation, validation, completion, maintenance,
  status output, and state synchronization.
- New Goals and Runs do not emit legacy fields.
- Compatibility must not introduce `trackGit`, `gitDisabled`, or equivalent
  negative configuration. Public documentation describes the positive
  completion contract; migration and release notes alone name removed fields.

### Operational Boundaries

- Implicit Git inspection is removed from doctor, work-mode recommendation,
  maintenance, Run prepare/record/status, and artifact evidence inspection.
- Work-mode recommendation follows configured policy without inspecting the
  checkout.
- Artifact durability checks use configured durable evidence roots rather than
  Git tracked-file inventory.
- Explicit user-selected worktree operations may use Git as their underlying
  mechanism, but that operational use is not persisted as Task/Goal state.

## Scope

- Core CLI behavior and generated output.
- Goal/Run validation and compatibility parsing.
- Config schema descriptions and canonical templates.
- Execute/orient/intake references where completion or delivery is described.
- README, CLI docs, project contract, capability matrix, release notes, and
  version metadata.
- Deterministic protocol, smoke, presentation, and behavior-eval coverage.
- Agent Harness dogfood Task, Goal, Run, and bounded status state.

## Non-Goals

- Do not rewrite historical release notes, completed Specs, Goals, archived
  Tasks, or existing Run evidence.
- Do not add a source-control abstraction, commit checkpoint, publication
  checkpoint, anti-Git option, daemon, watcher, or service.
- Do not commit, push, publish, deploy, access production, or use credentials as
  part of this implementation.
- Do not remove explicit worktree safety boundaries or path containment.

## Verification

- New Goal generation omits Delivery State and Git authorization fields.
- New Run preparation omits Git start snapshots and delivery policy/state.
- Completed Run recording succeeds from verification, gates, DAG completion,
  and accepted state without Git inspection.
- Legacy Goal and Run fixtures remain readable without influencing completion.
- Doctor, work-mode recommendation, maintenance, Run status, and artifact
  inspection produce no Git-derived lifecycle state.
- Task/Goal, Run evidence, and bounded status projection remain aligned.
- `npm run test:all`, `npm run test:eval`, and `npm run validate:plugin` pass.

## Completion Conditions

- Core code, schemas, skills, templates, docs, tests, and dogfood artifacts all
  implement the accepted contract.
- Package and plugin versions are aligned at `0.10.0`.
- Fresh verification demonstrates both canonical behavior and legacy read
  compatibility.
- State Sync Notes name the authoritative Task/Goal update, Run evidence, and
  bounded status projection without Git-derived delivery claims.

## Pause Conditions

- This accepted Spec conflicts with repository instructions or a newer user
  direction.
- Compatibility would require destructive rewriting of historical artifacts.
- Explicit worktree functionality cannot be preserved without reintroducing
  implicit lifecycle monitoring.
- Credentials, production, destructive operations, publishing, or an external
  product-direction decision becomes necessary.
- Fresh evidence cannot validate the full accepted scope.
