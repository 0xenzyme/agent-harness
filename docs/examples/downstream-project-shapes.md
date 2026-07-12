# Downstream Project Shapes

Agent Harness examples should be project-neutral. They describe artifact
shapes and routing behavior without using private project names, local
absolute paths, customer details, provider-only rules, ports, credentials, or
production procedures.

## New Adapter Project

Use when a repository wants Agent Harness control files from the start.

Expected setup:

```text
.harness/config.json
harness/README.md
harness/tasks.md
harness/status.md
harness/specs/
harness/goals/
harness/milestones/
.harness/runs/
harness/mental-models/
```

Recommended route:

```bash
agent-harness init --cwd <project> --contract adapter
agent-harness doctor --cwd <project>
agent-harness orient next --cwd <project>
```

## Existing Adapter Project

Use when a project already has a Goal index and adapter-style docs.

Expected setup before import:

```text
harness/README.md
todolist.md
```

Recommended route:

```bash
agent-harness config import --cwd <project> --task-index todolist.md --dry-run
agent-harness config import --cwd <project> --task-index todolist.md
agent-harness config validate --cwd <project>
```

The import should preserve the existing Goal index and create only missing
support artifacts.

## Fixed Compatibility Project

Use when a small project wants the original fixed-path contract.

Expected setup:

```text
.harness/config.json
harness/tasks.md
harness/status.md
harness/goals/
.harness/runs/
```

Recommended route:

```bash
agent-harness init --cwd <project>
agent-harness config validate --cwd <project>
agent-harness doctor --cwd <project>
```

## Non-Harness Project

Use when a repository has not adopted Agent Harness.

Expected setup:

```text
application files only
```

Recommended route:

```bash
agent-harness doctor --cwd <project>
```

The agent should report missing harness state and ask before initialization or
activation changes.

## Messy Realistic Project

Use when partial adoption, stale state, dirty git status, or mixed idea notes
make immediate execution risky.

Recommended route:

```bash
agent-harness config inspect --cwd <project> --json
agent-harness config validate --cwd <project>
agent-harness orient next --cwd <project>
agent-harness maintain tasks --cwd <project>
```

The control lane should accept only verified evidence. Idea Inbox notes,
subagent output, automation logs, and competition proposals stay candidate
evidence until the controller validates and records a state change.
