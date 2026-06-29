# Goal: Add Language-Aware Command Output

Spec: `docs/superpowers/specs/2026-06-21-language-aware-command-output-design.md`
Status: Draft goal handoff; execute only after the spec is confirmed by the user.

## Source Task

- `tasks.md`: `P1 Add language-aware command output`

## Read First

1. `AGENTS.md`
2. `docs/superpowers/specs/2026-06-21-language-aware-command-output-design.md`
3. `tasks.md`
4. `.agent-harness/config.json`
5. `.agent-harness/status.md`
6. `plugins/agent-harness/scripts/agent-harness.mjs`
7. `plugins/agent-harness/templates/config.json`
8. `plugins/agent-harness/skills/*/SKILL.md`
9. `README.md`
10. `docs/install.md`

## Work Mode Recommendation

Use `worktree` for implementation if the main checkout is still dirty with unrelated backlog/status/goal edits. Use `local` only if the checkout is clean or the only pending edits are explicitly part of this goal and the user wants foreground work.

Reason: the change touches CLI behavior, docs, templates, and skill instructions, and should stay easy to review separately from current harness bookkeeping edits.

## Scope

- Add deterministic language resolution for the CLI:
  - `--lang <code>`
  - `AGENT_HARNESS_LANG`
  - optional `.agent-harness/config.json` `language.default`
  - system locale
  - fallback `en`
- Localize human-facing output for `doctor`, `init`, and help/usage.
- Keep `print-contract` JSON output stable and untranslated.
- Preserve machine output, paths, commands, file names, package names, skill names, API names, model names, abbreviations, and Git commit messages in English.
- Update skill instructions so Codex reports in the user's language.
- Document the language selection behavior.

## Non-Goals

- Do not build a full i18n framework.
- Do not localize generated `tasks.md` or `.agent-harness/status.md` templates unless the confirmed spec is updated.
- Do not change the core Agent Harness file contract.
- Do not deploy, publish, push, or open a PR unless separately requested.

## Verification

Run:

```bash
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang en
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN
AGENT_HARNESS_LANG=zh-CN node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .
```

Also verify `init` in a temporary directory:

```bash
tmpdir="$(mktemp -d)"
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd "$tmpdir" --project-name demo --lang zh-CN
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd "$tmpdir" --lang zh-CN
```

## Completion Conditions

- CLI user-facing output switches correctly between `en` and `zh-CN`.
- Existing English behavior remains semantically stable.
- Unknown language codes fall back to `en`.
- `print-contract` remains stable JSON.
- Documentation describes language precedence and examples.
- `npm run validate:plugin` passes.
- `tasks.md` and `.agent-harness/status.md` are updated after implementation.

## Pause Conditions

- The spec has not been confirmed by the user.
- The implementation requires changing generated template language behavior.
- Existing downstream project configs would need a migration.
- A third-party i18n dependency seems necessary.
- The work requires credentials, paid services, production access, destructive commands, push, PR, or release.
- User gives new instructions that conflict with this goal or the spec.
