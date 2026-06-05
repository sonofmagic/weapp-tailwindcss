import { spawn } from 'node:child_process'
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const READY_RE = /compiled successfully|built in [\d.]+m?s?|构建完成/i
const WEAK_READY_RE = /watching for file changes/i
const sourceDirs = ['src']
const ignoredDirs = new Set(['dist', 'node_modules', '.git'])
const taroBuildGuardPath = path.resolve(import.meta.dirname, './taro-build-guard.mjs')
const ensureWeappTailwindcssBuiltPath = path.resolve(import.meta.dirname, './ensure-weapp-tailwindcss-built.mjs')
const forceNativeWatch = process.env.TARO_E2E_WATCH_NATIVE === '1'
const forcePollingWatch = process.env.TARO_E2E_WATCH_NATIVE === '0'
const forcePollingRestart = process.env.TARO_E2E_WATCH_RESTART === '1'
const rebuildDebounceMs = Number(process.env.TARO_E2E_REBUILD_DEBOUNCE_MS ?? 600)
const buildRetryDelayMs = Number(process.env.TARO_E2E_BUILD_RETRY_DELAY_MS ?? 500)

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isTaroDistCleanupRace(error) {
  const message = `${error?.stack ?? error?.message ?? error}\n${error?.output ?? ''}`
  return message.includes('ENOENT: no such file or directory, lstat')
    && message.includes(`${path.sep}dist${path.sep}`)
}

async function isTaroViteProject() {
  try {
    const packageJson = JSON.parse(await readFile(path.resolve(process.cwd(), 'package.json'), 'utf8'))
    if (packageJson.devDependencies?.['@tarojs/vite-runner'] || packageJson.dependencies?.['@tarojs/vite-runner']) {
      return true
    }
  }
  catch {
  }

  try {
    const config = await readFile(path.resolve(process.cwd(), 'config/index.ts'), 'utf8')
    return /compiler\s*:\s*\{[\s\S]*?type\s*:\s*['"]vite['"]/.test(config)
  }
  catch {
    return false
  }
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
  const onData = (chunk, output = process.stdout) => {
    const text = chunk.toString()
    output.write(text)
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
    onData(chunk, process.stderr)
  })
}

async function runBuild() {
  await new Promise((resolve, reject) => {
    let output = ''
    const build = spawn(process.execPath, [taroBuildGuardPath], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        TARO_BUILD_STRICT: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    build.stdout?.on('data', (chunk) => {
      const text = chunk.toString()
      output += text
      process.stdout.write(text)
    })
    build.stderr?.on('data', (chunk) => {
      const text = chunk.toString()
      output += text
      process.stderr.write(text)
    })
    build.on('error', reject)
    build.on('close', (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }
      const error = new Error(`taro build failed: ${signal ?? code}`)
      error.output = output
      reject(error)
    })
  })
}

async function runBuildWithRetry() {
  try {
    await runBuild()
  }
  catch (error) {
    if (!isTaroDistCleanupRace(error)) {
      throw error
    }
    process.stderr.write('[taro-e2e-watch] Taro dist cleanup race detected, retrying build once.\n')
    await sleep(Number.isFinite(buildRetryDelayMs) ? buildRetryDelayMs : 500)
    await runBuild()
  }
}

async function runEnsureBuild() {
  await new Promise((resolve, reject) => {
    const build = spawn(process.execPath, [ensureWeappTailwindcssBuiltPath], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    })
    build.on('error', reject)
    build.on('close', (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`ensure weapp-tailwindcss build failed: ${signal ?? code}`))
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
  const taroViteProject = await isTaroViteProject()
  // Taro Vite 的原生 watch 已经能稳定响应源码变更。默认只保留一个 watch 进程，
  // 避免每次变更重启 production build，把真实增量耗时放大到数秒。
  const restartNativeWatchOnChange = forcePollingRestart && !forceNativeWatch && !forcePollingWatch && taroViteProject
  const skipNativeWatch = forcePollingWatch
  process.stdout.write(`[taro-e2e-watch] mode=${restartNativeWatchOnChange ? 'vite-polling-restart' : skipNativeWatch ? 'polling-build' : 'native-watch'} cwd=${process.cwd()}\n`)
  // e2e watch 只预构建一次，后续直接调用 Taro guard，避免 npm lifecycle 反复清理 dist 触发自循环。
  await runEnsureBuild()
  let resolveReady
  const ready = skipNativeWatch
    ? runBuildWithRetry()
    : new Promise((resolve) => {
        resolveReady = resolve
      })
  let watch
  let restartingNativeWatch = false
  let restartQueued = false
  let stopping = false
  let building = false
  let queued = false
  let pollTimer
  let rebuildTimer
  let requestNativeRestart = () => {
    restartQueued = true
  }
  const startNativeWatch = () => {
    const child = spawn(process.execPath, [taroBuildGuardPath, '--watch'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    pipeWithReady(child, resolveReady)
    child.on('error', (error) => {
      process.stderr.write(`${error.stack ?? error.message}\n`)
      process.exitCode = 1
    })

    child.on('close', (code, signal) => {
      if (restartingNativeWatch) {
        restartingNativeWatch = false
        watch = startNativeWatch()
        if (restartQueued) {
          restartQueued = false
          requestNativeRestart()
        }
        return
      }
      if (!stopping && code !== 0) {
        process.exitCode = code ?? 1
      }
      if (signal && !stopping) {
        process.stderr.write(`taro watch exited with signal ${signal}\n`)
      }
    })
    return child
  }

  if (!skipNativeWatch) {
    watch = startNativeWatch()
  }
  let lastSnapshot = await collectSnapshot()

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

  await ready
  if (!stopping && restartNativeWatchOnChange) {
    process.stdout.write('[taro-e2e-watch] Taro Vite detected, enabling polling restart fallback.\n')
    requestNativeRestart = () => {
      if (rebuildTimer) {
        clearTimeout(rebuildTimer)
      }
      rebuildTimer = setTimeout(() => {
        rebuildTimer = undefined
        if (stopping) {
          return
        }
        if (restartingNativeWatch) {
          restartQueued = true
          return
        }
        restartingNativeWatch = true
        watch?.kill('SIGTERM')
      }, Number.isFinite(rebuildDebounceMs) ? rebuildDebounceMs : 600)
    }
    pollTimer = setInterval(() => {
      void collectSnapshot().then((nextSnapshot) => {
        if (hasSnapshotChanged(lastSnapshot, nextSnapshot)) {
          lastSnapshot = nextSnapshot
          requestNativeRestart()
        }
      }).catch((error) => {
        process.stderr.write(`${error.stack ?? error.message}\n`)
        process.exitCode = 1
        stop()
      })
    }, 250)
  }
  else if (!stopping && skipNativeWatch) {
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
          await runBuildWithRetry()
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
