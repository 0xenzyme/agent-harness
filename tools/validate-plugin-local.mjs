#!/usr/bin/env node

// Portable repository integrity check. This is not the official plugin validator.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const plugin = join(root, "plugins/agent-harness");
const errors = [];
const check = (ok, message) => { if (!ok) errors.push(message); };
const json = (path) => {
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch (error) { errors.push(`${relative(root, path)}: ${error.message}`); return null; }
};

if (process.argv.includes("--help")) {
  console.log("Usage: node tools/validate-plugin-local.mjs\nChecks repository manifest, skills, Markdown references, schemas and package integrity. This is not the official plugin validator.");
  process.exit(0);
}
check(process.argv.length === 2, "No options are supported; use --help.");
const packageJson = json(join(root, "package.json"));
const manifest = json(join(plugin, ".codex-plugin/plugin.json"));
check(typeof manifest?.name === "string" && !!manifest.name, "Plugin manifest needs a name.");
check(typeof manifest?.version === "string" && !!manifest.version, "Plugin manifest needs a version.");
check(typeof manifest?.description === "string" && !!manifest.description, "Plugin manifest needs a description.");
check(typeof manifest?.skills === "string", "Plugin manifest needs a skills path.");
check(packageJson?.type === "module", "Package must declare ESM module type.");
check(packageJson?.version === manifest?.version, "Package and plugin manifest versions differ.");
for (const [name, path] of Object.entries(packageJson?.bin || {})) {
  check(typeof path === "string" && existsSync(resolve(root, path)), `Missing package bin ${name}: ${path}`);
}
const skillsRoot = resolve(plugin, manifest?.skills || "skills");
check(skillsRoot.startsWith(`${plugin}/`) && existsSync(skillsRoot), `Missing skills directory: ${manifest?.skills}`);
const walk = (dir) => {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.isFile()) {
      if (entry.name.endsWith(".json")) json(path);
      if (entry.name.endsWith(".md")) {
        const content = readFileSync(path, "utf8");
        for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
          const target = match[1].split("#")[0];
          if (!target || /^(https?:|mailto:|#)/.test(target)) continue;
          const dest = resolve(dirname(path), decodeURIComponent(target));
          check(dest === plugin || dest.startsWith(`${plugin}/`), `Reference escapes plugin: ${relative(root, path)} -> ${target}`);
          check(existsSync(dest), `Missing reference: ${relative(root, path)} -> ${target}`);
        }
      }
    }
  }
};
walk(plugin);
if (existsSync(skillsRoot)) {
  const skills = readdirSync(skillsRoot, { withFileTypes: true }).filter((item) => item.isDirectory());
  check(skills.length > 0, "Plugin has no skills.");
  for (const skill of skills) {
    const path = join(skillsRoot, skill.name, "SKILL.md");
    check(existsSync(path), `Missing ${relative(root, path)}`);
    if (existsSync(path)) check(readFileSync(path, "utf8").startsWith("---\n"), `${relative(root, path)} lacks YAML frontmatter.`);
  }
}
for (const entry of readdirSync(join(plugin, "schemas"))) {
  if (!entry.endsWith(".json")) continue;
  const schema = json(join(plugin, "schemas", entry));
  check(schema && typeof schema === "object" && typeof schema.$schema === "string", `Schema ${entry} needs a $schema declaration.`);
}
if (errors.length) {
  for (const error of errors) console.error(`FAIL ${error}`);
  process.exit(1);
}
console.log("Portable plugin integrity check passed (manifest, skills, references, schemas, package). Not official validation.");
