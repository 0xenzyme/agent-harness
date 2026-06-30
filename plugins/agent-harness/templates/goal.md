# Goal: {Task Name}

Spec:
Status: Ready for execution from confirmed spec.

## Source Task

-

## Source Task Acceptance Map

Use this section when one goal merges multiple source tasks or describes batch
completion. Preserve each original source task acceptance before execution;
update `Evidence` and `Status` before recording a completed run.

- Task: `<source task title>`
  - Acceptance: `<original source task acceptance>`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Read First

- `AGENTS.md`
- Project adapter
- `.harness/config.json`
- Spec

## Work Mode Recommendation

Use `ask` until scope, ownership, and checkout state are clear.

## Execution Role

Use `implementer`.

- `gate-only`: the current thread reviews candidate output and verification
  evidence, but does not directly edit implementation files.
- `implementer`: the current thread may edit files inside the accepted scope.
- `mixed`: the current thread may both edit and gate only after recording why
  the tradeoff is acceptable.

## Route Explanation

- Why this is the right next mode:
- Confirmation boundary:

## Scope

-

## Non-Goals

- Do not push, deploy, publish, open a PR, start a daemon, or launch additional
  sessions unless explicitly requested.
- Do not use credentials, paid APIs, production data, or destructive operations
  without explicit approval.

## Verification

-

## Evidence And State Sync

- Candidate evidence:
- Accepted evidence:
- State records to update:

## Completion Conditions

-

## Pause Conditions

- The goal conflicts with the spec, adapter, repo instructions, production
  constraints, or newer user instructions.
- Requirements are unclear in a way that affects cost, risk, compatibility, or
  product direction.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, or release are required.
