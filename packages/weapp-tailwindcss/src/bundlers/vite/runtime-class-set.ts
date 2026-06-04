import type { BundleSnapshot } from './bundle-state'
import type { InternalUserDefinedOptions } from '@/types'
import process from 'node:process'
import { resolveTailwindcssOptions } from '@/tailwindcss/patcher-options'
import {
  collectRuntimeClassSet,
  createTailwindRuntimeReadyPromise,
  refreshTailwindRuntimeState,
} from '@/tailwindcss/runtime'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { createBundleRuntimeClassSetManager } from './incremental-runtime-class-set'

interface CreateViteRuntimeClassSetOptions {
  opts: InternalUserDefinedOptions
  initialTwPatcher: InternalUserDefinedOptions['twPatcher']
  refreshTailwindcssPatcher: InternalUserDefinedOptions['refreshTailwindcssPatcher']
  uniAppXEnabled: boolean
  customAttributesEntities: unknown
  disabledDefaultTemplateHandler: boolean
  debug: (format: string, ...args: unknown[]) => void
}

export function createViteRuntimeClassSet(options: CreateViteRuntimeClassSetOptions) {
  const {
    opts,
    initialTwPatcher,
    refreshTailwindcssPatcher,
    uniAppXEnabled,
    customAttributesEntities,
    disabledDefaultTemplateHandler,
    debug,
  } = options
  const readyPromise = createTailwindRuntimeReadyPromise(initialTwPatcher)
  const runtimeState = {
    twPatcher: initialTwPatcher,
    readyPromise,
    refreshTailwindcssPatcher,
  }
  const bundleRuntimeClassSetManager = createBundleRuntimeClassSetManager({
    bareArbitraryValues: opts.arbitraryValues?.bareArbitraryValues,
  })
  const transformRuntimeClassSetManager = createBundleRuntimeClassSetManager({
    bareArbitraryValues: opts.arbitraryValues?.bareArbitraryValues,
  })
  let runtimeSet: Set<string> | undefined
  let runtimeSetPromise: Promise<Set<string>> | undefined
  let runtimeRefreshSignature: string | undefined
  let runtimeRefreshOptionsKey: string | undefined

  function resolveRuntimeRefreshOptions() {
    const configPath = resolveTailwindcssOptions(runtimeState.twPatcher.options)?.config
    const signature = getRuntimeClassSetSignature(runtimeState.twPatcher)
    const optionsKey = JSON.stringify({
      appType: opts.appType,
      uniAppX: uniAppXEnabled,
      customAttributesEntities,
      disabledDefaultTemplateHandler,
      configPath,
    })
    const changed = signature !== runtimeRefreshSignature || optionsKey !== runtimeRefreshOptionsKey
    runtimeRefreshSignature = signature
    runtimeRefreshOptionsKey = optionsKey
    return {
      changed,
      signature,
      optionsKey,
    }
  }

  async function refreshRuntimeState(force: boolean) {
    const invalidation = resolveRuntimeRefreshOptions()
    const shouldRefresh = force || invalidation.changed
    const refreshed = await refreshTailwindRuntimeState(runtimeState, {
      force: shouldRefresh,
      clearCache: force || invalidation.changed,
    })
    if (invalidation.changed) {
      debug('runtime signature changed, refresh triggered. signature: %s', invalidation.signature)
    }
    if (refreshed) {
      runtimeSet = undefined
      runtimeSetPromise = undefined
    }
  }

  async function ensureRuntimeClassSet(force = false): Promise<Set<string>> {
    const forceRuntimeRefresh = force || process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH'] === '1'
    await refreshRuntimeState(force)
    await runtimeState.readyPromise
    if (!forceRuntimeRefresh && runtimeSet) {
      return runtimeSet
    }

    if (forceRuntimeRefresh || !runtimeSetPromise) {
      const invalidation = resolveRuntimeRefreshOptions()
      const task = collectRuntimeClassSet(runtimeState.twPatcher, {
        force: forceRuntimeRefresh || invalidation.changed,
        skipRefresh: forceRuntimeRefresh,
        clearCache: forceRuntimeRefresh || invalidation.changed,
      })
      runtimeSetPromise = task
    }

    const task = runtimeSetPromise!
    try {
      runtimeSet = await task
      return runtimeSet
    }
    finally {
      if (runtimeSetPromise === task) {
        runtimeSetPromise = undefined
      }
    }
  }

  async function ensureBundleRuntimeClassSet(
    snapshot: BundleSnapshot,
    forceRefresh = false,
    options: {
      allowBaselineOnlyInitialSync?: boolean | undefined
      baseClassSet?: Set<string> | undefined
      transformOnly?: boolean | undefined
    } = {},
  ) {
    const forceRuntimeRefresh = forceRefresh || process.env['WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH'] === '1'
    const invalidation = resolveRuntimeRefreshOptions()
    const shouldRefreshPatcher = forceRuntimeRefresh || invalidation.changed
    const forceCollectBySource = snapshot.runtimeAffectingChangedByType.html.size > 0
      || snapshot.runtimeAffectingChangedByType.js.size > 0

    await refreshRuntimeState(shouldRefreshPatcher)
    await runtimeState.readyPromise

    if (shouldRefreshPatcher) {
      runtimeSet = undefined
      runtimeSetPromise = undefined
      await bundleRuntimeClassSetManager.reset()
      await transformRuntimeClassSetManager.reset()
    }

    if (runtimeState.twPatcher.majorVersion === 4 && !forceRuntimeRefresh) {
      try {
        const nextRuntimeSet = await bundleRuntimeClassSetManager.sync(runtimeState.twPatcher, snapshot)
        runtimeSet = nextRuntimeSet
        return nextRuntimeSet
      }
      catch (error) {
        debug('incremental runtime set sync failed, fallback to full collect: %O', error)
        await bundleRuntimeClassSetManager.reset()
      }
    }

    if (runtimeState.twPatcher.majorVersion === 3 && !forceRuntimeRefresh) {
      if (options.transformOnly) {
        try {
          return await transformRuntimeClassSetManager.sync(runtimeState.twPatcher, snapshot)
        }
        catch (error) {
          debug('incremental transform runtime set sync failed, fallback to full collect: %O', error)
          await transformRuntimeClassSetManager.reset()
        }
      }

      try {
        let baseClassSet = options.baseClassSet
        if (!baseClassSet && (!runtimeSet || shouldRefreshPatcher)) {
          baseClassSet = await collectRuntimeClassSet(runtimeState.twPatcher, {
            force: true,
            skipRefresh: shouldRefreshPatcher,
            clearCache: shouldRefreshPatcher,
          })
        }
        const nextRuntimeSet = await bundleRuntimeClassSetManager.sync(runtimeState.twPatcher, snapshot, {
          baseClassSet: baseClassSet ?? (
            options.allowBaselineOnlyInitialSync === true ? runtimeSet : undefined
          ),
          skipInitialFullScanWithBase: options.allowBaselineOnlyInitialSync === true && Boolean(runtimeSet),
        })
        runtimeSet = nextRuntimeSet
        return nextRuntimeSet
      }
      catch (error) {
        debug('incremental runtime set sync failed, fallback to full collect: %O', error)
        await bundleRuntimeClassSetManager.reset()
      }
    }

    if (!forceRuntimeRefresh && !invalidation.changed && !forceCollectBySource && runtimeSet) {
      return runtimeSet
    }

    const task = collectRuntimeClassSet(runtimeState.twPatcher, {
      force: forceRuntimeRefresh || invalidation.changed || forceCollectBySource,
      skipRefresh: forceRuntimeRefresh,
      clearCache: forceRuntimeRefresh || invalidation.changed,
    })
    runtimeSetPromise = task

    try {
      runtimeSet = await task
      return runtimeSet
    }
    finally {
      if (runtimeSetPromise === task) {
        runtimeSetPromise = undefined
      }
    }
  }

  return {
    runtimeState,
    refreshRuntimeState,
    ensureRuntimeClassSet,
    ensureBundleRuntimeClassSet,
  }
}
