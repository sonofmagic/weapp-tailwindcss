import { spawn } from 'node:child_process'
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ifNeeded = process.argv.includes('--if-needed')
const websiteName = '@weapp-tailwindcss/website'

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.stdio ?? 'inherit',
      shell: process.platform === 'win32',
      ...options,
    })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${command} ${args.join(' ')} exited with ${code}`))
    })
  })
}

function runCapture(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'inherit'],
      shell: process.platform === 'win32',
    })
    let stdout = ''
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', chunk => stdout += chunk)
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve(stdout)
        return
      }
      reject(new Error(`${command} ${args.join(' ')} exited with ${code}`))
    })
  })
}

async function pathMtimeMs(file) {
  try {
    return (await stat(file)).mtimeMs
  }
  catch (error) {
    if (error?.code === 'ENOENT') {
      return undefined
    }
    throw error
  }
}

async function newestMtimeMs(dir, ignored = new Set()) {
  let newest = 0
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  }
  catch (error) {
    if (error?.code === 'ENOENT') {
      return newest
    }
    throw error
  }

  for (const entry of entries) {
    if (ignored.has(entry.name)) {
      continue
    }
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      newest = Math.max(newest, await newestMtimeMs(file, ignored))
      continue
    }
    if (entry.isFile()) {
      newest = Math.max(newest, await pathMtimeMs(file) ?? 0)
    }
  }
  return newest
}

async function readPackageJson(pkgDir) {
  return JSON.parse(await readFile(path.join(pkgDir, 'package.json'), 'utf8'))
}

function collectExportOutputFiles(exportsField) {
  const files = new Set()
  const visit = (value) => {
    if (typeof value === 'string') {
      if (value.startsWith('./dist/')) {
        files.add(value)
      }
      return
    }
    if (value && typeof value === 'object') {
      for (const child of Object.values(value)) {
        visit(child)
      }
    }
  }
  visit(exportsField)
  return files
}

async function resolveOutputFiles(pkgDir, pkg) {
  const files = new Set([
    pkg.main,
    pkg.module,
    pkg.types,
    ...collectExportOutputFiles(pkg.exports),
  ])
  return [...files]
    .filter(file => typeof file === 'string' && file.startsWith('./dist/'))
    .map(file => path.resolve(pkgDir, file))
}

async function listWebsiteDependencyPackages() {
  const output = await runCapture('pnpm', [
    '--filter',
    `${websiteName}...`,
    '--filter',
    `!${websiteName}`,
    'list',
    '--depth',
    '-1',
    '--json',
  ])
  return JSON.parse(output)
}

async function isPackageBuildFresh(pkgInfo) {
  const pkgDir = pkgInfo.path
  const pkg = await readPackageJson(pkgDir)
  const outputFiles = await resolveOutputFiles(pkgDir, pkg)
  if (outputFiles.length === 0) {
    return true
  }
  const outputMtimes = await Promise.all(outputFiles.map(pathMtimeMs))
  const oldestOutput = Math.min(...outputMtimes.map(value => value ?? 0))
  if (oldestOutput <= 0) {
    return false
  }

  const newestSource = Math.max(
    await newestMtimeMs(path.join(pkgDir, 'src'), new Set(['node_modules', 'dist'])),
    await pathMtimeMs(path.join(pkgDir, 'package.json')) ?? 0,
    await newestMtimeMs(pkgDir, new Set(['node_modules', 'dist', 'src', '.turbo'])),
  )
  return newestSource <= oldestOutput
}

async function shouldSkipBuildDeps() {
  if (!ifNeeded) {
    return false
  }
  const packages = await listWebsiteDependencyPackages()
  const stale = []
  for (const pkgInfo of packages) {
    if (!await isPackageBuildFresh(pkgInfo)) {
      stale.push(pkgInfo.name)
    }
  }
  if (stale.length > 0) {
    process.stdout.write(`[website] Rebuild workspace deps: ${stale.join(', ')}\n`)
    return false
  }
  process.stdout.write('[website] Workspace deps are fresh, skip build:deps.\n')
  return true
}

if (process.env.TURBO_HASH) {
  process.stdout.write('[website] Skip build:deps inside turbo task.\n')
}
else if (!await shouldSkipBuildDeps()) {
  await run('pnpm', [
    '--filter',
    `${websiteName}...`,
    '--filter',
    `!${websiteName}`,
    'build',
  ])
}
