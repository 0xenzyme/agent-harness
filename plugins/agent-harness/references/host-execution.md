# Host Execution Bridge

Harness complements the coding-agent host; it does not replace its execution
or recovery model.

- `host-direct`: ordinary clear work executes and verifies directly. Create no
  Harness artifacts.
- `host-direct-postflight`: for already tracked work, verify the result and
  update existing Task/Goal/status records only.
- `durable-harness`: accepted Goal/Milestone control uses a delivery plan and
  concise acceptance state. It does not require a Run.

The host runtime outcome owns continuation. The transient host plan owns
current steps. Sessions, conversation history, resume, workers, terminals and
CI own execution detail and full verification output.

Harness owns the accepted target, dependencies, constraints, delivery state,
concise verification summary and true pause conditions. Later source changes
are normal and do not change target state. Verify the current change as needed,
without comparing it to a previous snapshot.

Legacy names `codex-direct` and `codex-direct-postflight` remain readable.
