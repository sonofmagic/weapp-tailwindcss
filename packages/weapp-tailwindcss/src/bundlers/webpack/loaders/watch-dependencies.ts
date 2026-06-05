import { statSync } from 'node:fs'
import path from 'node:path'

interface WebpackWatchDependencyLoaderContext {
  addDependency?: (file: string) => void
  addMissingDependency?: (file: string) => void
  addContextDependency?: (context: string) => void
}

function normalizeWebpackWatchPath(file: string) {
  return path.resolve(file)
}

export function registerWebpackWatchFile(
  loaderContext: WebpackWatchDependencyLoaderContext,
  file: string,
) {
  const resolved = normalizeWebpackWatchPath(file)
  try {
    const stats = statSync(resolved)
    if (stats.isDirectory()) {
      loaderContext.addContextDependency?.(resolved)
      return
    }
    loaderContext.addDependency?.(resolved)
  }
  catch {
    if (loaderContext.addMissingDependency) {
      loaderContext.addMissingDependency(resolved)
      return
    }
    loaderContext.addDependency?.(resolved)
  }
}

export function registerWebpackWatchContext(
  loaderContext: WebpackWatchDependencyLoaderContext,
  context: string,
) {
  loaderContext.addContextDependency?.(normalizeWebpackWatchPath(context))
}
