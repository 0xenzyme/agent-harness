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
    id: "harness-rule:terminology-boundary",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "plugins/agent-harness/references/task-routing.md",
      "plugins/agent-harness/templates/goal.md"
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
    id: "harness-rule:child-controller-boundary",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "plugins/agent-harness/references/controller-communication.md",
      "plugins/agent-harness/references/task-routing.md",
      "plugins/agent-harness/templates/goal.md"
    ]
  },
  {
    id: "harness-rule:degraded-execution-provenance",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "plugins/agent-harness/references/worker-runner-contract.md",
      "plugins/agent-harness/references/controller-communication.md",
      "plugins/agent-harness/references/gate-results.md",
      "plugins/agent-harness/skills/execute/SKILL.md",
      "plugins/agent-harness/templates/worker-prompt.md",
      "plugins/agent-harness/scripts/agent-harness.mjs"
    ]
  },
  {
    id: "harness-rule:controller-cancellation-boundary",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "plugins/agent-harness/references/worker-runner-contract.md",
      "plugins/agent-harness/references/controller-communication.md",
      "plugins/agent-harness/references/gate-results.md",
      "plugins/agent-harness/references/task-routing.md",
      "plugins/agent-harness/skills/execute/SKILL.md",
      "plugins/agent-harness/templates/worker-prompt.md",
      "plugins/agent-harness/scripts/agent-harness.mjs"
    ]
  },
  {
    id: "harness-rule:need-user-digest",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "plugins/agent-harness/references/controller-communication.md",
      "plugins/agent-harness/skills/execute/SKILL.md",
      "plugins/agent-harness/skills/execute/references/user-facing-closeout.md",
      "plugins/agent-harness/templates/goal.md"
    ]
  },
  {
    id: "harness-rule:bounded-status-snapshot",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "plugins/agent-harness/skills/execute/SKILL.md",
      "plugins/agent-harness/templates/status.md",
      "plugins/agent-harness/scripts/agent-harness.mjs"
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
  },
  {
    id: "harness-rule:level-0-fast-path",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "plugins/agent-harness/references/task-routing.md",
      "plugins/agent-harness/skills/execute/SKILL.md"
    ]
  },
  {
    id: "harness-rule:bounded-direct-execution",
    files: [
      "README.md",
      "README.zh-CN.md",
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "plugins/agent-harness/references/route-entry-mapping.md",
      "plugins/agent-harness/references/task-routing.md",
      "plugins/agent-harness/skills/execute/SKILL.md",
      "plugins/agent-harness/skills/execute/references/completion-evidence.md",
      "plugins/agent-harness/skills/execute/references/routing-boundaries.md",
      "plugins/agent-harness/templates/goal.md",
      "plugins/agent-harness/scripts/agent-harness.mjs"
    ]
  },
  {
    id: "harness-rule:context-focus-routing",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "plugins/agent-harness/references/task-routing.md",
      "plugins/agent-harness/templates/goal.md",
      "plugins/agent-harness/templates/worker-prompt.md"
    ]
  },
  {
    id: "harness-rule:cybernetic-stability",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "docs/cybernetic-stability.md",
      "plugins/agent-harness/references/task-routing.md",
      "plugins/agent-harness/skills/execute/SKILL.md",
      "plugins/agent-harness/templates/goal.md",
      "plugins/agent-harness/templates/spec.md",
      "plugins/agent-harness/templates/worker-prompt.md",
      "plugins/agent-harness/scripts/agent-harness.mjs",
      "README.md",
      "README.zh-CN.md"
    ]
  },
  {
    id: "harness-rule:intent-setpoint-selection",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "docs/cybernetic-stability.md",
      "plugins/agent-harness/references/task-routing.md",
      "plugins/agent-harness/skills/orient/SKILL.md",
      "plugins/agent-harness/skills/intake/SKILL.md",
      "plugins/agent-harness/skills/execute/SKILL.md",
      "plugins/agent-harness/templates/goal.md",
      "plugins/agent-harness/templates/spec.md",
      "plugins/agent-harness/templates/worker-prompt.md",
      "plugins/agent-harness/scripts/agent-harness.mjs"
    ]
  },
  {
    id: "harness-rule:sensor-freshness",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "docs/cybernetic-stability.md",
      "plugins/agent-harness/references/task-routing.md",
      "plugins/agent-harness/skills/orient/SKILL.md",
      "plugins/agent-harness/skills/intake/SKILL.md",
      "plugins/agent-harness/skills/execute/SKILL.md",
      "plugins/agent-harness/templates/goal.md",
      "plugins/agent-harness/templates/spec.md",
      "plugins/agent-harness/templates/worker-prompt.md",
      "plugins/agent-harness/scripts/agent-harness.mjs"
    ]
  },
  {
    id: "harness-rule:measurement-snapshot",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "docs/cybernetic-stability.md",
      "plugins/agent-harness/references/task-routing.md",
      "plugins/agent-harness/skills/orient/SKILL.md",
      "plugins/agent-harness/skills/execute/SKILL.md",
      "plugins/agent-harness/templates/goal.md",
      "plugins/agent-harness/templates/spec.md",
      "plugins/agent-harness/templates/worker-prompt.md",
      "plugins/agent-harness/scripts/agent-harness.mjs"
    ]
  },
  {
    id: "harness-rule:remaining-gap",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "docs/cybernetic-stability.md",
      "plugins/agent-harness/references/task-routing.md",
      "plugins/agent-harness/skills/orient/SKILL.md",
      "plugins/agent-harness/skills/intake/SKILL.md",
      "plugins/agent-harness/skills/execute/SKILL.md",
      "plugins/agent-harness/templates/goal.md",
      "plugins/agent-harness/templates/spec.md",
      "plugins/agent-harness/templates/worker-prompt.md",
      "plugins/agent-harness/scripts/agent-harness.mjs"
    ]
  },
  {
    id: "harness-rule:feedback-quality",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "docs/cybernetic-stability.md",
      "plugins/agent-harness/references/task-routing.md",
      "plugins/agent-harness/skills/orient/SKILL.md",
      "plugins/agent-harness/skills/intake/SKILL.md",
      "plugins/agent-harness/skills/execute/SKILL.md",
      "plugins/agent-harness/templates/goal.md",
      "plugins/agent-harness/templates/spec.md",
      "plugins/agent-harness/templates/worker-prompt.md",
      "plugins/agent-harness/scripts/agent-harness.mjs"
    ]
  },
  {
    id: "harness-rule:stability-saturation",
    files: [
      "docs/HARNESSES.md",
      "docs/project-contract.md",
      "docs/cybernetic-stability.md",
      "plugins/agent-harness/references/task-routing.md",
      "plugins/agent-harness/skills/orient/SKILL.md",
      "plugins/agent-harness/skills/intake/SKILL.md",
      "plugins/agent-harness/skills/execute/SKILL.md",
      "plugins/agent-harness/templates/goal.md",
      "plugins/agent-harness/templates/spec.md",
      "plugins/agent-harness/templates/worker-prompt.md",
      "plugins/agent-harness/scripts/agent-harness.mjs"
    ]
  }
];

