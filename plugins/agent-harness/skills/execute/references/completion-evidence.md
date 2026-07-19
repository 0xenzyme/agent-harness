# Completion Evidence

Durable completion requires concrete changed/reviewed files, verification
commands and results, required checklist and gate evidence, Run/DAG evidence,
run-scoped Delivery State, and verified State Sync Notes.

Adversarially check that the accepted objective is not larger than the local
artifact, all dependencies and configured roots were respected, evidence is
fresh, required nodes and gates are complete, and candidate worker output was
validated by the accepted-state owner. Local build or test success alone does
not prove commit, push, review, integration, release, deploy, or whole-
Milestone completion.

Postflight-only synchronization is narrower: verify the completed result, then
update only state that existed before execution with the observed outcome,
verification, actual Delivery State, and remaining tracked gap. Do not create a
Goal, Run, DAG, gate, or status artifact solely for postflight bookkeeping.
Durable required gates do not apply unless the work closes a durable Goal/Run;
an existing enforced Run still requires its full recorded evidence.
