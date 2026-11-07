# Delivery Plan

Harness controls accepted outcomes, not execution history. The host owns
sessions, resume, workers, terminals, full logs and transient plans.

A plan is `<target>.plan.json` beside its Goal or Milestone. It declares:

- target and Goal dependencies;
- Task ownership, acceptance references and scope constraints;
- verification commands or manual review descriptions;
- whole-target verification for a Milestone.

Checks have `id`, `command` and optional `manual`. They do not have `inputs`,
`exclude`, hashes, logs, timestamps or snapshots. Source edits never invalidate
a completed Goal or Milestone. Review new edits on their own merits.

Use `execute next --goal <path>` or `--milestone <path>` to find the next
accepted outcome. Work in the host, verify the result, and write concise
evidence such as changed files plus commands/results into the existing
acceptance item. Evidence must describe an outcome, not point to a Run receipt.

Close an accepted Goal with:

```bash
node <plugin-root>/scripts/agent-harness.mjs goal complete --cwd <project> --goal <goal> --verification "npm test: 85 passed; build passed"
```

When every Goal is complete, run the Milestone checks and use
`milestone complete --verification <summary>`. These commands update only
configured Goal, task-index and status records. They create no Run, DAG,
receipt, checkpoint, copied log, content hash or evidence seal.

Legacy Run files may remain in old projects as historical material. They are
not the execution authority, do not gate later edits, and do not require
recovery, sealing or synchronization.
