# Worker Runner Contract

The host owns delegation, concurrency, cancellation, model selection and worker
liveness. Harness does not record worker state or reproduce host resume.

Give workers only their accepted scope, dependencies, constraints and required
verification. Resolve worktree/local mode before delegation. Do not start a
dependent until its required outcome is accepted.

Workers return changed files, a result summary, actual commands/results, risks,
remaining work and true user decisions. This is candidate output, not accepted
completion. The controller reviews it against the whole target and updates the
existing acceptance/status records when satisfied.

Do not require receipt files, hash maps, copied logs, timestamps tied to a Run,
checkpoint revisions or candidate-versus-reviewed JSON artifacts. Full output
stays in the host session, terminal or CI.
