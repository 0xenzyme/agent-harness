---
name: harness-goal
description: Create or execute controlled Codex goal handoffs using resolved harness contract, adapter paths, and smart local vs worktree policy.
---

# Harness Goal

Use this skill when the user asks to create a `/goal`, execute a goal, or decide
whether a goal should run in local checkout or a worktree.

## Workflow

1. Read repo instructions such as `AGENTS.md`.
2. Resolve harness contract and paths:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
```

3. Read `.harness/config.json` when it exists.
4. In the adapter contract, read the configured project adapter and relevant
   installed plugin references by name: `adapter-harness`,
   `task-routing`, and `work-mode-policy`.
5. Read the configured task index, linked `Doc` entries, and any configured
   state files that exist.
6. If the user asks what to do next, orient first and wait for an explicit
   execution request before creating a goal:

```bash
node <plugin-root>/scripts/agent-harness.mjs orient next --cwd <project>
```

7. Inspect git state with:

```bash
git status --short
git worktree list --porcelain
```

   If the repository has the CLI available, the deterministic shortcut is:

```bash
agent-harness worktree recommend --cwd <project>
```

8. Decide the work mode:
   - `local` when the user explicitly wants no branch/worktree or the task is
     small foreground work.
   - `worktree` when local checkout is dirty, the work is parallel, the change
     is broad, or the goal should become a separate PR.
   - `ask` when production, destructive actions, paid APIs, or product direction
     decisions are involved.
9. Create a goal handoff under the configured goals directory when the user
   wants a durable prompt.
10. The CLI can draft a goal from the configured task index with:

```bash
node <plugin-root>/scripts/agent-harness.mjs goal create --cwd <project> --task "<task title>"
```

   In the adapter contract, pass the confirmed spec:

```bash
node <plugin-root>/scripts/agent-harness.mjs goal create --cwd <project> --task "<task title>" --spec <spec-path>
```

11. After a confirmed goal exists, prepare an execution packet with:

```bash
node <plugin-root>/scripts/agent-harness.mjs run prepare --cwd <project> --goal <goal-file>
```

12. Include verification, constraints, completion conditions, and pause
   conditions in every goal.

## Goal Shape

Every generated goal should include:

- source task from the configured task index;
- files/docs to read first;
- linked `Doc` context from task-index tables;
- scope and non-goals;
- work mode recommendation;
- project adapter preflight and state-sync requirements;
- verification commands;
- completion conditions;
- pause conditions.

## Rules

- Do not assume Codex should create a new branch for every goal.
- Do not turn an orientation recommendation into implementation unless the user
  clearly asks to execute that work.
- Explain the work mode choice before edits.
- Keep `goal` and `run` separate: goal writes durable handoff files, run writes
  execution packets under the configured runs directory.
- Do not automatically start Codex sessions from a prepared run packet.
- If user instructions conflict with config, user instructions win for the
  current run and the config should not be changed without permission.
- Preserve fixed path behavior for `contract: "fixed"`.
- In the adapter contract, project-specific hard boundaries come from repo
  instructions and the project adapter, not plugin core.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
- Update configured state records after completing work when the adapter
  requires state sync.
