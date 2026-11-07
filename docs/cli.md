# CLI Reference

The CLI is deterministic tooling for accepted delivery control. It does not
execute project tests, schedule workers, monitor source changes or resume
sessions.

## Setup And Inspection

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd <project> --contract adapter
node plugins/agent-harness/scripts/agent-harness.mjs skills install --cwd <project>
node plugins/agent-harness/scripts/agent-harness.mjs skills uninstall --cwd <project> --dry-run --json
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd <project>
node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd <project> --json
```

`skills uninstall` preserves `harness/`, `.harness/`, foreign skills and edited
references. `doctor` checks configured delivery-state paths, not Git telemetry.

`config inspect|validate|import`, `adapter inspect`, `worktree recommend`,
`activation snippet`, `print-contract` and `intake idea` retain their setup,
preview and routing roles. Writes require the relevant explicit option.

## Goals And Delivery Plans

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd <project> --task "<task>" --spec <spec> --work-mode local
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd <project> --goal <goal>
node plugins/agent-harness/scripts/agent-harness.mjs plan validate --cwd <project> --plan <target>.plan.json
node plugins/agent-harness/scripts/agent-harness.mjs execute next --cwd <project> --goal <goal> --json
node plugins/agent-harness/scripts/agent-harness.mjs execute next --cwd <project> --milestone <milestone> --json
```

The adjacent plan declares dependencies, ownership, acceptance mappings and
checks `{id, command, manual?}`. Legacy `inputs` and `exclude` fields are
ignored without hashing. New plans omit them. Map every `Spec Acceptance
Checklist` item from both the source Spec and Goal exactly once; an empty Goal
checklist does not hide source Spec items.

Parent `Implementation Phasing` completion also requires every stage outcome in
the `Milestone Completion Map`, even with a bound plan. Explicit leaf-stage
Goals retain their local-slice contract.

`execute next` returns `execute-node`, `verify-node`, `complete-goal`,
`complete-milestone`, `need-user`, `reconcile`, `wait` or `done` as applicable.
It evaluates accepted outcomes, not execution history.

## Completion

After implementing and actually verifying in the host, write concise evidence
to acceptance items. Then run:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal complete --cwd <project> --goal <goal> --verification "unit: 85 passed; build: passed"
node plugins/agent-harness/scripts/agent-harness.mjs milestone complete --cwd <project> --milestone <milestone> --verification "integration: passed; whole-target constraints checked"
```

Use one exact `<check-id>: <actual result>` entry per declared check, separated
by semicolons or newlines. Bare IDs, substrings, empty results and placeholders
are rejected. Goal completion checks acceptance coverage, required gates and
state sync. Milestone completion requires all Goals plus its own whole-target
checks; it does not repeat every child Goal check.

Writes are limited to the accepted Goal/Milestone, task index and bounded
status. Repeated completed-Goal closeout is idempotent. No Run, receipt,
manifest, checkpoint, log copy, content hash or evidence seal is created.

## Bounded State

```bash
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd <project> --json
node plugins/agent-harness/scripts/agent-harness.mjs artifacts inspect --cwd <project> --json
node plugins/agent-harness/scripts/agent-harness.mjs artifacts compact --cwd <project> --json
node plugins/agent-harness/scripts/agent-harness.mjs artifacts compact --cwd <project> --record --json
```

Maintenance and inspection are read-only without `--record`. Compaction
archives old completed task entries. It never reads old Runs or compares
source snapshots. Legacy Run commands return a retirement error; old files are
not deleted implicitly.

## Language

Language precedence is `--lang`, `AGENT_HARNESS_LANG`, `language.default`,
`LC_ALL`, `LC_MESSAGES`, `LANG`, then English. Generated base templates are
English; responses follow the user's language.

## Validation

```bash
git diff --check
npm run test:all
npm run test:regressions
npm run test:delivery-control
npm run test:eval
npm run validate:plugin
npm run validate:plugin:local
```

The official external validator may require `--validator PATH` or
`AGENT_HARNESS_PLUGIN_VALIDATOR`. Portable integrity validation is separate.
