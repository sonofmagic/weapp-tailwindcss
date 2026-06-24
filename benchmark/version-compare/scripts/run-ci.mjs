import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { buildSummary, toMarkdown } from './ci-report.mjs'
import { benchmarkProjectDirs } from './projects.mjs'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(dirname, '../../..')
const packageJsonPath = path.join(repoRoot, 'packages/weapp-tailwindcss/package.json')

const dependencyFields = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']
const publishedResolverDependencyNames = [
  '@ast-core/escape',
  '@weapp-core/escape',
]

function parseArg(name, fallback = '') {
  const index = process.argv.indexOf(name)
  return index === -1 ? fallback : (process.argv[index + 1] ?? fallback)
}

function parseNumber(name, fallback) {
  const value = Number(parseArg(name, ''))
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function inferBaseline(version) {
  const requested = parseArg('--baseline', process.env.WEAPP_TW_BENCH_BASELINE ?? 'auto')
  if (requested && requested !== 'auto') {
    return requested
  }
  const match = version.match(/-(alpha|beta|rc|next)(?:\.|$)/)
  return `weapp-tailwindcss@${match?.[1] ?? 'latest'}`
}

function normalizePackageSpec(value) {
  if (value.startsWith('weapp-tailwindcss@')) {
    return value
  }
  return `weapp-tailwindcss@${value}`
}

function asDependencySpec(value) {
  return `npm:${normalizePackageSpec(value)}`
}

function rel(file) {
  return path.relative(repoRoot, file) || '.'
}

async function run(cwd, command, args, options = {}) {
  process.stdout.write(`$ ${command} ${args.join(' ')} (${rel(cwd)})\n`)
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      CI: '1',
      HUSKY: '0',
      ...options.env,
    },
  })
  const code = await new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('close', exitCode => resolve(exitCode ?? 1))
  })
  if (code !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with code ${code}`)
  }
}

async function runCapture(cwd, command, args, options = {}) {
  process.stdout.write(`$ ${command} ${args.join(' ')} (${rel(cwd)})\n`)
  const child = spawn(command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      CI: '1',
      HUSKY: '0',
      ...options.env,
    },
  })
  let stdout = ''
  let stderr = ''
  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString('utf8')
  })
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString('utf8')
  })
  const code = await new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('close', exitCode => resolve(exitCode ?? 1))
  })
  if (code !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with code ${code}\n${stderr.slice(-4000)}`)
  }
  return stdout
}

function shouldCopy(src) {
  const relative = path.relative(repoRoot, src)
  if (!relative) {
    return true
  }
  const parts = relative.split(path.sep)
  if (parts.some(part => part === '.git' || part === 'node_modules' || part === '.tmp')) {
    return false
  }
  if (parts.some(part => part === '.turbo' || part === 'coverage' || part === 'coverage-vitest' || part === 'dist')) {
    return false
  }
  if (relative === 'benchmark/framework-compare/projects') {
    return false
  }
  if (relative === 'e2e/benchmark/e2e-watch-hmr') {
    return false
  }
  if (relative === 'website/.vitepress/dist') {
    return false
  }
  return !relative.endsWith('.log') && !relative.endsWith('.tsbuildinfo')
}

async function copyRepo(target) {
  await fs.rm(target, { recursive: true, force: true })
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.cp(repoRoot, target, {
    recursive: true,
    dereference: false,
    filter: shouldCopy,
  })
}

function pickPublishedResolverDependencies(dependencies = {}) {
  return Object.fromEntries(publishedResolverDependencyNames.flatMap((name) => {
    const spec = dependencies[name]
    return typeof spec === 'string' ? [[name, spec]] : []
  }))
}

async function readPublishedDependencies(baseline, fallbackDependencies) {
  try {
    const stdout = await runCapture(repoRoot, 'pnpm', ['view', normalizePackageSpec(baseline), 'dependencies', '--json'])
    return JSON.parse(stdout)
  }
  catch (error) {
    process.stdout.write(`[benchmark] unable to read published dependencies, fallback to local package metadata: ${error instanceof Error ? error.message : String(error)}\n`)
    return fallbackDependencies
  }
}

function hasDependency(json, name) {
  return dependencyFields.some(field => Boolean(json[field]?.[name]))
}

function patchPublishedResolverDependencies(json, resolverDependencies) {
  const entries = Object.entries(resolverDependencies)
  if (entries.length === 0) {
    return
  }

  json.devDependencies ??= {}
  for (const [name, spec] of entries) {
    if (!hasDependency(json, name)) {
      json.devDependencies[name] = spec
    }
  }
}

async function patchPackageJson(file, baseline, resolverDependencies) {
  try {
    await fs.access(file)
  }
  catch {
    process.stdout.write(`[benchmark] skip missing package.json: ${rel(file)}\n`)
    return false
  }

  const source = await fs.readFile(file, 'utf8')
  const json = JSON.parse(source)
  let changed = false
  for (const field of dependencyFields) {
    const deps = json[field]
    if (deps?.['weapp-tailwindcss']) {
      deps['weapp-tailwindcss'] = asDependencySpec(baseline)
      changed = true
    }
  }
  if (changed) {
    patchPublishedResolverDependencies(json, resolverDependencies)
    await fs.writeFile(file, `${JSON.stringify(json, null, 2)}\n`, 'utf8')
  }
  return changed
}

