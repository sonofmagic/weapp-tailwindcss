// webpack 5
import type { Compiler } from 'webpack'
import type { AppType, IBaseWebpackPlugin, InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { pluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'
import { isMpx, setupMpxTailwindcssRedirect } from '@/shared/mpx'
import { resolveTailwindcssOptions } from '@/tailwindcss/patcher-options'
import { setupPatchRecorder } from '@/tailwindcss/recorder'
import { ensureRuntimeClassSet } from '@/tailwindcss/runtime'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { resolveDisabledOptions } from '@/utils/disabled'
import { resolvePackageDir } from '@/utils/resolve-package'
import { applyTailwindcssCssImportRewrite } from '../shared/css-imports'
import { hasWatchChanges } from './shared'
import { setupWebpackV5ProcessAssetsHook } from './v5-assets'
import { setupWebpackV5Loaders } from './v5-loaders'

const debug = createDebug()
export const weappTailwindcssPackageDir = resolvePackageDir('weapp-tailwindcss')
const AUTHORED_CSS_CLASS_RE = /\.([\w-]+)/g

/**
 * @name UnifiedWebpackPluginV5
 * @description webpack5 核心转义插件
 * @link https://tw.icebreaker.top/docs/intro
 */

export class UnifiedWebpackPluginV5 implements IBaseWebpackPlugin {
  options: InternalUserDefinedOptions
  appType?: AppType

  constructor(options: UserDefinedOptions = {}) {
    this.options = getCompilerContext(options)
    this.appType = this.options.appType
  }

  apply(compiler: Compiler) {
    compiler.options = compiler.options || {} as any
    const {
      disabled,
      onLoad,
      runtimeLoaderPath,
      runtimeCssImportRewriteLoaderPath,
      twPatcher: initialTwPatcher,
      refreshTailwindcssPatcher,
    } = this.options

    const disabledOptions = resolveDisabledOptions(disabled)
    const isTailwindcssV4 = (initialTwPatcher.majorVersion ?? 0) >= 4
    const shouldRewriteCssImports = isTailwindcssV4
      && this.options.rewriteCssImports !== false
      && !disabledOptions.rewriteCssImports
    const isMpxApp = isMpx(this.appType)
    if (shouldRewriteCssImports) {
      applyTailwindcssCssImportRewrite(compiler, {
        pkgDir: weappTailwindcssPackageDir,
        enabled: true,
        appType: this.appType,
      })
      setupMpxTailwindcssRedirect(weappTailwindcssPackageDir, isMpxApp)
    }
    if (disabledOptions.plugin) {
      return
    }
    const patchRecorderState = setupPatchRecorder(initialTwPatcher, this.options.tailwindcssBasedir, {
      source: 'runtime',
      cwd: this.options.tailwindcssBasedir ?? process.cwd(),
    })
    const runtimeState = {
      twPatcher: initialTwPatcher,
      patchPromise: patchRecorderState.patchPromise,
      refreshTailwindcssPatcher,
      onPatchCompleted: patchRecorderState.onPatchCompleted,
    }

    let runtimeSetPrepared = false
    let runtimeSetSignature: string | undefined
    let runtimeRefreshRequiredForCompilation = false
    const runtimeWatchDependencyFiles = new Set<string>()
    const runtimeWatchDependencyContexts = new Set<string>()
    const runtimeAuthoredCssClasses = new Set<string>()
    let runtimeMetadataPrepared = false

    const collectAuthoredCssClasses = async (cssEntries: string[]) => {
      runtimeAuthoredCssClasses.clear()
      for (const entry of cssEntries) {
        try {
          const content = await readFile(entry, 'utf8')
          for (const match of content.matchAll(AUTHORED_CSS_CLASS_RE)) {
            const className = match[1]
            if (className) {
              runtimeAuthoredCssClasses.add(className)
            }
          }
        }
        catch (error) {
          debug('collect authored css classes failed for %s: %O', entry, error)
        }
      }
    }

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
      for (const source of tailwindOptions?.v4?.sources ?? []) {
        if (source?.base) {
          runtimeWatchDependencyContexts.add(source.base)
        }
      }
      await collectAuthoredCssClasses(tailwindOptions?.v4?.cssEntries ?? [])

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

    const syncRuntimeRefreshRequirement = () => {
      runtimeRefreshRequiredForCompilation = runtimeRefreshRequiredForCompilation || hasWatchChanges(compiler as Compiler & {
        modifiedFiles?: Set<string>
        removedFiles?: Set<string>
      })
    }

    const resetRuntimePreparation = () => {
      runtimeSetPrepared = false
      runtimeMetadataPrepared = false
      syncRuntimeRefreshRequirement()
    }

    compiler.hooks.invalid?.tap?.(pluginName, () => {
      runtimeRefreshRequiredForCompilation = true
    })
    compiler.hooks.watchRun?.tap?.(pluginName, syncRuntimeRefreshRequirement)
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
        forceCollect: true,
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
      runtimeCssImportRewriteLoaderPath,
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
      getRuntimeAuthoredCssClasses: () => runtimeAuthoredCssClasses,
      refreshRuntimeMetadata: ensureRuntimeMetadata,
      consumeRuntimeRefreshRequirement() {
        runtimeRefreshRequiredForCompilation = false
      },
      debug,
    })
  }
}
