import type { Plugin, ResolvedConfig } from 'vite'
import type { UserDefinedOptions } from '@/types'
import process from 'node:process'
import postcssHtmlTransform from '@weapp-tailwindcss/postcss/html-transform'
import { vitePluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { toCustomAttributesEntities } from '@/context/custom-attributes'
import { createDebug } from '@/debug'
import { setupPatchRecorder } from '@/tailwindcss/recorder'
import { collectRuntimeClassSet, refreshTailwindRuntimeState } from '@/tailwindcss/runtime'
import { createUniAppXPlugins } from '@/uni-app-x'
import { resolveUniUtsPlatform } from '@/utils'
import { resolveDisabledOptions } from '@/utils/disabled'
import { resolvePackageDir } from '@/utils/resolve-package'
import { createGenerateBundleHook } from './generate-bundle'
import { createRewriteCssImportsPlugins } from './rewrite-css-imports'
import { slash } from './utils'

const debug = createDebug()
const weappTailwindcssPackageDir = resolvePackageDir('weapp-tailwindcss')
const weappTailwindcssDirPosix = slash(weappTailwindcssPackageDir)

/**
 * @name UnifiedViteWeappTailwindcssPlugin
 * @description uni-app vite vue3 版本插件
 * @link https://tw.icebreaker.top/docs/quick-start/frameworks/uni-app-vite
 */
export function UnifiedViteWeappTailwindcssPlugin(options: UserDefinedOptions = {}): Plugin[] | undefined {
  const rewriteCssImportsSpecified = Object.prototype.hasOwnProperty.call(options, 'rewriteCssImports')
  const opts = getCompilerContext(options)
  const {
    disabled,
    customAttributes,
    onLoad,
    mainCssChunkMatcher,
    appType,
    styleHandler,
    jsHandler,
    twPatcher: initialTwPatcher,
    refreshTailwindcssPatcher,
    uniAppX,
    disabledDefaultTemplateHandler,
  } = opts

  const disabledOptions = resolveDisabledOptions(disabled)
  const tailwindcssMajorVersion = initialTwPatcher.majorVersion ?? 0
  const shouldRewriteCssImports = opts.rewriteCssImports !== false
    && !disabledOptions.rewriteCssImports
    && (rewriteCssImportsSpecified || tailwindcssMajorVersion >= 4)
  const rewritePlugins = createRewriteCssImportsPlugins({
    appType,
    shouldRewrite: shouldRewriteCssImports,
    weappTailwindcssDirPosix,
  })

  if (disabledOptions.plugin) {
    return rewritePlugins.length ? rewritePlugins : undefined
  }

  const customAttributesEntities = toCustomAttributesEntities(customAttributes)

  const patchRecorderState = setupPatchRecorder(initialTwPatcher, opts.tailwindcssBasedir, {
    source: 'runtime',
    cwd: opts.tailwindcssBasedir ?? process.cwd(),
  })

  const runtimeState = {
    twPatcher: initialTwPatcher,
    patchPromise: patchRecorderState.patchPromise,
    refreshTailwindcssPatcher,
    onPatchCompleted: patchRecorderState.onPatchCompleted,
  }
  let runtimeSet: Set<string> | undefined
  let runtimeSetPromise: Promise<Set<string>> | undefined
  let resolvedConfig: ResolvedConfig | undefined

  async function refreshRuntimeState(force: boolean) {
    const refreshed = await refreshTailwindRuntimeState(runtimeState, force)
    if (refreshed) {
      runtimeSet = undefined
      runtimeSetPromise = undefined
    }
  }

  async function ensureRuntimeClassSet(force = false): Promise<Set<string>> {
    await refreshRuntimeState(force)
    await runtimeState.patchPromise
    if (!force && runtimeSet) {
      return runtimeSet
    }

    if (force || !runtimeSetPromise) {
      const task = collectRuntimeClassSet(runtimeState.twPatcher, {
        force: force || !runtimeSet,
        skipRefresh: force,
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
  onLoad()
  const getResolvedConfig = () => resolvedConfig
  const utsPlatform = resolveUniUtsPlatform()
  const isIosPlatform = utsPlatform.isAppIos
  const uniAppXPlugins = uniAppX
    ? createUniAppXPlugins({
        appType,
        customAttributesEntities,
        disabledDefaultTemplateHandler,
        isIosPlatform,
        mainCssChunkMatcher,
        runtimeState,
        styleHandler,
        jsHandler,
        ensureRuntimeClassSet,
        getResolvedConfig,
      })
    : undefined

  const plugins: Plugin[] = [
    ...rewritePlugins,
    {
      name: `${vitePluginName}:post`,
      enforce: 'post',
      configResolved(config) {
        resolvedConfig = config
        if (typeof config.css.postcss === 'object' && Array.isArray(config.css.postcss.plugins)) {
          const idx = config.css.postcss.plugins.findIndex(x =>
            // @ts-ignore
            x.postcssPlugin === 'postcss-html-transform')
          if (idx > -1) {
            config.css.postcss.plugins.splice(idx, 1, postcssHtmlTransform())
            debug('remove postcss-html-transform plugin from vite config')
          }
        }
      },
      generateBundle: createGenerateBundleHook({
        opts,
        runtimeState,
        ensureRuntimeClassSet,
        debug,
        getResolvedConfig,
      }),
    },
  ]
  if (uniAppXPlugins) {
    plugins.push(...uniAppXPlugins)
  }
  return plugins
}
