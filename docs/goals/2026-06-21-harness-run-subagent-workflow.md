# Goal: Add Harness Run And Subagent Workflow

Spec: `docs/superpowers/specs/2026-06-21-harness-run-subagent-workflow-design.md`
Status: Draft goal handoff; execute only after the spec is confirmed by the user.

## Source Task

- `tasks.md`: `P1 Add run workflow and subagent task splits`

## Read First

1. `AGENTS.md`
2. `docs/superpowers/specs/2026-06-21-harness-run-subagent-workflow-design.md`
3. `tasks.md`
4. `.agent-harness/config.json`
5. `.agent-harness/status.md`
6. `docs/project-contract.md`
7. `docs/mental-model.md`
8. `docs/worktree-policy.md`
9. `plugins/agent-harness/scripts/agent-harness.mjs`
10. `plugins/agent-harness/templates/tasks.md`
11. `plugins/agent-harness/templates/status.md`
12. `plugins/agent-harness/skills/harness-goal/SKILL.md`
13. `plugins/agent-harness/skills/harness-tasks/SKILL.md`
14. `README.md`

## Work Mode Recommendation

Use `worktree` for implementation if the main checkout still has the current draft spec/goal/task/status edits.

Reason: this goal changes CLI behavior, docs, templates or skill guidance, and may add a new run directory contract. Keeping implementation in a worktree prevents mixing product design drafts with code changes.

Use `ask` before implementing direct Codex execution, because the stable command surface for launching a new Codex `/goal` run must be verified first.

## Scope

- Add a convenient workflow for going from generated goal prompt to an executable run packet.
- Keep the distinction clear:
  - `goal`: create durable handoff under the configured goals directory.
  - `run`: prepare or execute one handoff under `.agent-harness/runs/`.
- Add `agent-harness run prepare --goal <goal-file> --cwd <project>`.
- Add or design `agent-harness goal create --task <title-or-id> --cwd <project>` if it does not already exist.
- Generate a run packet with:
  - `run.md`
  - `prompt.md`
  - `subagents.md`
  - `status.json`
  - `logs/`
- Add subagent split guidance for `small`, `medium`, `large`, and `ask` tasks.
- Update docs to explain `init -> tasks -> goal -> run prepare -> execute -> verify -> update tasks/status`.

## Non-Goals

- Do not add a daemon or persistent service.
- Do not automatically spawn background Codex sessions in fixed.
- Do not auto-create worktrees without following the project worktree policy.
- Do not push, deploy, publish, or open a PR.
- Do not hard-code assumptions from one downstream repo into the core harness.

## Expected Workflow

1. User runs `harness-goal` or `agent-harness goal create`.
2. The harness writes `docs/goals/YYYY-MM-DD-<slug>.md`.
3. User runs `agent-harness run prepare --goal docs/goals/YYYY-MM-DD-<slug>.md`.
4. The harness writes `.agent-harness/runs/<timestamp>-<slug>/`.
5. User opens `prompt.md` in a new Codex session or `/goal`.
6. Main agent uses `subagents.md` to decide whether to spawn explorer/worker/verification agents.
7. Run output and verification notes are recorded under the run directory.
8. When done, `tasks.md` and `.agent-harness/status.md` are updated.

## Verification

Run:

```bash
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .
node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd . --goal docs/goals/2026-06-21-language-aware-command-output.md
```

Then verify the generated run packet:

```bash
find .agent-harness/runs -maxdepth 2 -type f | sort
```

Use a temporary project for non-destructive contract checks:

```bash
tmpdir="$(mktemp -d)"
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd "$tmpdir" --project-name demo
mkdir -p "$tmpdir/docs/goals"
cp docs/goals/2026-06-21-language-aware-command-output.md "$tmpdir/docs/goals/language-aware-command-output.md"
node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd "$tmpdir" --goal "$tmpdir/docs/goals/language-aware-command-output.md"
```

## Completion Conditions

- `agent-harness run prepare` creates a deterministic run packet under `.agent-harness/runs/`.
- The run packet contains a ready-to-use `prompt.md` and a bounded `subagents.md`.
- `subagents.md` gives clear ownership, expected output, and stop conditions for each suggested subtask.
- Small tasks do not force subagent usage.
- Docs explain which step is manual today and what the convenient CLI path is.
- Existing `init`, `doctor`, and `print-contract` continue to work.
- `npm run validate:plugin` passes.
- `tasks.md` and `.agent-harness/status.md` are updated after implementation.

## Pause Conditions

- The spec has not been confirmed by the user.
- Stable Codex CLI invocation for direct execution cannot be verified.
- A direct run command would require hidden UI automation or brittle terminal control.
- Subagent splitting would create overlapping file ownership or unclear merge responsibility.
- Work requires credentials, paid APIs, production access, destructive commands, push, PR, or release.
- User gives new instructions that conflict with this goal or the spec.
