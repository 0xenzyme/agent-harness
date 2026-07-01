#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const ruleAnchors = [
  {
    id: "harness-rule:gate-only-controller",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "plugins/agent-harness/references/gate-results.md",
      "plugins/agent-harness/skills/execute/SKILL.md"
    ]
  },
  {
    id: "harness-rule:local-delivery-ceiling",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "plugins/agent-harness/skills/execute/SKILL.md",
      "plugins/agent-harness/skills/execute/references/completion-evidence.md",
      "plugins/agent-harness/templates/goal.md"
    ]
  },
  {
    id: "harness-rule:worker-surface-default",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "plugins/agent-harness/references/worker-runner-contract.md",
      "plugins/agent-harness/templates/worker-prompt.md"
    ]
  },
  {
    id: "harness-rule:project-neutral-core",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "plugins/agent-harness/references/adapter-harness.md",
      "plugins/agent-harness/templates/goal.md"
    ]
  },
  {
    id: "harness-rule:state-sync-evidence",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "plugins/agent-harness/references/gate-results.md",
      "plugins/agent-harness/skills/execute/references/completion-evidence.md",
      "plugins/agent-harness/templates/worker-prompt.md"
    ]
  }
];

const matrixLinkExpectations = [
  ["README.md", "docs/HARNESSES.md"],
  ["README.zh-CN.md", "docs/HARNESSES.md"],
  ["docs/install.md", "HARNESSES.md"],
  ["docs/install.zh-CN.md", "HARNESSES.md"],
  ["docs/cli.md", "HARNESSES.md"],
  ["docs/cli.zh-CN.md", "HARNESSES.md"],
  ["docs/project-contract.md", "HARNESSES.md"]
];

const presentationExpectations = [
  ["README.md", "docs/assets/github/social-preview.svg"],
  ["README.md", "docs/github-presentation.md"],
  ["README.md", "CHANGELOG.md"],
  ["README.md", "docs/releases/v0.4.0.md"],
  ["README.zh-CN.md", "docs/assets/github/social-preview.svg"],
  ["README.zh-CN.md", "docs/github-presentation.md"],
  ["README.zh-CN.md", "CHANGELOG.md"],
  ["README.zh-CN.md", "docs/releases/v0.4.0.md"],
  ["docs/github-presentation.md", "Adapter-driven control plane for Codex and coding-agent work"],
  ["docs/github-presentation.md", "codex-plugin"],
  ["docs/github-presentation.md", "workflow-automation"],
  ["docs/github-presentation.md", "docs/assets/github/social-preview.svg"],
  ["CHANGELOG.md", "## 0.4.0 - 2026-07-02"],
  ["docs/releases/v0.4.0.md", "Agent Harness v0.4.0"],
  ["docs/assets/github/social-preview.svg", "Tasks"],
  ["LICENSE", "MIT License"]
];

const suites = {
  presentation: {
    description: "GitHub README, social preview, changelog, release notes, and repo metadata guidance.",
    command: "npm run test:presentation"
  },
  protocol: {
    description: "Stable protocol anchors, capability matrix, and suite routing.",
    command: "npm run test:protocol"
  },
  smoke: {
    description: "CLI, adapter contract, template, and generated packet behavior.",
    command: "npm run test:smoke"
  },
  eval: {
    description: "Agent Harness evaluation fixtures and transcript rubric.",
    command: "npm run test:eval"
  },
  plugin: {
    description: "Installable plugin manifest, skills, templates, and references.",
    command: "npm run validate:plugin"
  }
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readRepoFile(path) {
  const absolutePath = join(repoRoot, path);
  assert(existsSync(absolutePath), `Missing required file: ${path}`);
  return readFileSync(absolutePath, "utf8");
}

function assertIncludesFile(path, needle, message) {
  const content = readRepoFile(path);
  assert(content.includes(needle), message || `${path} must include ${needle}`);
}

function checkProtocol() {
  assertIncludesFile("package.json", "\"test:protocol\"", "package.json must expose test:protocol");
  assertIncludesFile("package.json", "\"test:presentation\"", "package.json must expose test:presentation");
  assertIncludesFile("package.json", "\"test:all\"", "package.json must expose test:all");
  assertIncludesFile("docs/HARNESSES.md", "Agent Harness Capability Matrix");

  for (const rule of ruleAnchors) {
    for (const file of rule.files) {
      assertIncludesFile(file, rule.id, `${file} must include stable protocol anchor ${rule.id}`);
    }
  }

  for (const [file, needle] of matrixLinkExpectations) {
    assertIncludesFile(file, needle, `${file} must link the capability matrix`);
  }

  console.log("Protocol checks passed.");
}

function checkPresentation() {
  for (const [file, needle] of presentationExpectations) {
    assertIncludesFile(file, needle, `${file} must include presentation marker ${needle}`);
  }
  console.log("Presentation checks passed.");
}

function runNpmScript(name) {
  const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
  execFileSync(npmBin, ["run", name], {
    cwd: repoRoot,
    stdio: "inherit"
  });
}

function printSuites() {
  console.log("Agent Harness test suites:");
  for (const [name, suite] of Object.entries(suites)) {
    console.log(`- ${name}: ${suite.command} - ${suite.description}`);
  }
  console.log("- all: npm run test:all - Runs presentation, protocol, and smoke suites.");
}

const mode = process.argv[2] || "--list";

if (mode === "--list" || mode === "list") {
  printSuites();
} else if (mode === "protocol") {
  checkProtocol();
} else if (mode === "presentation") {
  checkPresentation();
} else if (mode === "all") {
  checkPresentation();
  checkProtocol();
  runNpmScript("test:smoke");
} else {
  throw new Error(`Unknown suite mode: ${mode}`);
}