async function patchPublishedRoot(root, baseline, resolverDependencies) {
  const patched = []
  for (const projectDir of benchmarkProjectDirs) {
    const file = path.join(root, projectDir, 'package.json')
    if (await patchPackageJson(file, baseline, resolverDependencies)) {
      patched.push(projectDir)
    }
  }
  await patchPublishedRootOverrides(root)
  return patched
}

async function patchPublishedRootOverrides(root) {
  const file = path.join(root, 'package.json')
  const json = JSON.parse(await fs.readFile(file, 'utf8'))
  json.pnpm ??= {}
  json.pnpm.overrides ??= {}
  json.pnpm.overrides['tailwindcss-config'] = 'link:packages/tailwindcss-config'
  await fs.writeFile(file, `${JSON.stringify(json, null, 2)}\n`, 'utf8')
}

async function prepareRoot({ root, role, baseline, resolverDependencies }) {
  await copyRepo(root)
  if (role === 'published') {
    const patched = await patchPublishedRoot(root, baseline, resolverDependencies)
    process.stdout.write(`[benchmark] published baseline ${normalizePackageSpec(baseline)} patched projects: ${patched.join(', ')}\n`)
  }
  await run(root, 'pnpm', ['install', role === 'current' ? '--frozen-lockfile' : '--no-frozen-lockfile'])
  await run(root, 'pnpm', ['build:pkgs'])
}

async function appendStepSummary(reportPath) {
  if (!process.env.GITHUB_STEP_SUMMARY) {
    return
  }
  const markdown = await fs.readFile(reportPath, 'utf8')
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`, 'utf8')
}

async function main() {
  const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
  const baseline = inferBaseline(pkg.version)
  const publishedDependencies = await readPublishedDependencies(baseline, pkg.dependencies ?? {})
  const resolverDependencies = pickPublishedResolverDependencies(publishedDependencies)
  const outputRoot = path.resolve(parseArg('--work-root', path.join(os.tmpdir(), `weapp-tailwindcss-benchmark-${process.pid}`)))
  const resultDir = path.resolve(parseArg('--result-dir', path.join(outputRoot, 'result')))
  const currentRoot = path.join(outputRoot, 'current')
  const publishedRoot = path.join(outputRoot, 'published')
  const rawPath = path.resolve(parseArg('--out', path.join(resultDir, 'matrix-raw.json')))
  const reportPath = path.resolve(parseArg('--report', path.join(resultDir, 'report.md')))
  const summaryPath = path.resolve(parseArg('--summary', path.join(resultDir, 'summary.json')))
  const buildRuns = parseNumber('--build-runs', 3)
  const hmrRuns = parseNumber('--hmr-runs', 5)
  const timeoutMs = parseNumber('--timeout', 180000)
  const pollIntervalMs = parseNumber('--poll-interval', 120)
  const only = parseArg('--only', '')
  const baselineLabel = `published:${normalizePackageSpec(baseline)}`
  const currentLabel = `current:${pkg.version}`
  const versionsPath = path.join(resultDir, 'versions.json')

  await fs.mkdir(resultDir, { recursive: true })
  await prepareRoot({ root: currentRoot, role: 'current', baseline, resolverDependencies })
  await prepareRoot({ root: publishedRoot, role: 'published', baseline, resolverDependencies })
  await fs.writeFile(versionsPath, JSON.stringify([
    { version: baselineLabel, root: publishedRoot },
    { version: currentLabel, root: currentRoot },
  ], null, 2), 'utf8')

  const matrixArgs = [
    path.join(repoRoot, 'benchmark/version-compare/scripts/run-matrix.mjs'),
    '--versions-file',
    versionsPath,
    '--build-runs',
    String(buildRuns),
    '--hmr-runs',
    String(hmrRuns),
    '--timeout',
    String(timeoutMs),
    '--poll-interval',
    String(pollIntervalMs),
    '--out',
    rawPath,
  ]
  if (only) {
    matrixArgs.push('--only', only)
  }
  await run(repoRoot, process.execPath, matrixArgs)

  const raw = JSON.parse(await fs.readFile(rawPath, 'utf8'))
  const summary = buildSummary(raw, baselineLabel, currentLabel)
  const markdown = toMarkdown(summary, baseline)
  await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  await fs.writeFile(reportPath, markdown, 'utf8')
  await appendStepSummary(reportPath)
  process.stdout.write(`[benchmark] report -> ${reportPath}\n`)
  process.stdout.write(`[benchmark] summary -> ${summaryPath}\n`)

  if (summary.currentOnlyErrors.length > 0 && !process.argv.includes('--allow-errors')) {
    throw new Error(`benchmark current matrix has ${summary.currentOnlyErrors.length} current-only failed row(s)`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
