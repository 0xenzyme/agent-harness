---
name: init
description: Adopt, initialize, import, or audit Agent Harness in a new or existing project. / 在新项目或现有项目中接入、初始化、导入或审计 Agent Harness。
---

# Harness Init

Use this skill for low-frequency setup, adoption, migration, and repair checks.

## Workflow

1. Identify the target project directory.
2. Run the doctor first:

```bash
node <plugin-root>/scripts/agent-harness.mjs doctor --cwd <project>
```

3. Inspect resolved config when available:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
node <plugin-root>/scripts/agent-harness.mjs config validate --cwd <project>
```

4. For a new adapter-contract project, initialize explicitly:

```bash
node <plugin-root>/scripts/agent-harness.mjs init --cwd <project> --contract adapter
```

5. For an existing project with a task index such as `todolist.md`, import the
   adapter config without creating a second task index:

```bash
node <plugin-root>/scripts/agent-harness.mjs config import --cwd <project> --task-index todolist.md --dry-run
node <plugin-root>/scripts/agent-harness.mjs config import --cwd <project> --task-index todolist.md
```

6. Print the project-scope activation snippet instead of silently editing
   project instructions:

```bash
node <plugin-root>/scripts/agent-harness.mjs activation snippet --cwd <project>
```

7. Report contract, created paths, missing optional paths, activation status,
   config schema validation, and the recommended first orientation command.

## Boundaries

- Do not overwrite existing files unless the user explicitly asks or a dry-run
  has made the change safe and clear.
- Do not modify `AGENTS.md`; activation changes require explicit user approval
  after preview.
- Preserve fixed-contract projects and adapter-configured artifact paths.
- Do not add SessionStart hooks or other injection mechanisms until plugin
  validation and runtime tests support conditional bootstrap.
- Do not create daemons, background sessions, pushes, PRs, deployments, or
  releases during adoption.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
