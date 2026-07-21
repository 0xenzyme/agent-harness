# Worker Prompt Template

Use only for a runtime-selected DAG execution node.

## Identity

- Controller: `{controller}`
- Goal: `{goal}`
- Run: `{run}`
- DAG node: `{node}`
- Execution cwd: `{execution_cwd}`
- Execution branch: `{execution_branch}`
- Ownership: `{allowed_scope}`
- Forbidden scope: `{forbidden_scope}`
- Validation: `{validation}`
- Stop conditions: `{stop_conditions}`

The Codex runtime owns scheduling, delegation, concurrency, cancellation, and
model selection. Harness records dependencies, ready state, ownership,
verification, and candidate evidence.

Use the active runtime Goal for the long-running outcome and Codex Plan for
transient steps when those native capabilities are exposed. Do not create a
second repository Goal or mirror every Plan transition.

## Invariants

- `harness-rule:path-containment`: stay inside the locked cwd and owned roots.
- `harness-rule:run-dag-ownership`: do not start dependents; record node evidence.
- `harness-rule:candidate-accepted-evidence`: return candidate evidence only.
- `harness-rule:authoritative-completion-state`: Task/Goal owns accepted state;
  Run output remains evidence and status remains a projection.
- `harness-rule:state-sync-evidence`: return concrete State Sync Notes.
- `harness-rule:bounded-status-snapshot`: do not append history to status.
- `harness-rule:project-neutral-core`: keep downstream facts in adapters.
- `harness-rule:durable-tier-boundary`: do not downgrade this durable Run.

Return changed files, summary, validation, known risks, State Sync Notes,
`Need user`, and `Remaining`. Do not update accepted Goal, Task, status, Run,
or gate state.
