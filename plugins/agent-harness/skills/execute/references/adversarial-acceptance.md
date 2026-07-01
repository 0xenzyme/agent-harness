# Adversarial Acceptance

Use this reference before accepting worker output, recording completed state, or
reporting a gate as passed.

## Purpose

Try to reject completion before accepting it. This is a control-lane check, not
a user-facing final-answer template.

## Check

- Could tests pass while acceptance criteria still fail?
- Is any evidence candidate-only rather than accepted by the control lane?
- Did the work exceed scope, touch forbidden areas, or rely on unapproved
  authority?
- Is the actual Delivery State below the Target Delivery State?
- Is the user asking for whole stage / milestone completion while only a
  source-spec or other leaf item is satisfied?
- If there is a `Stage Completion Map`, are all stage items satisfied with
  concrete evidence?
- Are all `Spec Acceptance Checklist` items satisfied with concrete evidence?
- Are adapter-required gates present and satisfied with concrete evidence?
- Does any stale artifact conflict with newer conversation-confirmed state?
- Would the final answer confuse control records with user-facing closeout?

## Acceptance Rule

If any check fails, do not mark the task, goal, run, or gate complete. Request a
correction, route back to shaping, record a blocker, or report delivery pending
with the missing evidence.
