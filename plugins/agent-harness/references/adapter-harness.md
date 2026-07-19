# Adapter Harness

An adapter declares project-specific artifact roots, preflight, state-sync, and
completion gates. Plugin core defines the durable protocol and remains
project-neutral.

Completion gates are durable Goal/Run gates. Ordinary Codex-direct work and
bounded postflight-only updates do not inherit them. A prepared enforced Run
still requires its DAG, checklist, gate, and evidence contract.

Before any write, resolve the configured project root and target root, reject
absolute or `..` paths, then validate the nearest existing parent's realpath so
symlinks cannot escape. Goal paths stay under `paths.goals`, specs under
`paths.specs`, Run arguments under `paths.runs`, and DAG artifacts under their
Run.

Canonical config writes `contract`, canonical `paths`,
`worktree.defaultPolicy`, `gates.requiredForCompletion`, and `gates.blocking`.
Read legacy aliases for one migration boundary and fail when old and new values
conflict.

Durable Runs record start Git state, DAG ready state, ownership, verification,
candidate evidence, and accepted gate/state-sync results. Scheduling and model
selection belong to the Codex runtime.

Runtime Goal owns the active long-running outcome and Codex Plan owns transient
steps. Postflight sync updates only existing adapter-declared state and creates
no lifecycle solely for bookkeeping.
