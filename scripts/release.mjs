#!/usr/bin/env node

/**
 * Release script for DevToolkit.
 *
 * Bumps the app version in every manifest file, commits the change,
 * creates a git tag, and pushes — which triggers the GitHub Actions
 * release workflow.
 *
 * Usage:
 *   node scripts/release.mjs <version>
 *   npm run release -- 0.9.0
 *
 * The version must be valid semver (e.g. 1.2.3) without a leading "v".
 */

import { readFileSync, writeFileSync } from "node:fs"
import { execSync } from "node:child_process"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

// ── Helpers ──────────────────────────────────────────────────────────

function run(cmd) {
  console.log(`  $ ${cmd}`)
  execSync(cmd, { cwd: ROOT, stdio: "inherit" })
}

function readJson(relPath) {
  return JSON.parse(readFileSync(resolve(ROOT, relPath), "utf-8"))
}

function writeJson(relPath, obj) {
  writeFileSync(resolve(ROOT, relPath), JSON.stringify(obj, null, 2) + "\n")
}

function readText(relPath) {
  return readFileSync(resolve(ROOT, relPath), "utf-8")
}

function writeText(relPath, content) {
  writeFileSync(resolve(ROOT, relPath), content)
}

// ── Validation ───────────────────────────────────────────────────────

const SEMVER_RE = /^\d+\.\d+\.\d+$/

const newVersion = process.argv[2]

if (!newVersion) {
  const pkg = readJson("package.json")
  console.error(
    `\nUsage:  node scripts/release.mjs <version>\n` +
      `        npm run release -- <version>\n\n` +
      `Current version: ${pkg.version}\n`
  )
  process.exit(1)
}

if (!SEMVER_RE.test(newVersion)) {
  console.error(
    `\nError: "${newVersion}" is not valid semver (expected x.y.z).\n`
  )
  process.exit(1)
}

// Ensure clean working tree
try {
  execSync("git diff --quiet && git diff --cached --quiet", { cwd: ROOT })
} catch {
  console.error(
    "\nError: Working tree has uncommitted changes. Please commit or stash them first.\n"
  )
  process.exit(1)
}

// ── Read current version ─────────────────────────────────────────────

const pkg = readJson("package.json")
const currentVersion = pkg.version

if (newVersion === currentVersion) {
  console.error(
    `\nError: New version (${newVersion}) is the same as the current version.\n`
  )
  process.exit(1)
}

console.log(`\nDevToolkit release: ${currentVersion} → ${newVersion}\n`)

// ── Update version in all manifest files ─────────────────────────────

// 1. package.json
console.log("Updating package.json …")
pkg.version = newVersion
writeJson("package.json", pkg)

// 2. package-lock.json (root + packages[""] entry)
console.log("Updating package-lock.json …")
const lock = readJson("package-lock.json")
lock.version = newVersion
if (lock.packages?.[""]?.version) {
  lock.packages[""].version = newVersion
}
writeJson("package-lock.json", lock)

// 3. tauri.conf.json
console.log("Updating tauri.conf.json …")
const tauriConf = readJson("tauri.conf.json")
tauriConf.version = newVersion
writeJson("tauri.conf.json", tauriConf)

// 4. Cargo.toml  (replace the first version = "…" under [package])
console.log("Updating Cargo.toml …")
const cargoToml = readText("Cargo.toml")
const updatedCargoToml = cargoToml.replace(
  /^(version\s*=\s*")[\d.]+(")/m,
  `$1${newVersion}$2`
)
writeText("Cargo.toml", updatedCargoToml)

// 5. Cargo.lock  (replace version for the dev-toolkit package)
console.log("Updating Cargo.lock …")
const cargoLock = readText("Cargo.lock")
const updatedCargoLock = cargoLock.replace(
  /(name = "dev-toolkit"\nversion = ")[\d.]+(")/, 
  `$1${newVersion}$2`
)
writeText("Cargo.lock", updatedCargoLock)

// 6. src/applicationConfig.json
console.log("Updating src/applicationConfig.json …")
const appConfig = readJson("src/applicationConfig.json")
appConfig.aboutInfo.version = newVersion
writeJson("src/applicationConfig.json", appConfig)

// ── Git commit, tag, and push ────────────────────────────────────────

const tag = `v${newVersion}`

console.log("\nCommitting version bump …")
run("git add package.json package-lock.json tauri.conf.json Cargo.toml Cargo.lock src/applicationConfig.json")
run(`git commit -m "chore: bump version to ${newVersion}"`)

console.log(`\nTagging ${tag} …`)
run(`git tag ${tag}`)

console.log("\nPushing commit and tag …")
run("git push")
run(`git push origin ${tag}`)

console.log(`\n✅ Released ${tag} — GitHub Actions will build the release.\n`)
