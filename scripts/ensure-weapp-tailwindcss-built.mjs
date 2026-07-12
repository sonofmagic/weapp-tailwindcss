import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createPnpmCommand } from './pnpm-command.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const runtimeBuildTargets = [
  {
    name: '@weapp-tailwindcss/runtime',
    filter: '@weapp-tailwindcss/runtime',
    label: '@weapp-tailwindcss/runtime',
    packageRoot: path.join(repoRoot, 'packages-runtime/runtime'),
    stamps: [
      'dist/index.cjs',
      'dist/index.mjs',
      'dist/index.d.mts',
    ],
  },
  {
    name: '@weapp-tailwindcss/merge',
    filter: '@weapp-tailwindcss/merge',
    label: '@weapp-tailwindcss/merge',
    packageRoot: path.join(repoRoot, 'packages-runtime/merge'),
    stamps: [
      'dist/index.cjs',
      'dist/index.mjs',
      'dist/index.d.mts',
    ],
  },
  {
    name: '@weapp-tailwindcss/cva',
    filter: '@weapp-tailwindcss/cva',
    label: '@weapp-tailwindcss/cva',
    packageRoot: path.join(repoRoot, 'packages-runtime/cva'),
    stamps: [
      'dist/index.cjs',
      'dist/index.mjs',
      'dist/index.d.mts',
    ],
  },
  {
    name: '@weapp-tailwindcss/variants',
    filter: '@weapp-tailwindcss/variants',
    label: '@weapp-tailwindcss/variants',
    packageRoot: path.join(repoRoot, 'packages-runtime/variants'),
    stamps: [
      'dist/index.cjs',
      'dist/index.mjs',
      'dist/index.d.mts',
    ],
  },
  {
    name: '@weapp-tailwindcss/typography',
    filter: '@weapp-tailwindcss/typography',
    label: '@weapp-tailwindcss/typography',
    packageRoot: path.join(repoRoot, 'packages-runtime/typography'),
    stamps: [
      'dist/index.js',
      'dist/index.mjs',
      'dist/index.d.ts',
    ],
  },
]
const buildTargets = [
  {
    filter: '@weapp-tailwindcss/shared',
    label: '@weapp-tailwindcss/shared',
    packageRoot: path.join(repoRoot, 'packages/shared'),
    stamps: [
      'dist/index.js',
      'dist/index.mjs',
      'dist/node.js',
      'dist/node.mjs',
    ],
  },
  {
    filter: '@weapp-tailwindcss/logger',
    label: '@weapp-tailwindcss/logger',
    packageRoot: path.join(repoRoot, 'packages/logger'),
    stamps: [
      'dist/index.js',
      'dist/index.mjs',
      'dist/index.d.ts',
    ],
  },
  {
    filter: '@weapp-tailwindcss/postcss-calc',
    label: '@weapp-tailwindcss/postcss-calc',
    packageRoot: path.join(repoRoot, 'packages/postcss-calc'),
    stamps: [
      'dist/index.cjs',
      'dist/index.mjs',
      'dist/index.d.ts',
    ],
  },
  {
    filter: 'tailwindcss-config',
    label: 'tailwindcss-config',
    packageRoot: path.join(repoRoot, 'packages/tailwindcss-config'),
    stamps: [
      'dist/index.js',
      'dist/index.cjs',
      'dist/index.d.ts',
    ],
  },
  {
    filter: '@weapp-tailwindcss/reset',
    label: '@weapp-tailwindcss/reset',
    packageRoot: path.join(repoRoot, 'packages/reset'),
    stamps: [
      'dist/index.cjs',
      'dist/index.mjs',
      'dist/index.d.ts',
    ],
  },
  {
    filter: '@weapp-tailwindcss/postcss',
    label: '@weapp-tailwindcss/postcss',
    packageRoot: path.join(repoRoot, 'packages/postcss'),
    stamps: [
      'dist/index.js',
      'dist/index.mjs',
      'dist/index.d.ts',
    ],
  },
  {
    filter: '@weapp-tailwindcss/debug-uni-app-x',
    label: '@weapp-tailwindcss/debug-uni-app-x',
    packageRoot: path.join(repoRoot, 'packages/debug-uni-app-x'),
    stamps: [
      'dist/index.cjs',
      'dist/index.mjs',
      'dist/index.d.ts',
    ],
  },
  {
    filter: 'weapp-tailwindcss',
    label: '核心包',
    packageRoot: path.join(repoRoot, 'packages/weapp-tailwindcss'),
    stamps: [
      'dist/vite.js',
      'dist/webpack.js',
      'dist/gulp.js',
      'dist/index.js',
    ],
  },
]

function readPackageJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  }
  catch {
    return undefined
  }
}

function collectWorkspaceRuntimeDependencyNames() {
  const packageJson = readPackageJson(path.join(process.cwd(), 'package.json'))
  const dependencies = {
    ...(packageJson?.dependencies ?? {}),
    ...(packageJson?.devDependencies ?? {}),
  }
  return new Set(
    Object.entries(dependencies)
      .filter(([, version]) => version === 'workspace:*')
      .map(([name]) => name),
  )
}

function collectLatestMtime(target, ignoredDirectories = new Set()) {
  let latest = 0
  const visit = (current) => {
    let stats
    try {
      stats = statSync(current)
    }
    catch {
      return
    }

    if (stats.isDirectory()) {
      if (ignoredDirectories.has(path.basename(current))) {
        return
      }
      for (const entry of readdirSync(current)) {
        visit(path.join(current, entry))
      }
      return
    }

    if (stats.isFile()) {
      latest = Math.max(latest, stats.mtimeMs)
    }
  }
  visit(target)
  return latest
}

function shouldBuild(target) {
  const srcRoot = path.join(target.packageRoot, 'src')
  const distRoot = path.join(target.packageRoot, 'dist')
  const stampFiles = target.stamps.map(stamp => path.join(target.packageRoot, stamp))

  if (!existsSync(distRoot) || stampFiles.some(file => !existsSync(file))) {
    return true
  }
  const latestSource = collectLatestMtime(srcRoot)
  const latestDist = collectLatestMtime(distRoot, new Set(['node_modules']))
  return latestSource > latestDist
}

function expandRuntimeBuildTargets() {
  const dependencyNames = collectWorkspaceRuntimeDependencyNames()
  if (dependencyNames.size === 0) {
    return []
  }

  const selectedNames = new Set()
  const addTarget = (target) => {
    if (target) {
      selectedNames.add(target.name)
    }
  }
  const targetByName = new Map(runtimeBuildTargets.map(target => [target.name, target]))

  for (const name of dependencyNames) {
    const target = targetByName.get(name)
    if (target) {
      addTarget(target)
    }
  }

  if (
    dependencyNames.has('@weapp-tailwindcss/merge')
    || dependencyNames.has('@weapp-tailwindcss/cva')
    || dependencyNames.has('@weapp-tailwindcss/variants')
  ) {
    addTarget(targetByName.get('@weapp-tailwindcss/runtime'))
  }
  if (dependencyNames.has('@weapp-tailwindcss/variants')) {
    addTarget(targetByName.get('@weapp-tailwindcss/merge'))
  }

  return runtimeBuildTargets.filter(target => selectedNames.has(target.name))
}

const staleTargets = [
  ...buildTargets,
  ...expandRuntimeBuildTargets(),
].filter(shouldBuild)

if (staleTargets.length === 0) {
  process.exit(0)
}

for (const target of staleTargets) {
  console.log(`[weapp-tailwindcss] ${target.label} dist 已过期，正在构建供 demo 使用...`)
  const command = createPnpmCommand(['--filter', target.filter, 'build'])
  const result = spawnSync(
    command.command,
    command.args,
    {
      cwd: repoRoot,
      stdio: 'inherit',
      env: process.env,
      shell: command.shell,
    },
  )

  if (result.error) {
    console.error(result.error)
    process.exit(1)
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
