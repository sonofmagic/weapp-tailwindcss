import type { Plugin, ResolvedConfig } from 'vite'
import type { UserDefinedOptions } from '@/types'
import path from 'node:path'
import process from 'node:process'
import postcssHtmlTransform from '@weapp-tailwindcss/postcss/html-transform'
import { vitePluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { toCustomAttributesEntities } from '@/context/custom-attributes'
import { createDebug } from '@/debug'
import { setupPatchRecorder } from '@/tailwindcss/recorder'
import { collectRuntimeClassSet, refreshTailwindRuntimeState } from '@/tailwindcss/runtime'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
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
  // eslint-disable-next-line e18e/prefer-object-has-own -- lib 为 ES2021，不支持 Object.hasOwn
  const rewriteCssImportsSpecified = Object.prototype.hasOwnProperty.call(options, 'rewriteCssImports')
  const hasExplicitTailwindcssBasedir = typeof options.tailwindcssBasedir === 'string'
    && options.tailwindcssBasedir.trim().length > 0
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
  let runtimeRefreshSignature: string | undefined
  let runtimeRefreshOptionsKey: string | undefined

  function resolveRuntimeRefreshOptions() {
    const configPath = runtimeState.twPatcher.options?.tailwind?.config
    const signature = getRuntimeClassSetSignature(runtimeState.twPatcher)
    const optionsKey = JSON.stringify({
      appType,
      uniAppX: Boolean(uniAppX),
      customAttributesEntities,
      disabledDefaultTemplateHandler,
      configPath,
      rewriteCssImports: shouldRewriteCssImports,
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
    const forceRuntimeRefresh = force || process.env.WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH === '1'
    await refreshRuntimeState(force)
    await runtimeState.patchPromise
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
      async configResolved(config) {
        resolvedConfig = config
        const resolvedRoot = config.root ? path.resolve(config.root) : undefined
        if (
          !hasExplicitTailwindcssBasedir
          && resolvedRoot
          && opts.tailwindcssBasedir !== resolvedRoot
        ) {
          const previousBasedir = opts.tailwindcssBasedir
          opts.tailwindcssBasedir = resolvedRoot
          debug('align tailwindcss basedir with vite root: %s -> %s', previousBasedir ?? 'undefined', resolvedRoot)
          await refreshRuntimeState(true)
        }
        if (typeof config.css.postcss === 'object' && Array.isArray(config.css.postcss.plugins)) {
          const postcssPlugins = config.css.postcss.plugins as unknown[]
          const idx = postcssPlugins.findIndex(x =>
            // @ts-ignore
            x.postcssPlugin === 'postcss-html-transform')
          if (idx > -1) {
            postcssPlugins.splice(idx, 1, postcssHtmlTransform())
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
