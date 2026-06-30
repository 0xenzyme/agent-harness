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

- Must preserve non-goals.
- Must run the requested verification or explain why it could not run.
- Must report changed files, verification, known risks, and deferred work.
- Must not mark acceptance complete unless the current thread is also explicitly
  authorized to own acceptance.

## `mixed`

Use `mixed` only when:

- the user explicitly accepts the tradeoff, or
- the confirmed goal/run declares `mixed`.

Do not infer `mixed` from low-risk local work alone. If the user requested
control-lane behavior, `mixed` is not allowed without a new explicit approval.

## Stop Conditions

Pause before editing when role, allowed scope, forbidden scope, verification, or
acceptance authority is missing. Continue only when the missing item is clearly
not applicable or already supplied by a confirmed spec, goal, or run.
