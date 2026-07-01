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

## Conversation Route

Use `current-thread`.

- `current-thread`: the current conversation owns execution in the locked cwd.
- `slot-thread`: hand off to a dedicated slot conversation before editing.
- `remote-control-worktree`: the current conversation may control a different
  locked worktree only when explicitly approved.

## Execution Context Lock

- Conversation lane: `current-thread`
- Controller thread: `current-thread`
- Execution cwd: `TBD`
- Execution branch: `TBD`
- Execution slot: `N/A`
- Remote-control worktree: `no`

## Delivery State

- Delivery intent: `integrate-after-gates`
- Target delivery state: `integrated`
- Commit authorized: `yes`
- Push authorized: `yes`
- Review authorized: `no`
- Integration authorized: `yes`
- Release authorized: `no`

Completed development runs must reach Target delivery state. By default,
gate-passing implementation work is committed and integrated into the
development mainline; release / ship remains out of scope unless the delivery
policy explicitly authorizes it. Lower the target to `validated-local` only for
local-only spikes, audits, or explicitly uncommitted work.

## Execution DAG

Use `run prepare` to generate `dag.json`, `dag.md`, and per-node
`agents/<node>/prompt.md` files. Prefer Codex CLI subagents for worker nodes.
Create a new Codex thread only when the controller explicitly needs a visible,
long-lived handoff lane. Fork is not the default worker surface; use it only
when the controller explicitly approves inherited context.

## Route Explanation

- Why this is the right next mode:
- Confirmation boundary:

## Spec Acceptance Checklist

Use this section when the referenced spec has concrete acceptance criteria,
required coverage, or product-quality gates. Candidate implementation evidence
is not accepted completion until relevant checklist items are satisfied.

- Item: `<checklist item>`
  - Acceptance: `<what must be true>`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Required Gate Evidence

Use this section for adapter-declared completion gates such as product review,
content quality, security review, source coverage, or milestone acceptance.
Technical verification is necessary but does not replace gate evidence.

- Gate: `<gate name>`
  - Required: `yes`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Scope

-

## Non-Goals

- Do not release, deploy, publish, start a daemon, or launch workers outside
  the run packet DAG unless explicitly requested.
- Do not execute delivery steps above the Delivery State policy.
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
- Credentials, paid APIs, production access, destructive operations, release,
  or a delivery step above the Delivery State policy is required.
