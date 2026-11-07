---
name: execute
description: Agent Harness executes accepted Goal or Milestone delivery and synchronizes bounded project state; the host owns execution, sessions, workers and resume. / Agent Harness 执行已接受目标并同步交付状态，宿主负责执行与恢复。
---

# Harness Execute

Controller means outcome owner and accepted-state owner.

Use this skill to turn an accepted Goal or Milestone into delivery. Ordinary
clear work uses the current host directly. Do not create Harness artifacts for
bookkeeping.

Read [Completion Evidence](references/completion-evidence.md) and
[Delivery Plan](../../references/planned-execution.md) before accepting
completion. Read [Host Execution Bridge](../../references/host-execution.md)
for host/direct/postflight boundaries.

## Control Loop

1. Read the accepted target, constraints and verification. Use the host runtime
   outcome and transient plan when available. The host owns session history,
   resume, scheduling, delegation, cancellation and model selection.
2. Call `execute next --goal <path>` or `--milestone <path>` for the next
   outcome. Keep the accepted Milestone selected across child Goal closeouts.
3. Implement or verify in the host. Review candidate worker output against the
   complete target, not just its local checks. Do not mirror worker state or
   transient plan transitions into repository artifacts.
4. Record concise evidence in existing acceptance items: changed files, actual
   commands/results or manual review, remaining gaps and true user decisions.
   Never record source/log hashes, copied logs, Run receipts or execution
   narratives.
5. Close a satisfied Goal with
   `goal complete --goal <path> --verification <actual-results>`.
   After every Goal and whole-target check passes, close the Milestone with
   `milestone complete --milestone <path> --verification <actual-results>`.
6. Report the delivered result, verification, remaining gaps and `Need user`.

Completion updates only the accepted Goal/Milestone, task index and bounded
status. It does not create a Run, DAG, receipt, checkpoint, evidence seal or
source snapshot. Source edits after completion never reopen the target or make
its evidence stale. Review and verify new edits independently without
referencing old execution state.

Pause only for a genuine scope conflict, missing authority, failed required
verification, or user decision. Continue unaffected work. No hash comparison,
Run recovery, checkpoint revision or receipt timestamp may block delivery.

## Invariants

- `harness-rule:path-containment`: configured writes and acceptance references
  remain inside their project roots.
- `harness-rule:pre-delegation-work-mode`: resolve local/worktree/ask before host
  delegation; unresolved work-mode choices require user direction.
- `harness-rule:candidate-accepted-evidence`: worker output is candidate until
  the outcome owner verifies the delivered result.
- `harness-rule:authoritative-completion-state`: Goal/Milestone owns accepted
  completion; status is a bounded current projection.
- `harness-rule:state-sync-evidence`: synchronize concise verification and
  existing delivery records, not execution history.
- `harness-rule:bounded-status-snapshot`: replace current status instead of
  appending process history.
- `harness-rule:project-neutral-core`: adapters own downstream paths and facts.
- `harness-rule:durable-tier-boundary`: ordinary work uses the host directly;
  postflight updates existing state without new lifecycle artifacts.
- `harness-rule:host-owned-execution`: sessions, resume, workers, terminals,
  logs and transient execution state belong to the host, not Harness.

Explicit tamper-evident auditing is a separately requested extension, never a
default completion requirement. Do not commit, push, deploy or release without
the necessary authorization.
