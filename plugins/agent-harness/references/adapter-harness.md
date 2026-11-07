# Adapter Harness

An adapter declares project-specific task, status, Spec, Goal and Milestone
paths, preflight, state-sync and completion gates. Core remains project-neutral.

All writes stay inside the configured project and target roots. Reject absolute
or `..` paths and symlink escapes. Acceptance references stay inside configured
Goal, Spec or Milestone roots.

Legacy `paths.runs`, `paths.gateRecords`, `artifactPolicy.runs`,
`artifactPolicy.retention` and `checkpoint` are ignored during migration. New
configuration omits them. Host sessions, workers, resume and full logs are not
Harness state.

Completion gates apply to accepted Goal/Milestone delivery, not ordinary direct
work. Their evidence is a concise, concrete result such as reviewed files and
commands/results, never a Run receipt or source snapshot.

Status is a bounded current projection. Task compaction archives old completed
entries; it does not inspect old Runs or revalidate historical code.
