---
name: init
description: Adopt, audit, initialize, import, or repair Agent Harness setup. Use for doctor, config migration, and activation preview; not status routing, idea intake, or authorized product implementation. / 用于接入与修复，不用于任务执行。
---

# Harness Init

Use this skill for low-frequency setup, adoption, migration, and repair checks.

## Reference Map

- Use [Adoption Boundary](references/adoption-boundary.md) before setup,
  import, activation, or repair work.
- Use [Migration Safety](references/migration-safety.md) before importing or
  repairing an existing harness-like project.

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

4. Audit, doctor, and activation-preview requests are read-only by default. Stop
   after reporting the current setup unless the user explicitly asks to
   initialize, import, or repair harness files.
5. For a new adapter-contract project, initialize only after explicit setup
   intent:

```bash
node <plugin-root>/scripts/agent-harness.mjs init --cwd <project> --contract adapter
```

6. For an existing project with a task index such as `todolist.md`, import the
   adapter config only after explicit import / repair intent and without
   creating a second task index:

```bash
node <plugin-root>/scripts/agent-harness.mjs config import --cwd <project> --task-index todolist.md --dry-run
node <plugin-root>/scripts/agent-harness.mjs config import --cwd <project> --task-index todolist.md
```

   When the existing project already owns non-default artifact paths, pass
   path overrides such as `--status`, `--specs`, `--goals`, `--milestones`,
   `--runs`, `--gate-records`, `--deferred-register`, `--mental-model`,
   `--mental-model-index`, and `--mental-models`. Prefer `--dry-run --json`
   before writing so the proposed config can be inspected.

7. Print the project-scope activation snippet instead of silently editing
   project instructions:

```bash
node <plugin-root>/scripts/agent-harness.mjs activation snippet --cwd <project>
```

8. Report contract, created paths, missing optional paths, activation status,
   config schema validation, and the recommended first orientation command.

## Boundaries

- For read-only project state or next-action requests, route to `orient`.
- For confirmed implementation, route to `execute` after scope, role, and
  verification are clear.
- For audit, doctor, or activation-preview requests, do not run mutating
  `init`, `config import`, or repair commands unless the user explicitly asks
  for setup writes.
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
