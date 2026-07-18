# Goal: {Goal Name}

Spec:
Spec Policy:
Status: Ready for execution from confirmed spec.

## Source Task

-

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. Project adapter
4. Referenced Spec

## Work Mode Recommendation

Use `ask` until cwd and ownership are confirmed.

## Execution Role

Use `implementer`.

- `gate-only`: verify candidate evidence and own accepted state; do not edit.
- `implementer`: edit only accepted owned scope and return candidate evidence.

## Conversation Route

Use `current-thread`.

## Execution Context Lock

- Conversation lane: `current-thread`
- Controller thread: `current-thread`
- Accepted-state owner: `current-thread`
- Execution cwd: `TBD`
- Execution branch: `TBD`
- Execution slot: `N/A`
- Remote-control worktree: `no`

## Delivery State

- Delivery intent: `local-validation`
- Target delivery state: `validated-local`
- Commit authorized: `no`
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

The Codex runtime owns scheduling, delegation, concurrency, cancellation, and
model selection. Harness records ready nodes, dependencies, ownership,
verification, candidate evidence, gates, and state sync.

## Spec Acceptance Checklist

- Item: `<checklist item>`
  - Acceptance: `<what must be true>`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Required Gate Evidence

- Gate: `<gate name>`
  - Required: `yes`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Scope

-

## Non-Goals

- Do not exceed recorded authority or delivery policy.

## Verification

-

## Completion Conditions

- Accepted scope, verification, required gates, and state sync are satisfied.

## Pause Conditions

- Accepted scope conflicts with current repository facts or newer instructions.
- Credentials, production, destructive work, or unauthorized delivery is needed.
- Evidence cannot validate the accepted objective.
