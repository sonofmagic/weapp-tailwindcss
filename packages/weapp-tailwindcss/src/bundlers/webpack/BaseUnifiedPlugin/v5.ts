// webpack 5
import type { TailwindV4CssSource } from 'tailwindcss-patch'
import type { Compiler } from 'webpack'
import type { AppType, IBaseWebpackPlugin, InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import path from 'node:path'
import { pluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'
import { isMpx, setupMpxTailwindcssRedirect } from '@/shared/mpx'
import { resolveTailwindcssOptions } from '@/tailwindcss/patcher-options'
import { createTailwindRuntimeReadyPromise, ensureRuntimeClassSet, refreshTailwindRuntimeState } from '@/tailwindcss/runtime'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { hasConfiguredTailwindV4CssRoots, upsertTailwindV4CssSource } from '@/tailwindcss/v4/css-sources'
import { resolvePluginDisabledState } from '@/utils/disabled'
import { resolvePackageDir } from '@/utils/resolve-package'
import { isWatchFileInRuntimeDependencies } from './shared'
import { setupWebpackV5ProcessAssetsHook } from './v5-assets'
import { setupWebpackV5Loaders } from './v5-loaders'

const debug = createDebug()
export const weappTailwindcssPackageDir = resolvePackageDir('weapp-tailwindcss')

/**
 * @name UnifiedWebpackPluginV5
 * @description webpack5 核心转义插件
 * @link https://tw.icebreaker.top/docs/intro
 */

export class UnifiedWebpackPluginV5 implements IBaseWebpackPlugin {
  options: InternalUserDefinedOptions
  appType?: AppType
  private hasInitialTailwindCssRoots: boolean

  constructor(options: UserDefinedOptions = {}) {
    this.hasInitialTailwindCssRoots = hasConfiguredTailwindV4CssRoots(options)
    this.options = getCompilerContext({
      ...options,
      __internalDeferMissingCssEntriesWarning: true,
    } as UserDefinedOptions)
    this.appType = this.options.appType
  }

  apply(compiler: Compiler) {
    compiler.options = compiler.options || {} as any
    const {
      disabled,
      onLoad,
      runtimeLoaderPath,
      twPatcher: initialTwPatcher,
      refreshTailwindcssPatcher,
    } = this.options

    const disabledOptions = resolvePluginDisabledState(disabled)
    const isTailwindcssV4 = (initialTwPatcher.majorVersion ?? 0) >= 4
    const shouldRewriteCssImports = isTailwindcssV4
    const isMpxApp = isMpx(this.appType)
    if (shouldRewriteCssImports) {
      setupMpxTailwindcssRedirect(weappTailwindcssPackageDir, isMpxApp)
    }
    if (disabledOptions.plugin) {
      return
    }
    const readyPromise = createTailwindRuntimeReadyPromise(initialTwPatcher)
    const runtimeState = {
      twPatcher: initialTwPatcher,
      readyPromise,
      refreshTailwindcssPatcher,
    }

    let runtimeSetPrepared = false
    let runtimeSetSignature: string | undefined
    let runtimeRefreshRequiredForCompilation = false
    let watchRunObserved = false
    const runtimeWatchDependencyFiles = new Set<string>()
    const runtimeWatchDependencyContexts = new Set<string>()
    let runtimeMetadataPrepared = false

    const updateRuntimeWatchDependencies = async () => {
      runtimeWatchDependencyFiles.clear()
      runtimeWatchDependencyContexts.clear()

      const tailwindOptions = resolveTailwindcssOptions(runtimeState.twPatcher.options)
      if (tailwindOptions?.config) {
        runtimeWatchDependencyFiles.add(tailwindOptions.config)
      }
      for (const entry of tailwindOptions?.v4?.cssEntries ?? []) {
        runtimeWatchDependencyFiles.add(entry)
      }
      for (const source of tailwindOptions?.v4?.cssSources ?? []) {
        if (source.file) {
          runtimeWatchDependencyFiles.add(source.file)
        }
        for (const dependency of source.dependencies ?? []) {
          runtimeWatchDependencyFiles.add(dependency)
        }
      }
      for (const source of tailwindOptions?.v4?.sources ?? []) {
        if (source?.base) {
          runtimeWatchDependencyContexts.add(source.base)
        }
      }

      if (typeof runtimeState.twPatcher.collectContentTokens !== 'function') {
        return
      }

      try {
        const report = await runtimeState.twPatcher.collectContentTokens()
        for (const entry of report.entries ?? []) {
          if (entry.file) {
            runtimeWatchDependencyFiles.add(entry.file)
          }
        }
        for (const source of report.sources ?? []) {
          if (source?.base) {
            runtimeWatchDependencyContexts.add(source.base)
          }
        }
      }
      catch (error) {
        debug('collect runtime watch dependencies failed: %O', error)
      }
    }

    const ensureRuntimeMetadata = async (force = false) => {
      if (runtimeMetadataPrepared && !force) {
        return
      }
      await updateRuntimeWatchDependencies()
      runtimeMetadataPrepared = true
    }

    const collectWatchChangedFiles = () => {
      const compilerLike = compiler as Compiler & {
        modifiedFiles?: Set<string>
        removedFiles?: Set<string>
      }
      return new Set([
        ...(compilerLike.modifiedFiles ?? []),
        ...(compilerLike.removedFiles ?? []),
      ])
    }

    const hasRuntimeDependencyChanges = (files: Iterable<string>) => {
      for (const file of files) {
        if (isWatchFileInRuntimeDependencies(file, {
          contexts: runtimeWatchDependencyContexts,
          files: runtimeWatchDependencyFiles,
        })) {
          return true
        }
      }
      return false
    }

    const syncRuntimeRefreshRequirement = (markWatchRun = false) => {
      if (markWatchRun) {
        watchRunObserved = true
      }
      const changedFiles = collectWatchChangedFiles()
      runtimeRefreshRequiredForCompilation = runtimeRefreshRequiredForCompilation
        || hasRuntimeDependencyChanges(changedFiles)
    }

    const resetRuntimePreparation = () => {
      runtimeSetPrepared = false
      syncRuntimeRefreshRequirement()
    }

    const registerAutoCssSource = async (source: TailwindV4CssSource) => {
      if (
        this.hasInitialTailwindCssRoots
        || (runtimeState.twPatcher.majorVersion ?? 0) < 4
        || !source.file
      ) {
        return
      }
      const changed = upsertTailwindV4CssSource(this.options, source)
      if (!changed) {
        return
      }
      runtimeSetPrepared = false
      runtimeMetadataPrepared = false
      runtimeRefreshRequiredForCompilation = true
      await refreshTailwindRuntimeState(runtimeState, {
        force: true,
        clearCache: true,
      })
      debug('detected tailwindcss v4 css source from webpack css module: %s', source.file)
    }

    compiler.hooks.invalid?.tap?.(pluginName, (fileName?: string) => {
      if (!fileName) {
        return
      }
      runtimeRefreshRequiredForCompilation = runtimeRefreshRequiredForCompilation
        || hasRuntimeDependencyChanges([path.resolve(fileName)])
    })
    compiler.hooks.watchRun?.tap?.(pluginName, () => syncRuntimeRefreshRequirement(true))
    if (compiler.hooks.thisCompilation?.tap) {
      compiler.hooks.thisCompilation.tap(pluginName, resetRuntimePreparation)
    }
    else if (compiler.hooks.compilation?.tap) {
      compiler.hooks.compilation.tap(pluginName, resetRuntimePreparation)
    }

    async function getClassSetInLoader() {
      if (runtimeSetPrepared) {
        return
      }
      const signature = getRuntimeClassSetSignature(runtimeState.twPatcher)
      const forceRefresh = runtimeRefreshRequiredForCompilation || signature !== runtimeSetSignature
      debug('runtime loader ensure class set forceRefresh=%s watchDirty=%s signatureChanged=%s', forceRefresh, runtimeRefreshRequiredForCompilation, signature !== runtimeSetSignature)
      runtimeSetPrepared = true
      await ensureRuntimeClassSet(runtimeState, {
        forceRefresh,
        forceCollect: forceRefresh || !watchRunObserved,
        clearCache: forceRefresh,
        allowEmpty: true,
      })
      await ensureRuntimeMetadata(forceRefresh)
      runtimeSetSignature = signature
      runtimeRefreshRequiredForCompilation = false
    }

    onLoad()
    setupWebpackV5Loaders({
      compiler,
      options: this.options,
      appType: this.appType,
      weappTailwindcssPackageDir,
      shouldRewriteCssImports,
      runtimeLoaderPath,
      registerAutoCssSource,
      getClassSetInLoader,
      getRuntimeWatchDependencies() {
        return {
          files: runtimeWatchDependencyFiles,
          contexts: runtimeWatchDependencyContexts,
        }
      },
      debug,
    })

    setupWebpackV5ProcessAssetsHook({
      compiler,
      options: this.options,
      appType: this.appType,
      runtimeState,
      getRuntimeRefreshRequirement: () => runtimeRefreshRequiredForCompilation,
      refreshRuntimeMetadata: ensureRuntimeMetadata,
      consumeRuntimeRefreshRequirement() {
        runtimeRefreshRequiredForCompilation = false
      },
      isWatchMode: () => watchRunObserved || compiler.options?.watch === true,
      runtimeClassSetManager: (this.options as any).__internalWebpackRuntimeClassSetManager,
      debug,
    })
  }
}
