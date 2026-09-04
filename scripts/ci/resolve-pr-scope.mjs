import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const scopeRules = {
  'core': [
    /^packages\//,
    /^packages-runtime\//,
    /^package\.json$/,
    /^pnpm-lock\.yaml$/,
    /^pnpm-workspace\.yaml$/,
    /^turbo\.json$/,
    /^scripts\//,
    /^e2e\//,
    /^demo\//,
  ],
  'watch': [
    /^packages\/weapp-tailwindcss\//,
    /^packages-runtime\//,
    /^e2e\//,
    /^demo\//,
    /^tools\/weapp-tailwindcss-scripts\//,
    /^scripts\/(?:taro|uni|weapp-vite|e2e)/,
    /^\.github\/scripts\//,
  ],
  'benchmark': [
    /^benchmark\//,
    /^packages\/weapp-tailwindcss\/src\/(?:bundlers|generator)\//,
    /^packages\/postcss\/src\//,
    /^\.github\/workflows\/benchmark\.yml$/,
  ],
  'release': [
    /^package\.json$/,
    /^pnpm-lock\.yaml$/,
    /^repoctl\.config\.ts$/,
    /^packages\/[^/]+\/package\.json$/,
    /^packages-runtime\/[^/]+\/package\.json$/,
    /^scripts\/(?:verify-packed-packages|release|version|publish)/,
    /^\.github\/workflows\/release(?:-gate)?\.yml$/,
  ],
  'website': [
    /^website\//,
    /^\.github\/workflows\/(?:docs|website-seo-quality)\.yml$/,
  ],
  'templates': [
    /^templates\//,
    /^e2e\/canonical-template-/,
    /^e2e\/templateContract\.ts$/,
    /^scripts\/generate-support-matrix\.ts$/,
  ],
  'react-native': [
    /^packages\/react-native\//,
    /^examples\/react-native-expo\//,
    /^e2e\/react-native(?:\/|-)/,
  ],
  'lynx': [
    /^packages\/lynx\//,
    /^examples\/react-lynx\//,
    /^e2e\/lynx\//,
    /^e2e\/fixtures\/lynx-native\//,
  ],
  'hbuilderx': [
    /^packages\/hbuilderx-runner\//,
    /^e2e\/hbuilderx-local\//,
    /^e2e\/hbuilderx-local\.test\.ts$/,
    /^\.github\/workflows\/e2e-(?:ide|hbuilderx-windows)\.yml$/,
  ],
}

function normalizeFile(file) {
  return file.replaceAll('\\', '/').replace(/^\.\//, '')
}

export function resolveScopes(files) {
  const normalized = files.map(normalizeFile).filter(Boolean)
  const isDocsOnly = normalized.length > 0 && normalized.every((file) => {
    return file.endsWith('.md') || file.endsWith('.mdx') || file.startsWith('.changeset/')
  })
  const result = Object.fromEntries(Object.entries(scopeRules).map(([scope, rules]) => [
    scope,
    !isDocsOnly && normalized.some(file => rules.some(rule => rule.test(file))),
  ]))
  result.core = !isDocsOnly && (result.core || normalized.length > 0)
  result.has_changes = normalized.length > 0
  return result
}

export function readChangedFiles({ base, head } = {}) {
  const baseRef = base || process.env.GITHUB_BASE_SHA
  const headRef = head || process.env.GITHUB_SHA || 'HEAD'
  if (!baseRef || process.env.GITHUB_EVENT_NAME !== 'pull_request') {
    return ['.github/workflows/pr-gate.yml']
  }
  const output = execFileSync('git', ['diff', '--name-only', baseRef, headRef], { encoding: 'utf8' })
  return output.split(/\r?\n/).filter(Boolean)
}

export function writeGitHubOutput(file, scopes) {
  const outputFile = path.resolve(file)
  fs.appendFileSync(outputFile, Object.entries(scopes).map(([key, value]) => `${key}=${value}\n`).join(''))
}

function main() {
  const args = new Map(process.argv.slice(2).map((value, index, values) => [value, values[index + 1]]))
  const scopes = resolveScopes(readChangedFiles({ base: args.get('--base'), head: args.get('--head') }))
  if (args.has('--github-output')) {
    writeGitHubOutput(args.get('--github-output'), scopes)
  }
  process.stdout.write(`${JSON.stringify(scopes)}\n`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