const level0FastPathExpectations = [
  ["docs/HARNESSES.md", "Level 0 Fast Path"],
  [
    "docs/project-contract.md",
    "direct execution requires `implementer` or explicitly accepted `mixed`"
  ],
  [
    "plugins/agent-harness/references/task-routing.md",
    "direct execution requires `implementer` or explicitly accepted `mixed`"
  ],
  ["plugins/agent-harness/references/task-routing.md", "skip spec/goal/run/worker"],
  ["plugins/agent-harness/references/task-routing.md", "existing Harness Goal/Run"],
  ["plugins/agent-harness/references/task-routing.md", "adapter-required gate"],
  ["plugins/agent-harness/references/task-routing.md", "Delivery State"],
  ["plugins/agent-harness/references/task-routing.md", "Need user"],
  ["plugins/agent-harness/references/task-routing.md", "Remaining"],
  ["plugins/agent-harness/skills/execute/SKILL.md", "gate-only` cannot use Level 0"]
];

const contextFocusRoutingExpectations = [
  ["docs/HARNESSES.md", "harness-rule:context-focus-routing"],
  ["docs/project-contract.md", "remains an internal design reference only"],
  ["docs/project-contract.md", "First normalize user intent to `Milestone`"],
  ["docs/project-contract.md", "then choose the smallest useful context focus"],
  [
    "plugins/agent-harness/references/task-routing.md",
    "normalize intent before choosing context"
  ],
  [
    "plugins/agent-harness/references/task-routing.md",
    "First map the request to `Milestone`, `Goal`, `Task`, `Run`,"
  ],
  [
    "plugins/agent-harness/references/task-routing.md",
    "`Priority`, or `Spec`; then select the focus preset"
  ],
  ["plugins/agent-harness/templates/goal.md", "harness-rule:context-focus-routing"],
  ["plugins/agent-harness/templates/worker-prompt.md", "harness-rule:context-focus-routing"]
];

