import type { RefreshTailwindcssPatcherOptions, TailwindcssPatcherLike } from '@/types'
import { statSync } from 'node:fs'
import { createDebug } from '@/debug'

const debug = createDebug('[tailwindcss:runtime] ')

export const refreshTailwindcssPatcherSymbol = Symbol.for('weapp-tailwindcss.refreshTailwindcssPatcher')

interface RuntimeClassSetCacheEntry {
  value?: Set<string>
  promise?: Promise<Set<string>>
  signature?: string
}

const runtimeClassSetCache = new WeakMap<TailwindcssPatcherLike, RuntimeClassSetCacheEntry>()

export interface CollectRuntimeClassSetOptions {
  force?: boolean
  skipRefresh?: boolean
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

export interface TailwindRuntimeState {
  twPatcher: TailwindcssPatcherLike
  patchPromise: Promise<unknown>
  refreshTailwindcssPatcher?: (options?: RefreshTailwindcssPatcherOptions) => Promise<TailwindcssPatcherLike>
}

export async function refreshTailwindRuntimeState(
  state: TailwindRuntimeState,
  force: boolean,
): Promise<boolean> {
  if (!force) {
    return false
  }

  await state.patchPromise

  let refreshed = false
  if (typeof state.refreshTailwindcssPatcher === 'function') {
    const next = await state.refreshTailwindcssPatcher({ clearCache: true })
    if (next !== state.twPatcher) {
      state.twPatcher = next
    }
    refreshed = true
  }

  if (refreshed) {
    state.patchPromise = createTailwindPatchPromise(state.twPatcher)
  }

  return refreshed
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

async function mergeContentTokensIntoSet(
  twPatcher: TailwindcssPatcherLike,
  target: Set<string>,
) {
  if (typeof twPatcher.collectContentTokens !== 'function') {
    return
  }

  try {
    const report = await twPatcher.collectContentTokens()
    const entries = report?.entries
    if (!Array.isArray(entries)) {
      return
    }
    for (const entry of entries) {
      const candidate = entry?.rawCandidate
      if (typeof candidate === 'string' && candidate.length > 0) {
        target.add(candidate)
      }
    }
  }
  catch (error) {
    debug('collectContentTokens() failed, continuing without merged tokens: %O', error)
  }
}

async function collectRuntimeClassSet(
  twPatcher: TailwindcssPatcherLike,
  options: CollectRuntimeClassSetOptions = {},
): Promise<Set<string>> {
  type RefreshablePatcher = TailwindcssPatcherLike & {
    [refreshTailwindcssPatcherSymbol]?: (options?: RefreshTailwindcssPatcherOptions) => Promise<TailwindcssPatcherLike>
  }

  let activePatcher = twPatcher as RefreshablePatcher

  if (options.force && !options.skipRefresh) {
    const refresh = activePatcher[refreshTailwindcssPatcherSymbol]
    if (typeof refresh === 'function') {
      try {
        const refreshed = await refresh({ clearCache: true })
        if (refreshed) {
          activePatcher = refreshed as RefreshablePatcher
        }
      }
      catch (error) {
        debug('refreshTailwindcssPatcher failed, continuing with existing patcher: %O', error)
      }
    }
  }

  const entry = getCacheEntry(activePatcher)
  const signature = getTailwindConfigSignature(activePatcher)
  const shouldAugmentWithTokens = options.force || !entry.value

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
    const syncSet = tryGetRuntimeClassSetSync(activePatcher)
    if (syncSet) {
      return syncSet
    }

    try {
      const result = await activePatcher.extract({ write: false })
      if (result?.classSet) {
        return result.classSet
      }
    }
    catch (error) {
      debug('extract() failed, fallback to getClassSet(): %O', error)
    }

    try {
      const fallbackSet = await Promise.resolve(activePatcher.getClassSet())
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
    if (shouldAugmentWithTokens) {
      await mergeContentTokensIntoSet(activePatcher, resolved)
    }
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
