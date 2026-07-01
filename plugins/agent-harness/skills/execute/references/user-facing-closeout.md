# User-Facing Closeout

Use this reference when reporting the final result of an execution, gate-only
review, run record, or delivery-state decision to the user.

Execution evidence is a control record. Final answers are user-facing closeouts.
Do not make the user reconstruct the result from packet fields.

## Default Shape

Use this shape by default:

```text
Work completed: <what changed or what gate was reviewed>.

Verification: <commands or checks run, with pass/fail status>.

Delivery state: <implemented-local | validated-local | committed | pushed |
review-open | integrated | released/shipped | delivery pending>.

Remaining: <missing authorization, review, release, blocker, or None>.
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

## Required Content

The final answer must make these points easy to see:

1. changed files or reviewed worker output;
2. verification evidence;
3. current Delivery State;
4. next action, blocker, or `None`.
