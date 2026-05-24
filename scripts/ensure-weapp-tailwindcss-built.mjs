import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const buildTargets = [
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

const staleTargets = buildTargets.filter(shouldBuild)

if (staleTargets.length === 0) {
  process.exit(0)
}

for (const target of staleTargets) {
  console.log(`[weapp-tailwindcss] ${target.label} dist 已过期，正在构建供 demo 使用...`)
  const result = spawnSync(
    process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
    ['--filter', target.filter, 'build'],
    {
      cwd: repoRoot,
      stdio: 'inherit',
      env: process.env,
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
