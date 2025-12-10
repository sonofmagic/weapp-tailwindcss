#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../../..')
const benchmarkRoot = path.resolve(__dirname, '..')
const outputFile = path.resolve(benchmarkRoot, 'src/projects.generated.json')

const SOURCE_GROUPS = [
  { dir: 'apps', type: 'app', label: '应用' },
  { dir: 'demo', type: 'demo', label: '示例' },
]

const BENCH_KEY_OVERRIDES = new Map([
  ['demo/native-mina', 'native-webpack'],
  ['demo/taro-app', 'taro-react'],
  ['demo/uni-app', 'uni-app-webpack-vue2'],
  ['demo/uni-app-webpack5', 'uni-app-webpack5-vue2'],
  ['demo/rax-app', 'rax'],
  ['demo/taro-vue3-app', 'taro-vue3'],
  ['demo/uni-app-vue3-vite', 'uni-app-vite-vue3'],
  ['demo/mpx-app', 'mpx'],
])

const SCRIPT_OVERRIDES = new Map([
  // projectId -> script name override
  ['apps/rsmax-app-ts', '_build'],
])

const SCRIPT_PRIORITY = [
  'benchmark',
  'bench',
  'build:benchmark',
  'build:bench',
  'build:weapp',
  'build:wechat',
  'build:mp',
  'build:miniprogram',
  'build:h5',
  'build:app',
  'build:prod',
  'build:production',
  'build',
]

const DEFAULT_DISPLAY_PREFIX = {
  app: '应用',
  demo: '示例',
}

async function ensureDir(target) {
  await fs.mkdir(path.dirname(target), { recursive: true })
}

async function readJson(filepath) {
  const raw = await fs.readFile(filepath, 'utf8')
  return JSON.parse(raw)
}

function slugify(value) {
  const cleaned = value.replace(/^@/, '').replace(/\//g, '-').trim()
  return cleaned.replace(/[^\w-]+/g, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '').toLowerCase()
}

function getDisplayName(pkg, fallback) {
  if (pkg?.benchmarkDisplayName) {
    return pkg.benchmarkDisplayName
  }
  if (pkg?.displayName) {
    return pkg.displayName
  }
  if (pkg?.name) {
    const [, scopedName] = pkg.name.split('/')
    return scopedName ?? pkg.name.replace(/^@/, '')
  }
  return fallback
}

function pickBuildScript(projectId, scripts) {
  if (!scripts || typeof scripts !== 'object') {
    return null
  }
  if (SCRIPT_OVERRIDES.has(projectId)) {
    return SCRIPT_OVERRIDES.get(projectId)
  }
  for (const key of SCRIPT_PRIORITY) {
    if (scripts[key]) {
      return key
    }
  }
  const buildLike = Object.keys(scripts).find(name => name.startsWith('build'))
  return buildLike ?? null
}

async function scanGroup(group) {
  const absPath = path.resolve(repoRoot, group.dir)
  let dirents
  try {
    dirents = await fs.readdir(absPath, { withFileTypes: true })
  }
  catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
  const results = []
  for (const dirent of dirents) {
    if (!dirent.isDirectory()) {
      continue
    }
    const relativeDir = path.posix.join(group.dir, dirent.name)
    const pkgPath = path.resolve(repoRoot, relativeDir, 'package.json')
    const exists = await fs.access(pkgPath).then(() => true).catch(() => false)
    if (!exists) {
      continue
    }
    const pkg = await readJson(pkgPath)
    const displayName = getDisplayName(pkg, dirent.name)
    const benchKey = BENCH_KEY_OVERRIDES.get(relativeDir) ?? slugify(pkg?.benchmarkKey ?? displayName)
    const buildScript = pickBuildScript(relativeDir, pkg?.scripts)
    results.push({
      id: relativeDir,
      type: group.type,
      typeLabel: group.label ?? DEFAULT_DISPLAY_PREFIX[group.type] ?? group.type,
      packageName: pkg?.name ?? null,
      displayName,
      benchmarkKey: benchKey,
      buildScript,
      hasBuildScript: Boolean(buildScript),
    })
  }
  return results
}

function sortProjects(projects) {
  return [...projects].sort((a, b) => {
    if (a.type === b.type) {
      return a.displayName.localeCompare(b.displayName, 'zh-Hans-CN')
    }
    return a.type.localeCompare(b.type)
  })
}

async function main() {
  const discovered = []
  for (const group of SOURCE_GROUPS) {
    const groupProjects = await scanGroup(group)
    discovered.push(...groupProjects)
  }
  const deduped = new Map()
  for (const project of discovered) {
    deduped.set(project.id, project)
  }
  const sorted = sortProjects([...deduped.values()])
  const payload = {
    generatedAt: new Date().toISOString(),
    projectCount: sorted.length,
    projects: sorted,
  }
  await ensureDir(outputFile)
  await fs.writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`Generated ${sorted.length} project entries -> ${path.relative(repoRoot, outputFile)}`)
}

main().catch((error) => {
  console.error('[benchmark] Failed to sync projects:', error)
  process.exitCode = 1
})
