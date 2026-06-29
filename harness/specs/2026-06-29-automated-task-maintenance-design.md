# Automated Task Maintenance Design

Status: Ready.
Created: 2026-06-29
Updated: 2026-06-29

## Background

Agent Harness already records task state, status, goals, and run outcomes, but
the sync step still depends on a human or Codex session manually comparing git
state and recent run records against `harness/tasks.md` and
`harness/status.md`.

The skill architecture blueprint says deterministic maintenance should stay as
CLI/tooling and be called from `harness:execute` during state sync. It should
not become a separate core skill unless it needs frequent model judgment.

## Goal

Implement a conservative task maintenance CLI that inspects configured harness
state, recent git changes, and recent run records, then produces an auditable
maintenance summary.

## Scope

### CLI

Add a command:

```bash
agent-harness maintain tasks --cwd <project> [--json] [--record]
```

Behavior:

- default mode is preview only and must not edit files;
- inspect the configured task index, status file, runs directory, and git
  state;
- summarize current branch / ahead-behind / dirty state from git;
- summarize recent changed files from working-tree and staged diffs;
- summarize latest run records from the configured runs directory;
- produce conservative candidate state-sync notes for tasks and status;
- support `--json` with stable machine-readable output;
- support `--record` to update only configured harness state files.

### Recording

The first recording implementation should be intentionally narrow:

- update the configured status file with a generated maintenance snapshot;
- move a matching active task to Done only when there is exact, low-risk
  evidence from a completed run or the current task being executed;
- otherwise leave the task index unchanged and report the proposed action.

If a task index format is unknown or cannot be updated safely, the command must
refuse task-index writes instead of corrupting the file.

## Non-Goals

- Do not create a `harness:maintain` skill.
- Do not start daemons, watchers, background sessions, Codex agents, or
  automation loops.
- Do not infer product direction from diffs.
- Do not rewrite unrelated task history.
- Do not commit, push, open PRs, deploy, publish, or release.
- Do not use credentials, network calls, paid APIs, or production access.

## Key Decisions

- The command is deterministic and conservative.
- Preview is the default and must be read-only.
- Recording writes only configured harness state records and only when
  `--record` is explicit.
- The command may report proposed task changes without applying them when the
  evidence is not exact enough.

## Verification

```bash
git diff --check
npm run validate:plugin
npm run test:smoke
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd . --json
```

Temporary-project checks should cover:

- preview does not modify files;
- `--record` updates the configured status file;
- custom adapter paths are honored;
- recent run records are summarized;
- unknown or unsafe task-index formats are not corrupted.

## Completion Conditions

- CLI supports read-only preview and explicit conservative record mode.
- README, Chinese README, CLI help, and smoke tests describe the command.
- `harness/tasks.md` and `harness/status.md` are updated.
- Verification passes.

## Pause Conditions

- The spec conflicts with repo instructions, adapter boundaries, code behavior,
  production constraints, or newer user instructions.
- The implementation would require product direction judgment.
- Safe task-index recording requires understanding an unknown format.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, release, daemons, watchers, background sessions, or
  automatic execution are required.
