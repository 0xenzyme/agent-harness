# Milestone: {Name}

For a planned Milestone, add `Execution Plan: <target-filename>.plan.json`
beside this header and create that plan adjacent to the Milestone file.
Once this Milestone is accepted as the execution target, keep it selected
through all Goal closeouts. A missing plan means bind the Milestone plan;
it does not turn listed Goals into separate execution targets.

## Current Status

- Status:
- Current gate:
- Running threads:
- Next executable:
- Deferred blockers:
- Started:
- Last updated:

## Objective

-

## Scope

In:

-

Out:

-

## Required Specs

-

## Goal List

| Goal | Status | Priority | Doc | Depends on | Gate |
| --- | --- | --- | --- | --- | --- |

When Doc rows are listed, the plan must contain exactly those Goal paths.
The plan binding covers declarative row fields; Status is mutable as Goals
complete. Stage checks are observed after the latest required Goal completion
and their logs live inside the Milestone anchor Run.

## Milestone Completion Map

- Item: `<required stage outcome>`
  - Acceptance: `<what must be true>`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

Every planned Goal maps to exactly one item in this section through its
`milestoneItem` reference. Replace placeholders before plan validation.

## DAG

```text
spec gate
-> execution gate
-> integration gate
-> milestone gate
```

## Gates

For a planned Milestone, Goal dependencies gate preparation and each Goal's
Task dependencies gate execution. Complete every required Goal, check fresh
evidence and synchronized state, then use `milestone complete` with the anchor
Run's `checkpointRevision` from `execute next` as `--expected-revision`. A completed
leaf or Run never closes this Milestone by itself.
Milestone completion synchronizes `Current Status` and `Goal List`, records
`Completion Evidence Hash`, and advances the anchor Run checkpoint revision.

### Spec Gate

-

### Execution Gate

-

### Integration Gate

-

### Milestone Gate

-

## Deferred / Follow-up Register

| Item | Reason deferred | Deferred to | Unblock condition | Owner / next gate |
| --- | --- | --- | --- | --- |

## Execution Log

-
