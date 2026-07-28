import type { HmrContext } from 'vite'
import { resolveHotTailwindCssModules, sendFullReloadForUnresolvedHotUpdate } from '@/bundlers/vite/hot-css-modules'

interface CreateUniAppXNativeHmrReloaderOptions {
  ensureRuntimeClassSet: (force?: boolean) => Promise<Set<string>>
  isNativeAppBuildTarget: (id?: string) => boolean
  tailwindRootCssModuleIds: Iterable<string>
  viteProcessedCssSourceFiles: Iterable<string>
}

export function createUniAppXNativeHmrReloader(
  options: CreateUniAppXNativeHmrReloaderOptions,
) {
  let previousRuntimeClassSet: Set<string> | undefined

  function remember(runtimeClassSet: Set<string>) {
    previousRuntimeClassSet = new Set(runtimeClassSet)
    return runtimeClassSet
  }

  async function refreshBaseline() {
    return remember(await options.ensureRuntimeClassSet(true))
  }

  async function handleHotUpdate(ctx: HmrContext) {
    if (!options.isNativeAppBuildTarget(ctx.file)) {
      return
    }
    const cssModules = ctx.server?.moduleGraph
      ? resolveHotTailwindCssModules(ctx, new Set([
          ...options.tailwindRootCssModuleIds,
          ...options.viteProcessedCssSourceFiles,
        ]))
      : []
    const currentRuntimeClassSet = await options.ensureRuntimeClassSet(true)
    const hasAddedClass = previousRuntimeClassSet !== undefined
      && [...currentRuntimeClassSet].some(candidate => !previousRuntimeClassSet!.has(candidate))
    remember(currentRuntimeClassSet)
    if (hasAddedClass) {
      sendFullReloadForUnresolvedHotUpdate(ctx)
    }
    return cssModules.length > 0 ? [...new Set([...ctx.modules, ...cssModules])] : undefined
  }

  return {
    handleHotUpdate,
    refreshBaseline,
    remember,
  }
}
