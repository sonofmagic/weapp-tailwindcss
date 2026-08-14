import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import * as parcelWatcher from '@parcel/watcher'
import fg from 'fast-glob'

async function snapshot(cwd: string, dependencies: ReadonlySet<string>, output?: string) {
  const files = new Set([...dependencies, ...await fg('**/*', { cwd, absolute: true, dot: true, onlyFiles: true, ignore: ['node_modules/**', '.git/**'] })])
  if (output && output !== '-') {
    files.delete(path.resolve(output))
  }
  const state = new Map<string, string>()
  await Promise.all([...files].map(async (file) => {
    try {
      const [stat, content] = await Promise.all([fs.stat(file), fs.readFile(file)])
      const digest = createHash('sha256').update(content).digest('hex')
      state.set(path.resolve(file), `${stat.mtimeMs}:${stat.size}:${digest}`)
    }
    catch {}
  }))
  return state
}

function changed(previous: Map<string, string>, next: Map<string, string>) {
  if (previous.size !== next.size) {
    return true
  }
  for (const [file, value] of next) {
    if (previous.get(file) !== value) {
      return true
    }
  }
  return false
}

export async function watchBuildInputs(options: {
  cwd: string
  interval: number
  mode: 'native' | 'poll'
  output?: string
  rebuild: () => Promise<Set<string>>
}) {
  if (options.mode === 'native') {
    try {
      return await watchWithNativeWatcher(options)
    }
    catch (error) {
      // 原生后端在受限容器或网络文件系统中可能不可用，自动保留可用的轮询行为。
      process.stderr.write(`Native watcher unavailable, falling back to polling: ${error instanceof Error ? error.message : String(error)}\n`)
      return watchWithPolling(options)
    }
  }
  return watchWithPolling(options)
}

async function watchWithPolling(options: {
  cwd: string
  interval: number
  output?: string
  rebuild: () => Promise<Set<string>>
}) {
  let dependencies = new Set<string>()
  const previous = await snapshot(options.cwd, dependencies, options.output)
  dependencies = await options.rebuild()

  // 初始构建才会发现项目目录之外的配置和插件依赖，只补充基线中尚不存在的文件。
  // 项目目录内在构建期间发生的修改必须保留，交给第一次轮询触发后续构建。
  const initialized = await snapshot(options.cwd, dependencies, options.output)
  for (const [file, value] of initialized) {
    if (!previous.has(file)) {
      previous.set(file, value)
    }
  }

  await new Promise<void>((resolve) => {
    let running = false
    const timer = setInterval(async () => {
      if (running) {
        return
      }
      running = true
      try {
        const next = await snapshot(options.cwd, dependencies, options.output)
        if (changed(previous, next)) {
          previous.clear()
          for (const [file, value] of next) {
            previous.set(file, value)
          }
          dependencies = await options.rebuild()
        }
      }
      catch (error) {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
      }
      finally {
        running = false
      }
    }, options.interval)
    const stop = () => {
      clearInterval(timer)
      resolve()
    }
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
  })
}

function parentDirectories(files: ReadonlySet<string>, cwd: string) {
  const directories = new Set([path.resolve(cwd)])
  for (const file of files) {
    const absolute = path.resolve(file)
    if (!absolute.startsWith(`${path.resolve(cwd)}${path.sep}`)) {
      directories.add(path.dirname(absolute))
    }
  }
  return directories
}

async function watchWithNativeWatcher(options: {
  cwd: string
  output?: string
  rebuild: () => Promise<Set<string>>
}) {
  let dependencies = new Set<string>()
  let subscriptions: parcelWatcher.AsyncSubscription[] = []
  let running = false
  let pending = false
  let resolvePending: (() => void) | undefined
  const output = options.output && options.output !== '-' ? path.resolve(options.output) : undefined

  const requestRebuild = () => {
    pending = true
    resolvePending?.()
  }

  const subscribe = async () => {
    await Promise.all(subscriptions.map(subscription => subscription.unsubscribe()))
    subscriptions = []
    for (const directory of parentDirectories(dependencies, options.cwd)) {
      const subscription = await parcelWatcher.subscribe(directory, (error, events) => {
        if (error) {
          process.stderr.write(`${error.message}\n`)
          return
        }
        if (events.some(event => !output || path.resolve(event.path) !== output)) {
          requestRebuild()
        }
      }, { ignore: ['**/node_modules/**', '**/.git/**'] })
      subscriptions.push(subscription)
    }
  }

  // 先建立目录订阅再进行首次构建，避免首次构建期间的修改丢失。
  await subscribe()
  dependencies = await options.rebuild()
  await subscribe()

  await new Promise<void>((resolve) => {
    const stop = () => {
      void Promise.all(subscriptions.map(subscription => subscription.unsubscribe())).finally(resolve)
    }
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
    const loop = async () => {
      while (true) {
        if (pending) {
          break
        }
        await new Promise<void>((wake) => {
          resolvePending = wake
        })
        resolvePending = undefined
      }
      if (running) {
        return
      }
      running = true
      pending = false
      try {
        dependencies = await options.rebuild()
        await subscribe()
      }
      catch (error) {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
      }
      finally {
        running = false
        if (pending) {
          void loop()
        }
      }
    }
    void loop()
  })
}
