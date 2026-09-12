# Worktree Policy

Canonical config contains only:

```json
{ "worktree": { "defaultPolicy": "local|worktree|ask" } }
```

The CLI reports observable Git state (repository, dirty paths, and worktree
count) and applies `defaultPolicy`. Legacy `workMode.defaultPolicy` remains
readable for one migration boundary; conflicting legacy and canonical values
fail. Canonical output writes only `worktree.defaultPolicy`.

Before creating, forking, or handing off a thread, or delegating a worker,
resolve work mode from the current user instruction, `AGENTS.md`, the accepted
Spec/Goal, and `.harness/config.json`. Run `worktree recommend` for a
Harness-managed project. An unresolved `ask` result or conflict between those
sources pauses for user direction before runtime delegation.

Authorization to create a session or worker is not authorization to create a worktree.
Do not pass host-specific starting checkout or session state unless the current
user explicitly requests that specific state. Parallel-writer isolation is a reason
to ask; it does not override an unresolved work-mode decision.

Harness does not claim automatic worktree rules that the runtime cannot
observe or enforce.
