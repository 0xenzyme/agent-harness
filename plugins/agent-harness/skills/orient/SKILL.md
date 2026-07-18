---
name: orient
description: Inspect durable Agent Harness state and recommend the next public entry without mutation. Use for status, blockers, stale artifacts, or route questions. / 只读检查持久化状态与下一入口。
---

# Harness Orient

Use this skill to inspect durable project-control state without mutation.

1. Read repo instructions and inspect config:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project> --json
node <plugin-root>/scripts/agent-harness.mjs orient next --cwd <project> --json
```

2. Read the configured adapter, Goal index, bounded status, and only the
   relevant Spec/Goal/Run evidence.
3. Reconcile those artifacts with newer explicit conversation decisions.
4. Recommend one public entry: `harness:orient`, `harness:intake`,
   `harness:init`, or `harness:execute`. Asking a blocking question and shaping
   scope are ordinary actions, not routes or skills.
5. Recommend `harness:execute` only for accepted durable work involving
   recovery, audit, state sync, milestones, DAGs, multiple workers, or high
   risk. Ordinary clear change/build requests use Codex directly.
6. Proposal competition is an explicit advanced read-only technique for
   genuinely ambiguous or high-risk decisions, never a default route.

Do not mutate files, launch workers, create lifecycle artifacts, or perform
delivery actions. Treat summaries and worker output as candidate evidence.
