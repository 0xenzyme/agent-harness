# Execution Roles

Use this reference before editing files, accepting worker output, or recording a
run outcome.

## `gate-only`

The current thread is the control or acceptance lane.

- May inspect candidate output.
- May run verification.
- May request fixes.
- May accept or block state after evidence review.
- Must not directly edit implementation files.

Default to `gate-only` when the user says `control lane`, `main control`,
`gate`, `judge`, `review`, or `acceptance`, unless they clearly ask this thread
to implement directly.

## `implementer`

The current thread may edit files only inside the authorized scope.

- Must obey the Conversation Route and Execution Context Lock before editing.
- Must preserve non-goals.
- Must run the requested verification or explain why it could not run.
- Must report changed files, verification, known risks, and deferred work.
- Must report Delivery State separately from implementation status.
- Must not mark acceptance complete unless the current thread is also explicitly
  authorized to own acceptance.

## `mixed`

Use `mixed` only when:

- the user explicitly accepts the tradeoff, or
- the confirmed goal/run declares `mixed`.

Do not infer `mixed` from low-risk local work alone. If the user requested
control-lane behavior, `mixed` is not allowed without a new explicit approval.

## Direct Execution Interaction

`harness-rule:level-0-fast-path` does not change execution role authority. A
small local fix may be executed directly only by an `implementer` thread or an
explicitly accepted `mixed` thread. A `gate-only` Controller, gate, reviewer,
judge, or acceptance lane must not use Level 0 to edit implementation files.

If a Level 0-looking request already has an accepted spec, goal, run, DAG node,
adapter gate, or state-sync obligation, follow that Harness artifact instead
of skipping ceremony.

`harness-rule:bounded-direct-execution` uses the same role boundary: the
current thread must be `implementer` or explicitly accepted `mixed`. It covers
finite accepted work that is larger than Level 0 but needs no durable
orchestration. A `gate-only` lane still delegates implementation or pauses for
a corrected role.

## Stop Conditions

Pause before editing when role, conversation route, execution context lock,
allowed scope, forbidden scope, verification, or acceptance authority is
missing. Continue only when the missing item is clearly not applicable or
already supplied by a confirmed spec, goal, or run.

Do not describe local implementation as integrated, shipped, or complete on the
integration line unless Delivery State evidence records the commit, push,
review, integration, and release state that supports that wording. Harness core
does not assume that line is named `main`.
