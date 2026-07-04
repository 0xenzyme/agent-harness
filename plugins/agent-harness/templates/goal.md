# Goal: {Task Name}

Spec:
Spec Policy:
Status: Ready for execution from confirmed spec.

Use `Spec Policy: allow-no-spec` only when accepted scope is the source of
truth and there is intentionally no separate spec. Spec-less goals still require
Scope, Non-Goals, Verification, Completion Conditions, Pause Conditions,
Execution Role, and Delivery State.

## Source Task

-

`harness-rule:terminology-boundary`: user-facing hierarchy is
`Roadmap -> Milestone -> Goal -> Task -> Run`. `P0` / `P1` / `P2` / `P3`
are priorities only, `M*` identifies roadmap milestones, and Runs are
execution attempts rather than threads or sessions.

## Source Task Acceptance Map

Use this section when one goal merges multiple source tasks or describes batch
completion. Preserve each original source task acceptance before execution;
update `Evidence` and `Status` before recording a completed run.

- Task: `<source task title>`
  - Acceptance: `<original source task acceptance>`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Milestone Completion Map

Use this section when the user asks to complete a roadmap milestone such as
`M5`. The parent milestone is not complete until every map item is `satisfied`
with concrete evidence. If the current goal is only a source-spec slice, name
it as the leaf item, such as `M5-S0`, and do not mark the parent milestone
done.

- Item: `<milestone item, e.g. M5-D1 Diagnosis Read Model>`
  - Acceptance: `<what must be true for this milestone item>`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Read First

- `AGENTS.md`
- Project adapter
- `.harness/config.json`
- Spec, unless `Spec Policy: allow-no-spec` is declared

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
- Parent controller thread: `N/A`
- Controller thread: `current-thread`
- Accepted-state owner: `current-thread`
- Execution cwd: `TBD`
- Execution branch: `TBD`
- Execution slot: `N/A`
- Remote-control worktree: `no`

`harness-rule:child-controller-boundary`: if this goal is handed to a visible
long-lived thread, declare whether that thread is a `child-controller` or an
`execution-worker`. A child controller may write accepted state only inside the
authorized scope named here and reports snapshots, decision requests, and final
result packets to the parent controller. An execution worker returns candidate
evidence only.

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
target integration line declared by the project adapter, confirmed goal, or
explicit user instruction; release / ship remains out of scope unless the
delivery policy explicitly authorizes it. Lower the target to `validated-local`
only for local-only spikes, audits, or explicitly uncommitted work.

`harness-rule:local-delivery-ceiling`: `validated-local` is local verification
evidence only; it is not commit, push, review, integration, release, or ship
evidence.

The locked Execution branch records where implementation happens. It is not
automatically the integration target, and Harness core does not assume a branch
named `main`.

## User-Facing Closeout

`harness-rule:need-user-digest`: final answers must include explicit `Need user`
and `Remaining` values. Use `Need user: None` when no true pause trigger or
human action remains. Use `Remaining: None` when no non-user follow-up remains.
List only concrete decisions, manual verification, authorization, external
evidence, or blockers instead of asking broad confirmation questions.

## Execution DAG

Use `run prepare` to generate `dag.json`, `dag.md`, and per-node
`agents/<node>/prompt.md` files. Run packets default worker nodes to
`codex-cli-subagent`; create a new Codex thread only when the controller
explicitly needs a visible, long-lived handoff lane. Fork is not the default
worker surface; use it only when the controller explicitly approves inherited
context.

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
- Preserve `harness-rule:project-neutral-core`: keep plugin templates generic;
  put downstream product facts, credentials, provider policy, ports, and
  production procedures in project adapters and artifacts.

## Verification

-

## Evidence And State Sync

- Candidate evidence:
- Accepted evidence:
- State records to update:

## Completion Conditions

-

## Pause Conditions

- The goal conflicts with the spec or accepted scope, adapter, repo
  instructions, production constraints, or newer user instructions.
- Requirements are unclear in a way that affects cost, risk, compatibility, or
  product direction.
- Credentials, paid APIs, production access, destructive operations, release,
  or a delivery step above the Delivery State policy is required.
