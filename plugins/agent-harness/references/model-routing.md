# Model Routing

Model and reasoning-effort selection belong to the host. Harness does
not pin either by default and never guesses the actual model.

Use an explicit custom agent only for an advanced, separately chosen policy.
Host packs may ship optional reviewer templates; they are read-only,
return candidate review evidence, and inherit the parent model and effort.
There are no Harness explorer or implementer templates.

When the host exposes actual model or effort, record them as evidence. When
it does not, report that they were not exposed.
