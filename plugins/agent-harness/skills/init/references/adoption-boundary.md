# Adoption Boundary

Use this reference when setup, adoption, import, or activation could affect an
existing project.

## Owns

- new harness initialization
- existing-project config import
- activation snippet preview
- setup audit and repair checks
- preserving fixed-contract or adapter-contract paths

## Does Not Own

- read-only next-route orientation
- rough idea capture
- confirmed implementation
- project-specific policy invention

## Safe Defaults

- Run `doctor` first.
- Inspect and validate config before writing.
- Treat audit, doctor, and activation-preview requests as read-only unless the
  user explicitly asks to initialize, import, or repair harness files.
- Prefer dry-run import for existing projects.
- Print activation snippets; do not edit `AGENTS.md` automatically.
- Preserve existing Goal indexes such as `todolist.md`.

## Stop Conditions

Pause when setup would write files without explicit setup intent, overwrite
existing files, change activation behavior, create duplicate Goal indexes, or
conflict with the existing contract.
