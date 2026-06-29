---
name: harness-adapter
description: Legacy compatibility wrapper for adapter-contract Agent Harness work. Prefer harness:orient for state and routing, harness:init for adoption, and harness:execute for confirmed execution.
---

# Harness Adapter

This is a compatibility wrapper for the older artifact-oriented adapter entry.
Use the shorter workflow skills for new work:

- `harness:orient` for contract inspection, current state, next step, and route
  recommendation.
- `harness:init` for adoption, migration, config import, doctor, and activation
  snippet preview.
- `harness:intake` for new ideas, requirements, bugs, and Idea Inbox Thread
  notes.
- `harness:execute` for confirmed task, spec, goal, or run execution.

## Compatibility Workflow

1. Read repo instructions such as `AGENTS.md`.
2. Resolve harness contract and configured paths:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
```

3. For current-state requests, run orientation:

```bash
node <plugin-root>/scripts/agent-harness.mjs orient next --cwd <project>
```

4. For adoption or migration, preview activation without editing instructions:

```bash
node <plugin-root>/scripts/agent-harness.mjs activation snippet --cwd <project>
```

5. For new ideas, preview intake first and record only with explicit approval:

```bash
node <plugin-root>/scripts/agent-harness.mjs intake idea --cwd <project> --idea "<idea text>"
```

## Rules

- Keep generic protocol in plugin references, project-specific rules in the
  adapter, and execution evidence in artifacts.
- Do not silently modify `AGENTS.md`.
- Do not implement or mutate task state from adapter orientation alone.
- Preserve fixed-contract behavior and adapter-configured paths.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
