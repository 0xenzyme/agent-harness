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
- Prefer dry-run import for existing projects.
- Print activation snippets; do not edit `AGENTS.md` automatically.
- Preserve existing task indexes such as `todolist.md`.

## Stop Conditions

Pause when setup would overwrite existing files, change activation behavior,
create duplicate task indexes, or conflict with the existing contract.
