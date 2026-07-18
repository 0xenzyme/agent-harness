---
name: intake
description: Explicitly preview or record rough Agent Harness ideas, requirements, bugs, and inbox notes without accepting scope or implementing it. / 显式收集未确认事项，不执行。
---

# Harness Intake

Use intake for rough, unaccepted work. Preview is read-only; recording requires
an explicit user request.

Read [Capture And Promotion](references/capture-promotion.md) before recording
or promoting an intake candidate.

1. Read repo instructions and inspect the configured Goal-index path.
2. Preserve the raw idea, detect duplicates/dependencies, and propose a concise
   title, priority, section, acceptance hint, and likely spec need.
3. Preview first:

```bash
node <plugin-root>/scripts/agent-harness.mjs intake idea --cwd <project> --idea "<idea>" --json
```

4. Record only with explicit authority:

```bash
node <plugin-root>/scripts/agent-harness.mjs intake idea --cwd <project> --idea "<idea>" --record --priority P2 --section Next
```

5. Refuse unsupported table writes without changing the file. Do not promote a
   candidate to accepted scope, create Spec/Goal/Run artifacts, or implement it.
   An accepted ordinary change returns to Codex directly; durable accepted work
   uses `harness:execute` only when its tier boundary applies.
