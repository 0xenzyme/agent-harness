# Completion Evidence

Use this reference before marking a task, goal, run, or gate as complete.

## Minimum Evidence

Completed state requires:

- accepted scope and non-goals
- verification evidence
- state sync evidence (`harness-rule:state-sync-evidence`)
- deferred-work notes when applicable
- concrete references to files, commands, run records, gate records, or human
  review notes

## Not Enough By Itself

These may support review but are not accepted completion by themselves:

- candidate evidence
- worker self-tests
- page existence
- build success
- curl smoke checks
- narrative summaries

## Gate-Only Completion

`gate-only` completion also requires gate evidence that names:

- the implementer output reviewed
- the verification checked
- the acceptance evidence used by the control lane
- the integration decision or blocker

## DAG Completion

Do not mark an enforced-DAG run complete until every DAG node is recorded as
completed with verification evidence.

## Checklist And Adapter Gates

When a goal has `Spec Acceptance Checklist` items, every item needs concrete
evidence and `Status: satisfied`.

When a parent milestone goal has `Milestone Completion Map` items, every
milestone item needs concrete evidence and `Status: satisfied`. A source-spec
item such as `M5-S0` does not complete the parent `M5` while `M5-D*`
implementation items remain pending.

When an adapter declares `gates.requiredForCompletion` or `gates.blocking`, the
run needs matching `Required Gate Evidence` entries with concrete evidence and
`Status: satisfied`.

## Delivery Target

Completed state must reach the goal's Target Delivery State. Local verification
can satisfy `validated-local`, but it cannot satisfy `committed`, `pushed`,
`review-open`, `integrated`, or `released/shipped` without matching delivery
evidence. This is `harness-rule:local-delivery-ceiling`. `PR-open` and
`merged` are accepted only as compatibility aliases for provider-specific
inputs.

If the target is above the actual state and the goal authorizes the required
delivery steps, continue the delivery pipeline before closeout. If
authorization or evidence is missing, the correct state is delivery pending,
not completed.
