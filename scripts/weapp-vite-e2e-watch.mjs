import { spawn } from 'node:child_process'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const READY_RE = /开发服务已就绪|dev(?:elopment)? server ready|ready in \d+/i
const WEAK_READY_RE = /根据 Vite 项目根目录自动推断 appType/i
const pnpmExecPath = process.env.npm_execpath
const sourceDirs = ['miniprogram', 'pages', 'packageA', 'packageB', 'sub-normal', 'sub-independent']
const ignoredDirs = new Set(['dist', 'node_modules', '.git'])
const rootSourceFileRe = /^(?:app|tailwind\.config(?:\.[\w-]+)?)\.[cm]?[jt]s$|^app\.(?:wxss|css|s[ac]ss|less|json)$/i

function createPnpmCommand(args) {
  if (pnpmExecPath) {
    return {
      command: process.execPath,
      args: [pnpmExecPath, ...args],
    }
  }

  return {
    command: process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
    args,
  }
}

function spawnPnpm(args, options = {}) {
  const { command, args: commandArgs } = createPnpmCommand(args)
  return spawn(command, commandArgs, {
    cwd: process.cwd(),
    env: process.env,
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  })
}

function pipeWithReady(child, resolveReady) {
  let resolved = false
  const resolveOnce = () => {
    if (resolved) {
      return
    }
    resolved = true
    resolveReady()
  }
  const onData = (chunk) => {
    const text = chunk.toString()
    process.stdout.write(text)
    if (READY_RE.test(text)) {
      resolveOnce()
      return
    }
    if (WEAK_READY_RE.test(text)) {
      resolveOnce()
    }
  }

  child.stdout?.on('data', onData)
  child.stderr?.on('data', (chunk) => {
    process.stderr.write(chunk)
  })
}

async function runBuild() {
  await new Promise((resolve, reject) => {
    const build = spawnPnpm(['exec', 'weapp-vite', 'build'], { stdio: 'inherit' })
    build.on('error', reject)
    build.on('close', (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`weapp-vite build failed: ${signal ?? code}`))
    })
  })
}

async function collectFiles(dir, output) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  }
  catch {
    return
  }

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) {
      continue
    }

    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await collectFiles(file, output)
      continue
    }

    if (entry.isFile()) {
      output.push(file)
    }
  }
}

async function collectSnapshot() {
  const files = []
  for (const dir of sourceDirs) {
    await collectFiles(path.resolve(process.cwd(), dir), files)
  }

  let rootEntries = []
  try {
    rootEntries = await readdir(process.cwd(), { withFileTypes: true })
  }
  catch {
  }

  for (const entry of rootEntries) {
    if (entry.isFile() && rootSourceFileRe.test(entry.name)) {
      files.push(path.resolve(process.cwd(), entry.name))
    }
  }

  const snapshot = new Map()
  await Promise.all(files.map(async (file) => {
    try {
      const item = await stat(file)
      snapshot.set(file, `${item.mtimeMs}:${item.size}`)
    }
    catch {
      snapshot.set(file, 'missing')
    }
  }))
  return snapshot
}

function hasSnapshotChanged(previous, next) {
  if (previous.size !== next.size) {
    return true
  }

  for (const [file, signature] of next) {
    if (previous.get(file) !== signature) {
      return true
    }
  }
  return false
}

async function main() {
  const runFallbackBuild = process.env.WEAPP_VITE_E2E_WATCH_BUILD_FALLBACK === '1'
  let resolveReady
  const ready = new Promise((resolve) => {
    resolveReady = resolve
  })
  const dev = spawnPnpm(['exec', 'weapp-vite', 'dev', '--platform', 'all'])
  let stopping = false
  let building = false
  let queued = false
  let pollTimer
  let lastSnapshot = await collectSnapshot()

  pipeWithReady(dev, resolveReady)

  const stop = (signal = 'SIGTERM') => {
    if (stopping) {
      return
    }
    stopping = true
    if (pollTimer) {
      clearInterval(pollTimer)
    }
    dev.kill(signal)
  }

  process.on('SIGINT', () => stop('SIGINT'))
  process.on('SIGTERM', () => stop('SIGTERM'))

  dev.on('error', (error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`)
    process.exitCode = 1
  })

  dev.on('close', (code, signal) => {
    if (!stopping && code !== 0) {
      process.exitCode = code ?? 1
    }
    if (signal && !stopping) {
      process.stderr.write(`weapp-vite dev exited with signal ${signal}\n`)
    }
  })

  await ready
  if (!stopping && runFallbackBuild) {
    const rebuild = async () => {
      if (stopping) {
        return
      }
      if (building) {
        queued = true
        return
      }
      building = true
      try {
        do {
          if (stopping) {
            break
          }
          queued = false
          const beforeBuildSnapshot = lastSnapshot
          await runBuild()
          const afterBuildSnapshot = await collectSnapshot()
          if (hasSnapshotChanged(beforeBuildSnapshot, afterBuildSnapshot)) {
            queued = true
          }
          lastSnapshot = afterBuildSnapshot
        } while (queued)
      }
      finally {
        building = false
      }
    }
    const triggerRebuild = () => {
      void rebuild().catch((error) => {
        process.stderr.write(`${error.stack ?? error.message}\n`)
        process.exitCode = 1
        stop()
      })
    }
    pollTimer = setInterval(() => {
      void collectSnapshot().then((nextSnapshot) => {
        if (hasSnapshotChanged(lastSnapshot, nextSnapshot)) {
          lastSnapshot = nextSnapshot
          triggerRebuild()
        }
      }).catch((error) => {
        process.stderr.write(`${error.stack ?? error.message}\n`)
        process.exitCode = 1
        stop()
      })
    }, 250)
    await runBuild()
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`)
  process.exitCode = 1
})
