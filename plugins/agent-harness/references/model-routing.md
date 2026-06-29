# Model Routing Reference

Model routing is scheduling guidance, not a product or code boundary.

## Stable Labels

- `default configured model`: use the runtime default.
- `fast / cheap model`: simple docs, typo, or mechanical edits.
- `strong coding model`: difficult implementation and debugging.
- `strong reasoning model`: planning, review, and gate decisions.
- `frontier model`: rare high-ambiguity or high-blast-radius work.

## Goal Launch Fields

```text
Recommended model:
Recommended reasoning effort:
Why this level:
Fallback allowed:
```

Default:

```text
Recommended model: default configured model
Recommended reasoning effort: medium
Why this level: task class and scope are bounded.
Fallback allowed: yes
```

Execution results should report actual model and effort when the runtime
exposes them. If not exposed, say so rather than guessing.
