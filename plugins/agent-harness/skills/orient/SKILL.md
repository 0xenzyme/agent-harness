---
name: orient
description: Inspect durable Agent Harness state and recommend the next public entry without mutation. Use for status, blockers, stale artifacts, or route questions. / 只读检查持久化状态与下一入口。
---

# Harness Orient

Use this skill to inspect durable project-control state without mutation.

The current user instruction and project instructions take precedence over this
skill. This skill supplies routing and safety boundaries; it does not add an
approval requirement beyond the boundaries stated below.

1. Read repo instructions and inspect config:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project> --json
node <plugin-root>/scripts/agent-harness.mjs orient next --cwd <project> --json
```

`orient next` prioritizes one nonterminal enforced checkpoint and emits its
revision, control state, sole next action, pause reason, and prohibited actions.
When multiple active checkpoints exist, select one explicitly with
`--run <run-dir>`; never choose by timestamp or chat memory.

2. Read the configured adapter, Goal index, bounded status, and only the
   relevant Spec/Goal/Run evidence.
   When the question concerns stale or growing artifacts, also run
   `artifacts inspect --json` and read
   [Artifact Lifecycle](../../references/artifact-lifecycle.md).
3. Reconcile those artifacts with newer explicit conversation decisions.
4. Recommend one execution path before naming a public entry:
   - `host-direct` for ordinary clear work with no state-sync obligation;
   - `host-direct-postflight` when simple work only needs a bounded update to
     state that already existed;
   - `durable-harness` for recovery, audit, milestone acceptance, DAGs,
     multiple workers, persistent state sync, or high risk.
5. Map durable and postflight paths to `harness:execute`; map setup, capture,
   and read-only state to `harness:init`, `harness:intake`, and
   `harness:orient`. Asking and shaping remain ordinary actions.
6. A prepared enforced Run cannot be downgraded to postflight-only. Ordinary
   clear work should not invoke Harness merely because the plugin is installed.
7. Proposal competition is an explicit advanced read-only technique for
   genuinely ambiguous or high-risk decisions, never a default route.

Do not mutate files, launch workers, create lifecycle artifacts, or perform
delivery actions. Treat summaries and worker output as candidate evidence.
