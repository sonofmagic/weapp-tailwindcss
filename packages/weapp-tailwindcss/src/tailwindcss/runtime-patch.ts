import type { TailwindcssPatcherLike } from '@/types'
import { createRequire } from 'node:module'
import path from 'node:path'
import { createDebug } from '@/debug'
import { runtimeSignaturePatchersSymbol } from './runtime/cache'

const debug = createDebug('[tailwindcss:runtime-patch] ')
const require = createRequire(import.meta.url)

const runtimePatchPromiseCache = new WeakMap<TailwindcssPatcherLike, Promise<void>>()

export interface EnsureTailwindcssRuntimePatchOptions {
  clearRequireCache?: boolean
}

function getNestedPatchers(twPatcher: TailwindcssPatcherLike) {
  const nested = (twPatcher as TailwindcssPatcherLike & {
    [runtimeSignaturePatchersSymbol]?: TailwindcssPatcherLike[]
  })[runtimeSignaturePatchersSymbol]
  return Array.isArray(nested) && nested.length > 0 ? nested : undefined
}

function shouldApplyRuntimePatch(twPatcher: TailwindcssPatcherLike) {
  return twPatcher.majorVersion === 3 && typeof twPatcher.patch === 'function'
}

function clearTailwindcssRequireCache(twPatcher: TailwindcssPatcherLike) {
  const rootPath = twPatcher.packageInfo?.rootPath
  if (!rootPath) {
    return
  }

  const normalizedRoot = path.resolve(rootPath)
  let count = 0
  for (const id of Object.keys(require.cache)) {
    const normalizedId = path.resolve(id)
    if (normalizedId === normalizedRoot || normalizedId.startsWith(`${normalizedRoot}${path.sep}`)) {
      delete require.cache[id]
      count += 1
    }
  }
  if (count > 0) {
    debug('clear tailwindcss require cache after runtime patch, count=%d root=%s', count, normalizedRoot)
  }
}

export async function ensureTailwindcssRuntimePatch(
  twPatcher: TailwindcssPatcherLike,
  options: EnsureTailwindcssRuntimePatchOptions = {},
): Promise<void> {
  const nestedPatchers = getNestedPatchers(twPatcher)
  if (nestedPatchers) {
    await Promise.all(nestedPatchers.map(patcher => ensureTailwindcssRuntimePatch(patcher)))
    return
  }

  if (!shouldApplyRuntimePatch(twPatcher)) {
    return
  }

  const cached = runtimePatchPromiseCache.get(twPatcher)
  if (cached) {
    await cached
    if (options.clearRequireCache) {
      clearTailwindcssRequireCache(twPatcher)
    }
    return
  }

  const task = Promise.resolve()
    .then(async () => {
      debug(
        'apply tailwindcss runtime patch, package=%s version=%s root=%s',
        twPatcher.packageInfo?.name ?? 'tailwindcss',
        twPatcher.packageInfo?.version ?? 'unknown',
        twPatcher.packageInfo?.rootPath ?? 'unknown',
      )
      await twPatcher.patch?.()
      if (options.clearRequireCache) {
        clearTailwindcssRequireCache(twPatcher)
      }
    })
    .catch((error) => {
      runtimePatchPromiseCache.delete(twPatcher)
      throw error
    })

  runtimePatchPromiseCache.set(twPatcher, task)
  return task
}
