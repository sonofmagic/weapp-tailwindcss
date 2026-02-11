// webpack 4
import type { Compiler } from 'webpack4'
import type { AppType, IBaseWebpackPlugin, InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import process from 'node:process'
import { pluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'
import { isMpx, setupMpxTailwindcssRedirect } from '@/shared/mpx'
import { setupPatchRecorder } from '@/tailwindcss/recorder'
import { ensureRuntimeClassSet } from '@/tailwindcss/runtime'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { resolveDisabledOptions } from '@/utils/disabled'
import { resolvePackageDir } from '@/utils/resolve-package'
import { applyTailwindcssCssImportRewrite } from '../shared/css-imports'
import { setupWebpackV4EmitHook } from './v4-assets'
import { setupWebpackV4Loaders } from './v4-loaders'

const debug = createDebug()
export const weappTailwindcssPackageDir = resolvePackageDir('weapp-tailwindcss')

/**
 * @name UnifiedWebpackPluginV4
 * @description webpack4 核心转义插件
 * @link https://tw.icebreaker.top/docs/intro
 */

export class UnifiedWebpackPluginV4 implements IBaseWebpackPlugin {
  options: InternalUserDefinedOptions
  appType?: AppType

  constructor(options: UserDefinedOptions = {}) {
    this.options = getCompilerContext(options)
    this.appType = this.options.appType
  }

  apply(compiler: Compiler) {
    // 保证 options 对象存在，便于后续写入 resolve/module 等。
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

    compiler.hooks.compilation.tap(pluginName, () => {
      runtimeSetPrepared = false
    })

    async function getClassSetInLoader() {
      if (runtimeSetPrepared) {
        return
      }
      const signature = getRuntimeClassSetSignature(runtimeState.twPatcher)
      const forceRefresh = signature !== runtimeSetSignature
      runtimeSetPrepared = true
      await ensureRuntimeClassSet(runtimeState, {
        forceRefresh,
        forceCollect: true,
        clearCache: forceRefresh,
        allowEmpty: true,
      })
      runtimeSetSignature = signature
    }

    onLoad()
    setupWebpackV4Loaders({
      compiler,
      options: this.options,
      appType: this.appType,
      weappTailwindcssPackageDir,
      shouldRewriteCssImports,
      runtimeLoaderPath,
      runtimeCssImportRewriteLoaderPath,
      getClassSetInLoader,
      debug,
    })

    setupWebpackV4EmitHook({
      compiler,
      options: this.options,
      appType: this.appType,
      runtimeState,
      debug,
    })
  }
}
