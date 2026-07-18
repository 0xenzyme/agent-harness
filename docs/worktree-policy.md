# Worktree Policy

Canonical config contains only:

```json
{ "worktree": { "defaultPolicy": "local|worktree|ask" } }
```

The CLI reports observable Git state (repository, dirty paths, and worktree
count) and applies `defaultPolicy`. Legacy `workMode.defaultPolicy` remains
readable for one migration boundary; conflicting legacy and canonical values
fail. Canonical output writes only `worktree.defaultPolicy`.

Harness does not claim automatic worktree rules that the runtime cannot
observe or enforce.
