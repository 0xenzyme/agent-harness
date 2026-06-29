---
name: harness-adapter
description: Route adapter-contract Agent Harness work across task routing, specs, goals, milestones, gates, adapters, and run packets.
---

# Harness Adapter

Use this skill when the user asks for adapter workflow, task routing, specs,
goals, milestones, gates, project adapters, or adapter Agent Harness behavior.

## Workflow

1. Read repo instructions such as `AGENTS.md`.
2. Resolve harness contract and paths:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
```

3. Read `.harness/config.json` when it exists.
4. If contract is `adapter`, read the configured project adapter.
5. For adoption or migration requests, print the activation snippet instead of
   editing project instructions directly:

```bash
node <plugin-root>/scripts/agent-harness.mjs activation snippet --cwd <project>
```

6. For current-state or next-action requests, use the read-only orientation
   command:

```bash
node <plugin-root>/scripts/agent-harness.mjs orient next --cwd <project>
```

7. Read only the relevant installed plugin references by name:
   `adapter-harness`, `task-routing`, `controller-communication`,
   `gate-results`, and `work-mode-policy`. Include `task-routing` when task
   kinds such as `observe` are relevant.
8. Read the configured task index, spec, goal, milestone, status, or run files
   needed for the user's request.
9. Keep generic protocol in plugin references, project-specific rules in the
   adapter, and execution evidence in artifacts.

## Rules

- Preserve the fixed contract for `contract: "fixed"` projects.
- Do not copy project-specific product, DB, production, provider, port, slot,
  Admin CLI, credential, or release rules into plugin core.
- Do not silently modify `AGENTS.md`; activation changes require explicit user
  approval after preview.
- Treat orientation as a non-execution mode. It may recommend a next action,
  but it must not start implementation by itself.
- Do not create daemons, watchers, automatic Codex sessions, pushes, PRs,
  deploys, publishes, or releases from adapter workflow commands.
- Pause if the adapter conflicts with repo instructions, production
  constraints, code reality, or newer user instructions.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