const cyberneticStabilityExpectations = [
  ["docs/cybernetic-stability.md", "intent -> setpoint -> sensor -> measurement -> gap -> controller -> action -> feedback"],
  ["docs/project-contract.md", "target, observed state, evidence, conflicts or stale artifacts"],
  ["plugins/agent-harness/references/task-routing.md", "Cybernetic Stability Routing"],
  ["plugins/agent-harness/references/task-routing.md", "If no gap shrank, route to verification"],
  ["plugins/agent-harness/references/task-routing.md", "advisory feedback as completion evidence"],
  ["plugins/agent-harness/templates/goal.md", "## Cybernetic Stability"],
  ["plugins/agent-harness/templates/spec.md", "## Cybernetic Stability"],
  ["plugins/agent-harness/templates/worker-prompt.md", "gap closed, remaining gap"],
  ["plugins/agent-harness/scripts/agent-harness.mjs", "cyberneticStabilityGuidance"],
  ["plugins/agent-harness/scripts/agent-harness.mjs", "observed state, evidence, stale/conflict risks"]
];

const degradedExecutionProvenanceExpectations = [
  ["docs/HARNESSES.md", "actual execution method, unavailable surface, fallback reason"],
  ["docs/project-contract.md", "skips `codex-cli-subagent`"],
  ["plugins/agent-harness/references/worker-runner-contract.md", "candidate-evidence boundary, and verification evidence"],
  ["plugins/agent-harness/references/controller-communication.md", "Silent fallback is not accepted completion evidence"],
  ["plugins/agent-harness/references/gate-results.md", "compensating verification before accepting"],
  ["plugins/agent-harness/references/worker-runner-contract.md", "record visible\nprovenance instead of presenting the result as normal delegated execution"],
  ["plugins/agent-harness/templates/worker-prompt.md", "degraded execution provenance when applicable"],
  ["plugins/agent-harness/scripts/agent-harness.mjs", "degradedExecutionProvenanceGuidance"]
];

