# Ownership / Boundary Model

This model answers what belongs to plugin core, project adapters, artifacts,
and pause rules.

## Ownership

```text
Plugin defines protocol. Adapter defines overrides. Artifacts record facts.
```

- plugin core owns generic protocol, deterministic file generation,
  validation, references, skills, and templates
- project adapter owns artifact paths, source-of-truth rules, hard boundaries,
  validation commands, enabled gates, and release policy
- artifacts record Goal state, decisions, evidence, status, handoffs, and
  durable project facts

Plugin core must not absorb downstream-specific product names, database rules,
provider policies, route lists, ports, credentials, production procedures, or
release rules.

## Precedence

Use the highest-priority applicable instruction:

1. Current user instruction.
2. Repository `AGENTS.md` and nested instructions.
3. Project adapter.
4. `.harness/config.json`.
5. Plugin canonical defaults.

Pause instead of guessing when those sources conflict in a way that affects
cost, risk, product direction, production safety, compatibility, credentials,
paid calls, destructive operations, or release behavior.

## Work Mode Boundary

The harness does not assume a branch or worktree for every goal. It classifies
work by risk and context:

- `local`: small, foreground, user explicitly wants no branch/worktree
- `worktree`: parallel work, dirty checkout, broad code change, automation
- `ask`: destructive action, production impact, unclear product direction

Codex should explain the chosen mode before making edits.
