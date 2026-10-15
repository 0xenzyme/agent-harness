# Agent Harness plugin

[简体中文项目说明](https://github.com/0xenzyme/agent-harness/blob/main/README.zh-CN.md)

This directory is the installable `harness` plugin. The repository
[README](https://github.com/0xenzyme/agent-harness/blob/main/README.md) is the
project homepage. Install details live in
[docs/install.md](https://github.com/0xenzyme/agent-harness/blob/main/docs/install.md).

## Install

From a checkout of this repository:

```bash
codex plugin marketplace add <path-to-agent-harness-repo>
```

That registers marketplace metadata. It does not install the plugin by itself.
Grok can install the same package from `.grok-plugin/marketplace.json`.

To adopt Harness in another project:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd <project> --contract adapter
node plugins/agent-harness/scripts/agent-harness.mjs skills install --cwd <project>
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd <project>
```

## Usage

Ask the current host to use Harness, or call a skill when the route is already known:

| Situation | Skill |
| --- | --- |
| Adopt Harness, import a Goal index, run doctor, or preview activation | `harness:init` |
| Inspect status, blockers, or the next route without mutation | `harness:orient` |
| Capture an idea, requirement, bug, or inbox note | `harness:intake` |
| Control durable work, or sync Harness state after the host finishes simple work | `harness:execute` |

Ordinary clear change requests stay with the current host.

## Operational constraints

The plugin runs locally in the project you choose. It does not start a network
service, and the manifest does not declare hooks. Skills install into the
downstream project's `.agents/skills/` directory.

Report suspected vulnerabilities through [SECURITY.md](SECURITY.md). Privacy
expectations are in [PRIVACY.md](PRIVACY.md). Use of the software is governed
by the [MIT License](LICENSE).