const publicFocusOption = ["--", "focus"].join("");
const publicFocusOptionSurfaces = [
  "plugins/agent-harness/scripts/agent-harness.mjs",
  "docs/cli.md",
  "docs/cli.zh-CN.md",
  "plugins/agent-harness/schemas/config.schema.json"
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

const languagePolicyExpectations = [
  ["README.md", "Current boundary: this setting localizes supported human-facing CLI messages"],
  ["README.zh-CN.md", "当前边界：该设置只会本地化已经支持的 human-facing CLI messages"],
  ["docs/install.md", "--lang -> AGENT_HARNESS_LANG -> language.default -> LC_ALL -> LC_MESSAGES -> LANG -> en"],
  ["docs/install.zh-CN.md", "`--lang` 不会翻译这些文件"],
  ["docs/cli.md", "generated artifact bodies currently use English templates/renderers"],
  ["docs/cli.zh-CN.md", "Deterministic CLI 的 `auto` 读取 process locale"],
  ["docs/project-contract.md", "## Adapter Language Policy"],
  ["plugins/agent-harness/references/adapter-harness.md", "supported human-facing CLI messages only"],
  ["plugins/agent-harness/templates/adapter.md", "## Language Policy"],
  ["plugins/agent-harness/schemas/config.schema.json", "not generated artifact bodies"]
];

const presentationExpectations = [
  ["README.md", "docs/assets/readme/adapter-model.svg"],
  ["README.md", "docs/assets/readme/adapter-artifact-map.svg"],
  ["README.md", "docs/assets/readme/adapter-execution-model.svg"],
  ["README.md", "## Use With A Coding Agent"],
  ["README.md", "docs/github-presentation.md"],
  ["README.md", "CHANGELOG.md"],
  ["README.md", "docs/releases/v0.6.0.md"],
  ["README.md", "docs/cybernetic-stability.md"],
  ["README.zh-CN.md", "docs/assets/readme/adapter-model.svg"],
  ["README.zh-CN.md", "docs/assets/readme/adapter-artifact-map.svg"],
  ["README.zh-CN.md", "docs/assets/readme/adapter-execution-model.svg"],
  ["README.zh-CN.md", "## 在项目中怎么用"],
  ["README.zh-CN.md", "docs/github-presentation.md"],
  ["README.zh-CN.md", "CHANGELOG.md"],
  ["README.zh-CN.md", "docs/releases/v0.6.0.md"],
  ["README.zh-CN.md", "docs/cybernetic-stability.md"],
  ["docs/github-presentation.md", "Adapter-driven control plane for Codex and coding-agent work"],
  ["docs/github-presentation.md", "codex-plugin"],
  ["docs/github-presentation.md", "workflow-automation"],
  ["docs/github-presentation.md", "docs/assets/github/social-preview.svg"],
  ["CHANGELOG.md", "## 0.6.0 - 2026-07-09"],
  ["docs/releases/v0.6.0.md", "Agent Harness v0.6.0"],
  ["docs/cybernetic-stability.md", "Cybernetic Stability Model"],
  ["docs/cybernetic-stability.md", "sensor freshness"],
  ["docs/cybernetic-stability.md", "measurement snapshot"],
  ["docs/cybernetic-stability.md", "remaining gap"],
  ["docs/cybernetic-stability.md", "feedback quality"],
  ["docs/cybernetic-stability.md", "stability/saturation"],
  ["docs/assets/github/social-preview.svg", "v0.6.0"],
  ["docs/assets/github/social-preview.svg", "bounded status"],
  ["docs/assets/github/social-preview.svg", "Roadmap"],
  ["docs/assets/github/social-preview.svg", "Task"],
  ["docs/assets/readme/adapter-model.svg", "Roadmap -&gt; Milestone -&gt; Goal -&gt; Task -&gt; Run"],
  ["docs/assets/readme/adapter-model.svg", "milestones, goals, runs"],
  ["docs/assets/readme/adapter-execution-model.svg", "Milestone"],
  ["docs/assets/readme/adapter-execution-model.svg", "Goals are the primary execution unit"],
  ["docs/assets/readme/adapter-execution-model.svg", "Specs constrain Goals before execution"],
  ["docs/assets/readme/adapter-artifact-map.svg", ".harness/config.json"],
  ["docs/assets/readme/adapter-artifact-map.svg", "Agent Harness Artifact Map"],
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

function readRepoJson(path) {
  return JSON.parse(readRepoFile(path));
}

function assertIncludesFile(path, needle, message) {
  const content = readRepoFile(path);
  assert(content.includes(needle), message || `${path} must include ${needle}`);
}

function assertExcludesFile(path, needle, message) {
  const content = readRepoFile(path);
  assert(!content.includes(needle), message || `${path} must not include ${needle}`);
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

  for (const [file, needle] of level0FastPathExpectations) {
    assertIncludesFile(file, needle, `${file} must preserve Level 0 Fast Path invariant: ${needle}`);
  }

  for (const [file, needle] of contextFocusRoutingExpectations) {
    assertIncludesFile(file, needle, `${file} must preserve context-focus routing guidance: ${needle}`);
  }

  for (const [file, needle] of cyberneticStabilityExpectations) {
    assertIncludesFile(file, needle, `${file} must preserve cybernetic stability guidance: ${needle}`);
  }

  for (const [file, needle] of degradedExecutionProvenanceExpectations) {
    assertIncludesFile(file, needle, `${file} must preserve degraded execution provenance guidance: ${needle}`);
  }

  for (const file of publicFocusOptionSurfaces) {
    assertExcludesFile(file, publicFocusOption, `${file} must not expose a first-version public ${publicFocusOption} surface`);
  }

  for (const [file, needle] of matrixLinkExpectations) {
    assertIncludesFile(file, needle, `${file} must link the capability matrix`);
  }

  for (const [file, needle] of languagePolicyExpectations) {
    assertIncludesFile(file, needle, `${file} must preserve the adapter language policy boundary`);
  }

  console.log("Protocol checks passed.");
}

function checkPresentation() {
  for (const [file, needle] of presentationExpectations) {
    assertIncludesFile(file, needle, `${file} must include presentation marker ${needle}`);
  }
  const packageJson = readRepoJson("package.json");
  const pluginJson = readRepoJson("plugins/agent-harness/.codex-plugin/plugin.json");
  assert(packageJson.version === "0.6.0", "package.json must expose the current 0.6.0 version");
  assert(pluginJson.version === "0.6.0", "plugin manifest must expose the current 0.6.0 version");
  assert(
    packageJson.version === pluginJson.version,
    "package.json and plugin manifest versions must stay aligned"
  );
  const adapterModelDiagram = readRepoFile("docs/assets/readme/adapter-model.svg");
  const readme = readRepoFile("README.md");
  const readmeZh = readRepoFile("README.zh-CN.md");
  assert(!readme.includes("docs/assets/github/social-preview.svg"), "README.md must not embed the social preview asset");
  assert(!readmeZh.includes("docs/assets/github/social-preview.svg"), "README.zh-CN.md must not embed the social preview asset");
  assert(!readme.includes("docs/assets/readme/adapter-model.png"), "README.md must prefer lightweight SVG diagrams");
  assert(!readmeZh.includes("docs/assets/readme/adapter-model.png"), "README.zh-CN.md must prefer lightweight SVG diagrams");
  assert(
    !adapterModelDiagram.includes("tasks, specs, goals, runs"),
    "adapter-model.svg must not preserve the old task-first diagram phrase"
  );
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
