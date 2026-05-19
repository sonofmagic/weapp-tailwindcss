import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const packageRoot = path.join(repoRoot, 'packages/weapp-tailwindcss')
const srcRoot = path.join(packageRoot, 'src')
const distRoot = path.join(packageRoot, 'dist')
const stampFiles = [
  path.join(distRoot, 'vite.js'),
  path.join(distRoot, 'webpack.js'),
  path.join(distRoot, 'gulp.js'),
  path.join(distRoot, 'index.js'),
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

function shouldBuild() {
  if (!existsSync(distRoot) || stampFiles.some(file => !existsSync(file))) {
    return true
  }
  const latestSource = collectLatestMtime(srcRoot)
  const latestDist = collectLatestMtime(distRoot, new Set(['node_modules']))
  return latestSource > latestDist
}

if (!shouldBuild()) {
  process.exit(0)
}

console.log('[weapp-tailwindcss] dist 已过期，正在构建核心包供 demo 使用...')
const result = spawnSync(
  process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
  ['--filter', 'weapp-tailwindcss', 'build'],
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

process.exit(result.status ?? 1)
