import { spawn } from 'node:child_process'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const READY_RE = /compiled successfully|built in [\d.]+s?|构建完成/i
const WEAK_READY_RE = /watching for file changes/i
const pnpmExecPath = process.env.npm_execpath
const sourceDirs = ['src']
const ignoredDirs = new Set(['dist', 'node_modules', '.git'])
const taroBuildGuardPath = path.resolve(import.meta.dirname, './taro-build-guard.mjs')
const skipNativeWatch = process.env.TARO_E2E_WATCH_NATIVE === '0'
const rebuildDebounceMs = Number(process.env.TARO_E2E_REBUILD_DEBOUNCE_MS ?? 600)

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
    env: {
      ...process.env,
      ...options.env,
    },
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  })
}

function pipeWithReady(child, resolveReady) {
  let resolved = false
  let weakReadyTimer
  const resolveOnce = () => {
    if (resolved) {
      return
    }
    resolved = true
    if (weakReadyTimer) {
      clearTimeout(weakReadyTimer)
    }
    resolveReady()
  }
  const onData = (chunk) => {
    const text = chunk.toString()
    process.stdout.write(text)
    if (READY_RE.test(text)) {
      resolveOnce()
      return
    }
    if (WEAK_READY_RE.test(text) && !weakReadyTimer) {
      weakReadyTimer = setTimeout(resolveOnce, 5000)
    }
  }

  child.stdout?.on('data', onData)
  child.stderr?.on('data', (chunk) => {
    process.stderr.write(chunk)
  })
}

async function runBuild() {
  await new Promise((resolve, reject) => {
    const build = spawnPnpm(['run', 'build:weapp'], {
      env: {
        TARO_BUILD_STRICT: '1',
      },
      stdio: 'inherit',
    })
    build.on('error', reject)
    build.on('close', (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`taro build failed: ${signal ?? code}`))
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
  let resolveReady
  const ready = skipNativeWatch
    ? runBuild()
    : new Promise((resolve) => {
        resolveReady = resolve
      })
  const watch = skipNativeWatch
    ? undefined
    : spawn(process.execPath, [taroBuildGuardPath, '--watch'], {
        cwd: process.cwd(),
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      })
  let stopping = false
  let building = false
  let queued = false
  let pollTimer
  let rebuildTimer
  let lastSnapshot = await collectSnapshot()

  if (watch) {
    pipeWithReady(watch, resolveReady)
  }

  const stop = (signal = 'SIGTERM') => {
    if (stopping) {
      return
    }
    stopping = true
    if (pollTimer) {
      clearInterval(pollTimer)
    }
    if (rebuildTimer) {
      clearTimeout(rebuildTimer)
    }
    watch?.kill(signal)
  }

  process.on('SIGINT', () => stop('SIGINT'))
  process.on('SIGTERM', () => stop('SIGTERM'))

  watch?.on('error', (error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`)
    process.exitCode = 1
  })

  watch?.on('close', (code, signal) => {
    if (!stopping && code !== 0) {
      process.exitCode = code ?? 1
    }
    if (signal && !stopping) {
      process.stderr.write(`taro watch exited with signal ${signal}\n`)
    }
  })

  await ready
  if (!stopping) {
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
      if (rebuildTimer) {
        clearTimeout(rebuildTimer)
      }
      rebuildTimer = setTimeout(() => {
        rebuildTimer = undefined
        void rebuild().catch((error) => {
          process.stderr.write(`${error.stack ?? error.message}\n`)
          process.exitCode = 1
          stop()
        })
      }, Number.isFinite(rebuildDebounceMs) ? rebuildDebounceMs : 600)
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
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`)
  process.exitCode = 1
})
