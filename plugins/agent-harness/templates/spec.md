# Spec: {Goal Name}

Created: YYYY-MM-DD
Status: draft

## Decision

-

## Scope

-

## Non-Goals

-

## Delivery Contract

- Delivered outcome: `<user-visible result>`
- Global hard constraints: `<what must not break or change>`
- Whole-target verification: `<how the complete result and constraints are checked>`
- Delivery authority: `<allowed and forbidden commit, push, release, reply, or other external actions>`
- Final report: result, key changes, whole-target and constraint verification,
  actual delivery state, `Need user`, and `Remaining`.

## Durable Control Invariants

- `harness-rule:path-containment`
- `harness-rule:run-dag-ownership`
- `harness-rule:pre-delegation-work-mode`
- `harness-rule:candidate-accepted-evidence`
- `harness-rule:authoritative-completion-state`
- `harness-rule:state-sync-evidence`
- `harness-rule:bounded-status-snapshot`
- `harness-rule:project-neutral-core`
- `harness-rule:durable-tier-boundary`
- `harness-rule:checkpoint-recovery`

## Host Execution

- Direct work uses the current host without Harness lifecycle artifacts.
- Already tracked simple work may use one bounded postflight sync.
- Long-running controller work uses runtime outcome and transient plan when exposed.
- Durable Goal/Run evidence remains authoritative across tasks.

## Acceptance Criteria

-

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

## Verification

-

## State Sync

- Records:
- Evidence:

## Pause Conditions

- Conflicting accepted direction or repository constraints.
- Missing authority for credentials, production, destructive work, or another external side effect.
- Evidence is insufficient to validate the accepted objective.
