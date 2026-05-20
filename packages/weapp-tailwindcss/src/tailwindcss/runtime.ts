import type { RefreshTailwindcssPatcherOptions, TailwindcssPatcherLike } from '@/types'
import { createDebug } from '@/debug'
import { createTailwindV4Engine, resolveTailwindV4SourceFromPatcher } from '@/tailwindcss/v4-engine'
import { ensureTailwindcssRuntimePatch } from './runtime-patch'
import {
  getRuntimeClassSetCacheEntry,
  getRuntimeClassSetSignatureWithSources,
  invalidateRuntimeClassSet,
} from './runtime/cache'

const debug = createDebug('[tailwindcss:runtime] ')

export const refreshTailwindcssPatcherSymbol = Symbol.for('weapp-tailwindcss.refreshTailwindcssPatcher')

export interface CollectRuntimeClassSetOptions {
  force?: boolean | undefined
  skipRefresh?: boolean | undefined
  clearCache?: boolean | undefined
}

export interface RefreshTailwindRuntimeStateOptions {
  force: boolean
  clearCache?: boolean | undefined
}

export function createTailwindRuntimeReadyPromise(
  twPatcher: TailwindcssPatcherLike,
): Promise<void> {
  return Promise.resolve().then(async () => {
    await ensureTailwindcssRuntimePatch(twPatcher)
    invalidateRuntimeClassSet(twPatcher)
  })
}

export interface TailwindRuntimeState {
  twPatcher: TailwindcssPatcherLike
  readyPromise: Promise<void>
  refreshTailwindcssPatcher?: ((options?: RefreshTailwindcssPatcherOptions) => Promise<TailwindcssPatcherLike>) | undefined
}

interface RuntimeClassSetStateEntry {
  value?: Set<string> | undefined
  promise?: Promise<Set<string>> | undefined
  signature?: string | undefined
}

const runtimeClassSetStateCache = new WeakMap<TailwindRuntimeState, RuntimeClassSetStateEntry>()

function getRuntimeClassSetStateEntry(state: TailwindRuntimeState) {
  let entry = runtimeClassSetStateCache.get(state)
  if (!entry) {
    entry = {}
    runtimeClassSetStateCache.set(state, entry)
  }
  return entry
}

export async function refreshTailwindRuntimeState(
  state: TailwindRuntimeState,
  forceOrOptions: boolean | RefreshTailwindRuntimeStateOptions,
): Promise<boolean> {
  const normalizedOptions = typeof forceOrOptions === 'boolean'
    ? { force: forceOrOptions }
    : forceOrOptions
  const force = normalizedOptions.force
  const clearCache = normalizedOptions.clearCache === true

  if (!force) {
    return false
  }

  debug('refresh runtime state start, clearCache=%s major=%s', clearCache, state.twPatcher.majorVersion ?? 'unknown')
  await state.readyPromise

  let refreshed = false
  if (typeof state.refreshTailwindcssPatcher === 'function') {
    const next = await state.refreshTailwindcssPatcher({ clearCache })
    if (next !== state.twPatcher) {
      state.twPatcher = next
    }
    refreshed = true
  }

  if (refreshed) {
    state.readyPromise = createTailwindRuntimeReadyPromise(state.twPatcher)
  }

  debug('refresh runtime state end, refreshed=%s major=%s', refreshed, state.twPatcher.majorVersion ?? 'unknown')
  return refreshed
}

export interface EnsureRuntimeClassSetOptions {
  forceRefresh?: boolean | undefined
  forceCollect?: boolean | undefined
  clearCache?: boolean | undefined
  allowEmpty?: boolean | undefined
}

