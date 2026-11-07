# Goal: {Goal Name}

Spec:
Spec Policy:
Status: active.
Execution Plan: <goal-filename>.plan.json

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

Use `implementer`; use `gate-only` only for explicit review-only direction.

## Host Execution

The host owns the runtime outcome, transient plan, session, resume, workers and
full logs. This Goal owns accepted scope, verification and delivery state.

## Conversation Route

Use `current-session`.

## Execution Context Lock

- Conversation lane: `current-session`
- Controller thread: `current-session`
- Execution cwd: `TBD`
- Execution branch: `TBD`
- Execution slot: `N/A`
- Remote-control worktree: `no`

## Durable Control Invariants

- `harness-rule:path-containment`
- `harness-rule:pre-delegation-work-mode`
- `harness-rule:candidate-accepted-evidence`
- `harness-rule:authoritative-completion-state`
- `harness-rule:state-sync-evidence`
- `harness-rule:bounded-status-snapshot`
- `harness-rule:project-neutral-core`
- `harness-rule:durable-tier-boundary`
- `harness-rule:host-owned-execution`

## Spec Acceptance Checklist

- Item: `<checklist item>`
  - Acceptance: `<what must be true>`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

Evidence names changed files and actual verification results. It never names
hashes, copied logs, receipts or Run artifacts.

Map every item in this checklist and the source Spec checklist exactly once.
Keep source Spec items mapped and satisfied even when this section is empty.

For parent `Implementation Phasing` completion, add a `Milestone Completion
Map` covering every required stage outcome. An Execution Plan does not remove
that requirement; an explicitly leaf-scoped Goal keeps its local acceptance
contract.

## Required Gate Evidence

- Gate: `<gate name>`
  - Required: `yes`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Scope

-

## Non-Goals

- Do not exceed accepted scope or recorded authority.

## Delivery Contract

- Delivered outcome: `<user-visible result>`
- Global hard constraints: `<what every Task must preserve>`
- Whole-target verification: `<how the complete result and constraints are checked>`
- Delivery authority: `<allowed and forbidden external actions>`
- Final report: result, key changes, verification, actual delivery state,
  `Need user`, and `Remaining`.

## Verification

List actual commands or manual review steps. Do not declare source snapshots.

## Completion Conditions

- Accepted scope and required gates are satisfied.
- Actual verification and uncovered gaps are recorded concisely.
- Existing Goal, task index and bounded status are synchronized.

## State Sync Notes

- Accepted-state records: `TBD`
- Verification: `TBD`
- Bounded status update: `TBD`

## Pause Conditions

- Spec conflict, missing authority, credentials, paid APIs, destructive or
  production action, unclear product direction, or a true user decision.
