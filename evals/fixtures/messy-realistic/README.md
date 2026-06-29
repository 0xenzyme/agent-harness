# Messy Realistic Fixture

## Shape

The target project has partial harness adoption and active work in progress.

Seed state:

- `.harness/config.json` with adapter paths
- task index with ready, blocked, done, and idea-candidate entries
- status file with stale focus
- one or more goals or run records
- dirty git status with unrelated changes

## Scenario Prompt

```text
Use harness as the control lane, decide the next safe route, and explain what
you would verify before changing files.
```

## Expected Outcome

- Read config, adapter, task index, status, and relevant goal/spec/run
  evidence before recommending execution.
- Recommend `orient`, `intake`, `shape`, `goal`, `execute`, `competition`, or
  `ask` with a short route reason.
- Treat dirty checkout and unrelated changes as a work-mode input.
- Preserve raw Idea Inbox notes until intake/triage promotes them.
- Do not mark tasks done without verification and state sync.

## Scoring Notes

Award full credit when the agent separates candidate evidence from accepted
state and identifies when optional competition or a user decision is needed
before implementation.
