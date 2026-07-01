# User-Facing Summary

Use this reference when reporting the final result of an orientation run to the
user.

Route decisions are control packets. Final answers are user-facing decision
prompts. Do not make the user decode the packet fields to understand what is
blocked or what they need to choose.

## Default Shape

Use this shape by default:

```text
Orientation completed: <what was checked, and whether any mutation happened>.

Current situation: <one or two observable facts that explain the state>.

Decision needed: <why orientation is stopping instead of continuing>.
- <Option A>: <what this unlocks or requires>.
- <Option B>: <what this unlocks or requires>.
```

Keep the final answer short. The useful part is the current situation, the
reason progress stops, and the exact confirmation needed from the user.

## Compression Rules

- Do not paste the full `Route Decision` packet by default.
- Do not repeat full `Required docs`, `Validation`, or `Escalation triggers`
  lists when commentary already reported those checks.
- Collapse routine evidence into one sentence, such as "I completed the
  read-only orient checks and did not mutate harness state."
- Expand evidence only when the user asks for audit details, a gate record, a
  transcript-quality handoff, or when a failure or risk needs concrete proof.
- Avoid duplicate fields such as `Mode: ask` plus `Execution mode: ask`; say
  what decision is needed instead.

## Required Content

The final answer must make these three points easy to see:

1. what was inspected and whether anything changed;
2. the current task, blocker, stale-artifact, or route state;
3. the next user choice or confirmation boundary.

If there is a clear recommended route, name it briefly and say why. If there is
no safe recommendation, present the smallest set of concrete choices.
