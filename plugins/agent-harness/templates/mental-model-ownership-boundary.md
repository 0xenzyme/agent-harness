# Ownership / Boundary Model

This model answers what belongs to plugin core, project adapters, artifacts,
and pause rules.

```text
Plugin defines protocol. Adapter defines overrides. Artifacts record facts.
```

## Ownership

- plugin core:
- project adapter:
- artifacts:
- control lane acceptance:
- candidate evidence sources:
- project-neutral docs boundary:

## Precedence

1. Current user instruction.
2. Repository `AGENTS.md` and nested instructions.
3. Project adapter.
4. `.harness/config.json`.
5. Plugin canonical defaults.

## Pause Conditions

- cost:
- risk:
- product direction:
- production safety:
- compatibility:
- credentials:
- paid calls:
- destructive operations:
- release behavior:
