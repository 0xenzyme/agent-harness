# Model Routing

Model and reasoning-effort selection belong to the Codex runtime. Harness does
not pin either by default and never guesses the actual model.

Use an explicit custom agent only for an advanced, separately chosen policy.
The optional `templates/codex-agents/harness_reviewer.toml` is read-only,
returns candidate review evidence, and inherits the parent model and effort.
There are no Harness explorer or implementer templates.

When the runtime exposes actual model or effort, record them as evidence. When
it does not, report that they were not exposed.
