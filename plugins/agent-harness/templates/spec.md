# Spec: {Goal Name}

Created: YYYY-MM-DD
Status: draft

## Decision

-

## Scope

-

## Non-Goals

-

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

## Codex-Native Execution

- Direct work uses Codex without Harness lifecycle artifacts.
- Already tracked simple work may use one bounded postflight sync.
- Long-running controller work uses runtime Goal and Codex Plan when exposed.
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
- Missing authority for credentials, production, destructive work, or delivery.
- Evidence is insufficient to validate the accepted objective.
