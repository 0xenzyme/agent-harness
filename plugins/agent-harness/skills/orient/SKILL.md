---
name: orient
description: Agent Harness inspects accepted outcomes, delivery state and next actions without mutation. / Agent Harness 只读检查目标、交付状态与下一入口。
---

# Harness Orient

Read repo instructions, `.harness/config.json`, the configured task index,
status, and the relevant Goal/Milestone. Use:

```bash
node <plugin-root>/scripts/agent-harness.mjs orient next --cwd <project> --json
node <plugin-root>/scripts/agent-harness.mjs orient next --cwd <project> --goal <goal> --json
```

`execute next` and target-scoped `orient next` share the same delivery logic.
`done` describes accepted delivery state only; it never compares current source
to old inputs. `need-user` identifies a genuine decision. `reconcile` repairs
missing acceptance or state sync, not execution history.

Choose `host-direct` for ordinary clear work, `host-direct-postflight` for
bounded updates to existing records, and `harness:execute` for accepted
Goal/Milestone control. Setup, capture and inspection map to `init`, `intake`
and `orient`.

Do not inspect source hashes, reopen completed targets, recover Runs, seal
receipts or mirror session history. Resume belongs to the host. Old Run files
are historical material, not routing authority. Read `artifact-lifecycle.md`
for bounded task/status maintenance.

Do not mutate files, launch workers or deliver external effects while
orienting. Treat worker summaries as candidate until the outcome owner verifies
the actual result.
