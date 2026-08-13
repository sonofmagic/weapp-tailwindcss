import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import fg from 'fast-glob'

async function snapshot(cwd: string, dependencies: ReadonlySet<string>, output?: string) {
  const files = new Set([...dependencies, ...await fg('**/*', { cwd, absolute: true, dot: true, onlyFiles: true, ignore: ['node_modules/**', '.git/**'] })])
  if (output && output !== '-') {
    files.delete(path.resolve(output))
  }
  const state = new Map<string, string>()
  await Promise.all([...files].map(async (file) => {
    try {
      const stat = await fs.stat(file)
      state.set(path.resolve(file), `${stat.mtimeMs}:${stat.size}`)
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
  dependencies: Set<string>
  interval: number
  output?: string
  rebuild: () => Promise<Set<string>>
}) {
  let dependencies = options.dependencies
  let previous = await snapshot(options.cwd, dependencies, options.output)
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
          previous = next
          dependencies = await options.rebuild()
          previous = await snapshot(options.cwd, dependencies, options.output)
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
