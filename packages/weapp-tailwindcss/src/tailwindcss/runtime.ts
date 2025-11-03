import type { TailwindcssPatcherLike } from '@/types'
import { statSync } from 'node:fs'
import { createDebug } from '@/debug'

const debug = createDebug('[tailwindcss:runtime] ')

interface RuntimeClassSetCacheEntry {
  value?: Set<string>
  promise?: Promise<Set<string>>
  signature?: string
}

const runtimeClassSetCache = new WeakMap<TailwindcssPatcherLike, RuntimeClassSetCacheEntry>()

export interface CollectRuntimeClassSetOptions {
  force?: boolean
}

function getCacheEntry(twPatcher: TailwindcssPatcherLike) {
  let entry = runtimeClassSetCache.get(twPatcher)
  if (!entry) {
    entry = {}
    runtimeClassSetCache.set(twPatcher, entry)
  }
  return entry
}

function getTailwindConfigSignature(twPatcher: TailwindcssPatcherLike): string | undefined {
  const configPath = twPatcher.options?.tailwind?.config
  if (typeof configPath !== 'string' || configPath.length === 0) {
    return undefined
  }
  try {
    const stats = statSync(configPath)
    return `${configPath}:${stats.size}:${stats.mtimeMs}`
  }
  catch {
    return `${configPath}:missing`
  }
}

export function invalidateRuntimeClassSet(twPatcher?: TailwindcssPatcherLike) {
  if (!twPatcher) {
    return
  }
  runtimeClassSetCache.delete(twPatcher)
}

export function createTailwindPatchPromise(twPatcher: TailwindcssPatcherLike): Promise<unknown> {
  return Promise.resolve(twPatcher.patch()).then((result) => {
    invalidateRuntimeClassSet(twPatcher)
    return result
  })
}

function shouldPreferSync(majorVersion: number | undefined) {
  if (majorVersion == null) {
    return true
  }
  if (majorVersion === 3) {
    return true
  }
  if (majorVersion === 4) {
    return true
  }
  return false
}

function tryGetRuntimeClassSetSync(twPatcher: TailwindcssPatcherLike) {
  if (typeof twPatcher.getClassSetSync !== 'function') {
    return undefined
  }

  if (!shouldPreferSync(twPatcher.majorVersion)) {
    return undefined
  }

  try {
    return twPatcher.getClassSetSync()
  }
  catch (error) {
    if (twPatcher.majorVersion === 4) {
      debug('getClassSetSync() unavailable for tailwindcss v4, fallback to async getClassSet(): %O', error)
    }
    else {
      debug('getClassSetSync() failed, fallback to async getClassSet(): %O', error)
    }
    return undefined
  }
}

async function collectRuntimeClassSet(
  twPatcher: TailwindcssPatcherLike,
  options: CollectRuntimeClassSetOptions = {},
): Promise<Set<string>> {
  const entry = getCacheEntry(twPatcher)
  const signature = getTailwindConfigSignature(twPatcher)

  if (!options.force) {
    if (entry.value && entry.signature === signature) {
      return entry.value
    }
    if (entry.promise) {
      return entry.promise
    }
  }
  else {
    entry.value = undefined
  }

  const task = (async () => {
    const syncSet = tryGetRuntimeClassSetSync(twPatcher)
    if (syncSet) {
      return syncSet
    }

    try {
      const result = await twPatcher.extract({ write: false })
      if (result?.classSet) {
        return result.classSet
      }
    }
    catch (error) {
      debug('extract() failed, fallback to getClassSet(): %O', error)
    }

    try {
      const fallbackSet = await Promise.resolve(twPatcher.getClassSet())
      if (fallbackSet) {
        return fallbackSet
      }
    }
    catch (error) {
      debug('getClassSet() failed, returning empty set: %O', error)
    }

    return new Set<string>()
  })()

  entry.promise = task
  entry.signature = signature

  try {
    const resolved = await task
    entry.value = resolved
    entry.promise = undefined
    entry.signature = signature
    return resolved
  }
  catch (error) {
    entry.promise = undefined
    throw error
  }
}

export { collectRuntimeClassSet }
