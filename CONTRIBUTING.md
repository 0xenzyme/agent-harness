# Contributing

Thanks for helping improve Agent Harness. This repository is the harness
source and the local plugin marketplace. Behavior changes should keep the
README, workflow skills, templates, CLI gates, and project contract docs
aligned.

By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Reports

- Product defects and feature requests use the GitHub issue templates.
- Suspected vulnerabilities go through
  [private vulnerability reporting](https://github.com/0xenzyme/agent-harness/security/advisories/new).
  Do not open a public issue that contains exploit details. See
  [SECURITY.md](SECURITY.md).

## Local checks

Node.js 22 or newer. The package has no runtime dependencies.

```bash
npm ci
git diff --check
npm run test:all
npm run validate:plugin:local
```

`npm run validate:plugin` runs the official Codex plugin validator when that
tool is installed. A missing validator is an environment error. The portable
integrity check is `npm run validate:plugin:local`.

Pull requests run `npm run test:all` and `npm run validate:plugin:local` in
GitHub Actions.

## Changes

- Describe the user-visible outcome in the pull request, then the verification
  you ran.
- Keep `README.md` as the canonical English homepage. Update
  `README.zh-CN.md` when the same user-facing copy changes.
- Do not add network services, persistent daemons, or project-specific
  assumptions from one downstream repository into the core contract.
- `harness/` and `.harness/` are development state for this repository. They
  are not installed plugin content.

## Maintainers

Repository ownership is declared in [`.github/CODEOWNERS`](.github/CODEOWNERS).
