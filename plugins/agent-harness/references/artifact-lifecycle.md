# Artifact Lifecycle

Harness control artifacts have different lifetimes:

- status is a bounded replace-in-place current snapshot;
- the active Goal index contains actionable work plus a configured recent-Done
  window;
- task archives, Goals, milestones, and owning-domain documents retain durable
  conclusions;
- Runs contain execution detail and may be tracked or local-only.

Configure `artifactPolicy` to declare Run tracking, retention, bounded status,
task archive, and durable evidence paths. Policy limits are advisory until an
explicit lifecycle command is used.

`artifacts inspect` is always read-only. `artifacts compact` is preview-only
unless `--record` is passed; recording writes exact task blocks to the archive
before replacing the active index. `artifacts prune` is preview-only unless
`--apply` is passed; apply is allowed only for `local-only` Runs, skips active
or unmanaged Runs, honors retention and `keepLatest`, stays inside `paths.runs`,
and requires a Goal that references the Run and contains State Sync Notes.

Inspection classifies every Run entry as operational `active`, known
`terminal`, or `unmanaged`. Legacy Markdown files, directories without a
status record, invalid status records, and unknown phases are `unmanaged`; they
remain preserved but do not inflate the operational active count. A legacy
`status` field is accepted as a phase fallback for one migration boundary.

A local-only Run path is a locator, not durable evidence by itself. Before
pruning, configured durable evidence must retain the accepted conclusion, verification
summary, and any audit reference needed after the raw Run disappears.
