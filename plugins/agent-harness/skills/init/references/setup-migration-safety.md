# Setup And Migration Safety

Audit existing config, adapter docs, Goal index, status, Specs, Goals, Runs, and
mental-model paths before mutation. Preview imports with `--dry-run --json`,
preserve existing artifacts, and never create a second Goal index.

Canonical output writes current config fields. Read documented legacy aliases
for one migration boundary and fail when canonical and legacy values conflict.
Validate every planned write against the project root, its configured root, and
the nearest existing parent's realpath before writing any file.
