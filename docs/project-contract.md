# Agent Harness Project Contract

Harness controls accepted outcomes and bounded delivery state. The host owns
sessions, resume, workers, scheduling, terminals and full logs.

## Adapter Contract

- `fixed`: configured task index, `.harness/config.json`, status and Goals.
- `adapter`: those plus adapter-declared Specs, Milestones, optional intake,
  mental models and deferred register.

All configured writes and acceptance references stay inside project and target
roots after lexical and existing-parent realpath checks. Legacy Run/checkpoint
fields remain readable but ignored; new configs omit them.

## Delivery Plan

An accepted Goal/Milestone references an adjacent `<target>.plan.json`.
Version 1 declares target, Goals, dependencies, Tasks, ownership, acceptance
references, optional constraints and verification `{id, command, manual?}`.
Goal/Task graphs must be acyclic. Every acceptance item maps exactly once,
including every `Spec Acceptance Checklist` item in both the source Spec and
Goal. An empty or partial Goal checklist does not replace source Spec acceptance.

A Goal that completes a parent `Implementation Phasing` stage needs a
`Milestone Completion Map` containing every declared stage outcome. Binding an
Execution Plan does not waive that requirement. A Goal explicitly scoped to a
leaf stage retains its local-slice acceptance contract.

The target Delivery Contract defines the outcome, global constraints,
whole-target verification, external-action authority and final reporting.
Local checks cannot substitute for required integration checks.

## Execution And Acceptance

`execute next` chooses the next accepted outcome. The controller may implement
unless explicitly `gate-only`. Host runtime outcome and transient plan are used
when exposed; they are not mirrored into Harness files.

Workers return candidate changed files, verification, risks and remaining work.
The outcome owner verifies the actual result before updating existing
Goal/Milestone, task-index and status records.

`goal complete --verification <summary>` requires concrete acceptance evidence
and one exact `<check-id>: <actual result>` entry for every declared check.
Separate entries with semicolons or newlines. Bare IDs, ID substrings, empty
results and placeholder results do not satisfy this requirement.
`milestone complete` additionally requires every Goal and whole-target
verification. The CLI validates recorded results; it does not run commands or
infer success.

## No Execution Archaeology

Core never hashes source files or logs, copies transcripts, seals receipts,
prepares Runs or manages checkpoints. Later code edits do not reopen completed
targets or mark old evidence stale. Review and verify new changes directly.

Old Run files may remain as historical data. They do not drive orientation,
acceptance, task completion, artifact compaction or destructive cleanup.
Tamper-evident audit is a separately requested extension, not a default gate.

## State And Pause Conditions

Status is a bounded current projection. Task compaction retains the recent
Done window and archives older entries. State sync updates existing records
only; direct work does not inherit Goal completion gates.

Pause for genuine scope conflict, missing authority, failed required
verification, credentials, paid APIs, production/destructive actions or product
decisions. Source drift is not a pause condition.
