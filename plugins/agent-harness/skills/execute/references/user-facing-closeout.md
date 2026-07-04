# User-Facing Closeout

Use this reference when reporting the final result of an execution, gate-only
review, run record, or delivery-state decision to the user.

Execution evidence is a control record. Final answers are user-facing closeouts.
Do not make the user reconstruct the result from packet fields.

`harness-rule:need-user-digest`: routine closeouts must say `Need user: None`
when no true pause trigger exists and `Remaining: None` when no non-user
follow-up remains. Do not ask broad confirmation questions just to check whether
the user has anything else to confirm.

## Default Shape

Use this shape by default:

```text
Work completed: <what changed or what gate was reviewed>.

Verification: <commands or checks run, with pass/fail status>.

Delivery state: <implemented-local | validated-local | committed | pushed |
review-open | integrated | released/shipped | delivery pending>.

Need user: <concrete decision, manual verification, authorization, external
evidence, or None>.

Remaining: <missing verification, delivery pending, follow-up, blocker, or
None>.
```

Keep the final answer short unless the user asks for a gate record, run packet,
or audit-quality handoff.

## Compression Rules

- Do not paste full `Execution Result Packet`, `Integration Gate Report`, or
  `Gate Result` sections by default.
- Collapse routine evidence into one or two sentences, but keep verification
  and delivery state explicit.
- If delivery is pending, say exactly what evidence or authorization is missing.
- If the current thread was `gate-only`, name the implementer output reviewed
  and the gate decision.
- If work is only local or dirty, do not imply it is committed, reviewed,
  integrated, released, or shipped.
- Put a manual check in `Need user` only when the user must actually inspect or
  decide something. Agent-performed visual or manual inspection belongs in
  `Verification`.
- If no user action is needed, write `Need user: None`. If no follow-up remains,
  write `Remaining: None`.

## Required Content

The final answer must make these points easy to see:

1. changed files or reviewed worker output;
2. verification evidence;
3. current Delivery State;
4. concrete `Need user` value or `None`;
5. next action, blocker, or `Remaining: None`.
