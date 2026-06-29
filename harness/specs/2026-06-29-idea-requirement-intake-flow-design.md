# Idea / Requirement Intake Flow Design

Status: Implemented.
Created: 2026-06-29
Updated: 2026-06-29

## Background

Agent Harness now supports orientation from existing project state through
`agent-harness orient next`. The next adjacent workflow is intake: a user brings
a new idea, requirement, bug, workflow change, or vague request, and Codex
should turn it into harness-shaped project state before implementation.

The mental model says intake is not execution. It starts from external intent,
compares that intent with current harness state, proposes a candidate task or
spec direction, and asks before mutating the task index.

## Goal

Implement a conservative idea / requirement intake flow:

- accept raw idea text from the CLI;
- inspect the configured task index, status file, adapter, specs, goals, and
  mental model paths when available;
- classify the idea as a task candidate, spec needed, goal ready, duplicate,
  related, note only, defer, or ask;
- output a candidate harness entry with title, priority, acceptance, risks,
  dependencies, validation questions, and confirmation needed;
- support a read-only preview by default;
- support explicit task-index append only when the user passes a write flag.

## Scope

### CLI

Add an intake command:

```bash
agent-harness intake idea --cwd <project> --idea <text> [--json] [--record] [--priority P1|P2|P3] [--section Now|Next|Later]
```

Behavior:

- default mode is preview only and must not edit files;
- `--record` appends a candidate task to the configured task index;
- `--priority` defaults to `P2`;
- `--section` defaults to `Next`;
- `--json` exposes stable machine-readable output;
- the command should work for fixed and adapter contracts.

### Classification

The first implementation may use deterministic heuristics rather than LLM
semantic matching. It should at least detect:

- exact or loose title/text overlap with existing active tasks;
- whether the idea likely needs a spec because it is broad, ambiguous,
  product-directional, risky, or workflow-changing;
- whether the idea is likely goal-ready because it is small and concrete;
- whether it should ask because priority, product direction, or scope is
  unclear.

### Candidate Output

Preview output should include:

- suggested classification;
- suggested task title;
- priority and target section;
- why it matters;
- acceptance criteria;
- whether a spec is needed;
- dependencies / risks;
- validation questions;
- recommended next action;
- confirmation needed;
- whether files were written.

### Recording

When `--record` is present, append a task to the configured task index using
the current fixed markdown task format:

```md
- [ ] P2 Suggested title
  - Source: Intake idea: ...
  - Acceptance: ...
  - Notes: Classification=...; Needs spec=...
```

For table-based downstream task indexes, the first implementation may refuse to
write and ask the user to record manually. It must not corrupt unknown formats.

## Non-Goals

- Do not implement the idea itself.
- Do not automatically create specs, goals, runs, branches, PRs, deployments,
  daemons, or background automation.
- Do not silently modify the task index; writes require `--record`.
- Do not rewrite existing tasks or delete duplicates.
- Do not require a new roadmap artifact.
- Do not use network calls or paid APIs.

## Key Decisions

- Intake is a shaping workflow, not an execution workflow.
- Preview is the default and must be read-only.
- Recording writes only the configured task index and only when `--record` is
  explicit.
- The first classification engine is deterministic and conservative; richer
  semantic matching can be a future enhancement.
- Table-based task indexes are preview-only for now; automatic recording
  refuses them until a safe table writer exists.

## Verification

```bash
git diff --check
npm run validate:plugin
npm run test:smoke
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd . --idea "Add an intake flow for new ideas" --json
```

Temporary-project checks should cover:

- preview does not modify the task index;
- `--record` appends to `Next` by default;
- duplicate-ish ideas are classified as related or duplicate;
- explicit priority / section are honored;
- table-based task index refuses record safely.

## Completion Conditions

- CLI supports preview and explicit record for idea intake.
- README, Chinese README, relevant skills, and tests describe the workflow.
- `harness/tasks.md` and `harness/status.md` are updated.
- Validation passes.

## Pause Conditions

- Recording safely requires understanding an unknown task-index format.
- The implementation would need product-direction judgment beyond a preview.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, release, daemons, watchers, or automatic execution are
  required.
