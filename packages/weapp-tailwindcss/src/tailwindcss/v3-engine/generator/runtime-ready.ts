import type { TailwindV3ResolvedSource } from '../types'
import { createTailwindcssPatcher } from '@/tailwindcss/patcher'
import { ensureTailwindcssRuntimePatch } from '@/tailwindcss/runtime-patch'

const runtimeReadyPromiseCache = new Map<string, Promise<void>>()

function createRuntimeReadyCacheKey(source: TailwindV3ResolvedSource, rootPath: string | undefined) {
  return [
    source.packageName,
    source.postcssPlugin,
    rootPath ?? 'missing',
    source.config ?? 'config:missing',
    source.cwd,
  ].join('\0')
}

export function createRuntimeReadyPromise(source: TailwindV3ResolvedSource) {
  const patcher = createTailwindcssPatcher({
    basedir: source.cwd,
    supportCustomLengthUnitsPatch: true,
    tailwindcss: {
      ...(source.config === undefined ? {} : { config: source.config }),
      cwd: source.cwd,
      packageName: source.packageName,
      postcssPlugin: source.postcssPlugin,
      version: 3,
    },
  })
  const cacheKey = createRuntimeReadyCacheKey(source, patcher.packageInfo?.rootPath)
  const cached = runtimeReadyPromiseCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const task = ensureTailwindcssRuntimePatch(patcher, {
    clearRequireCache: true,
  }).catch((error) => {
    runtimeReadyPromiseCache.delete(cacheKey)
    throw error
  })
  runtimeReadyPromiseCache.set(cacheKey, task)
  return task
}
