# Gate Results

A gate result identifies the accepted objective, reviewed files, actual
commands/results or manual decision, and any remaining risk. The outcome owner
accepts it only after checking whole-target constraints and required checklist
items.

Gates apply to Goal/Milestone completion, not direct work or lightweight
postflight updates. They do not require a Run, receipt, hash, copied log,
checkpoint or worker lifecycle record.

Later source changes do not invalidate an accepted gate. New changes receive
their own relevant verification without comparing old snapshots.