export async function ensureRuntimeClassSet(
  state: TailwindRuntimeState,
  options: EnsureRuntimeClassSetOptions = {},
): Promise<Set<string>> {
  const forceRefresh = options.forceRefresh === true
  const forceCollect = options.forceCollect === true
  const clearCache = options.clearCache === true
  const allowEmpty = options.allowEmpty === true

  if (forceRefresh) {
    await refreshTailwindRuntimeState(state, {
      force: true,
      clearCache,
    })
  }

  await state.readyPromise

  const entry = getRuntimeClassSetStateEntry(state)
  const signature = await getRuntimeClassSetSignatureWithSources(state.twPatcher)
  const signatureChanged = entry.signature !== signature
  const shouldForceCollect = forceCollect || forceRefresh || signatureChanged

  if (!shouldForceCollect) {
    if (entry.value && (allowEmpty || entry.value.size > 0)) {
      return entry.value
    }
    if (entry.promise) {
      return entry.promise
    }
  }

  const task = (async () => {
    const collected = await collectRuntimeClassSet(state.twPatcher, {
      force: shouldForceCollect,
      skipRefresh: true,
      clearCache,
    })

    if (allowEmpty || collected.size > 0) {
      return collected
    }

    await refreshTailwindRuntimeState(state, {
      force: true,
      clearCache: true,
    })
    await state.readyPromise
    return collectRuntimeClassSet(state.twPatcher, {
      force: true,
      skipRefresh: true,
      clearCache: true,
    })
  })()

  entry.promise = task

  try {
    const runtimeSet = await task
    entry.value = runtimeSet
    entry.signature = await getRuntimeClassSetSignatureWithSources(state.twPatcher)
    return runtimeSet
  }
  finally {
    if (entry.promise === task) {
      entry.promise = undefined
    }
  }
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
    const set = twPatcher.getClassSetSync()
    if (set && set.size === 0) {
      // 空集合通常意味着 patcher 尚未真正执行提取，继续走异步路径
      return undefined
    }
    return set
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

async function collectTailwindV4GeneratorClassSet(twPatcher: TailwindcssPatcherLike) {
  try {
    const source = await resolveTailwindV4SourceFromPatcher(twPatcher)
    const generated = await createTailwindV4Engine(source).generate({
      scanSources: true,
      target: 'tailwind',
    })
    debug('runtime class set resolved via tailwindcss v4 generator source scan, size=%d', generated.classSet.size)
    return generated.classSet
  }
  catch (error) {
    debug('tailwindcss v4 generator source scan failed, continuing fallback chain: %O', error)
    return undefined
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
        const refreshed = await refresh({ clearCache: options.clearCache === true })
        if (refreshed) {
          activePatcher = refreshed as RefreshablePatcher
        }
      }
      catch (error) {
        debug('refreshTailwindcssPatcher failed, continuing with existing patcher: %O', error)
      }
    }
  }

  const entry = getRuntimeClassSetCacheEntry(activePatcher)
  const signature = await getRuntimeClassSetSignatureWithSources(activePatcher)

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
    await ensureTailwindcssRuntimePatch(activePatcher)

    // force 场景先抓一份 sync 快照作为兜底，避免 extract() 在某些环境返回空集合后
    // 破坏本轮 JS/WXML 转译结果（例如构建链路中 class set 尚未落盘的瞬时状态）。
    const preExtractSyncSet = options.force
      ? tryGetRuntimeClassSetSync(activePatcher)
      : undefined
    if (preExtractSyncSet) {
      debug('runtime class set snapshot via getClassSetSync() before extract(), size=%d', preExtractSyncSet.size)
    }

    // 强制收集时优先走 extract()：
    // 在多构建/热更新场景下，sync class set 可能受上轮缓存影响而滞后，
    // 先用 extract() 能拿到更接近当前源码状态的类集合。
    const preferExtract = options.force === true

    try {
      const result = await activePatcher.extract({ write: false })
      if (result?.classSet) {
        if (result.classSet.size > 0) {
          debug('runtime class set resolved via extract(), size=%d', result.classSet.size)
          return result.classSet
        }
        if (preferExtract && activePatcher.majorVersion !== 4) {
          debug('runtime class set resolved via empty extract() on force collect, size=0')
          return result.classSet
        }
        if (preferExtract) {
          debug('runtime class set from extract() is empty on force collect, fallback to generator/sync/async class set')
        }
        else {
          debug('runtime class set from extract() is empty, fallback to sync/async class set')
        }
      }
    }
    catch (error) {
      debug('extract() failed, fallback to getClassSet(): %O', error)
    }

    if (activePatcher.majorVersion === 4) {
      const generatorClassSet = await collectTailwindV4GeneratorClassSet(activePatcher)
      if (generatorClassSet && generatorClassSet.size > 0) {
        return generatorClassSet
      }
    }

    if (preExtractSyncSet) {
      debug('runtime class set fallback to pre-extract sync snapshot, size=%d', preExtractSyncSet.size)
      return preExtractSyncSet
    }

    const syncSet = tryGetRuntimeClassSetSync(activePatcher)
    if (syncSet) {
      debug('runtime class set resolved via getClassSetSync(), size=%d', syncSet.size)
      return syncSet
    }

    try {
      const fallbackSet = await Promise.resolve(activePatcher.getClassSet())
      if (fallbackSet) {
        debug('runtime class set resolved via getClassSet(), size=%d', fallbackSet.size)
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

export { collectRuntimeClassSet, invalidateRuntimeClassSet }
