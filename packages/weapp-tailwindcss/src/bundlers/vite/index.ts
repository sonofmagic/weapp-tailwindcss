import type { Plugin, ResolvedConfig } from 'vite'
import type { BundleSnapshot } from './bundle-state'
import type { UserDefinedOptions } from '@/types'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import postcssHtmlTransform from '@weapp-tailwindcss/postcss/html-transform'
import { vitePluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { toCustomAttributesEntities } from '@/context/custom-attributes'
import { findNearestPackageRoot } from '@/context/workspace'
import { createDebug } from '@/debug'
import { findTailwindConfig } from '@/tailwindcss/patcher-resolve'
import { setupPatchRecorder } from '@/tailwindcss/recorder'
import { collectRuntimeClassSet, refreshTailwindRuntimeState } from '@/tailwindcss/runtime'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { createUniAppXPlugins } from '@/uni-app-x'
import { resolveUniUtsPlatform } from '@/utils'
import { resolveDisabledOptions } from '@/utils/disabled'
import { resolvePackageDir } from '@/utils/resolve-package'
import { createGenerateBundleHook } from './generate-bundle'
import { createBundleRuntimeClassSetManager } from './incremental-runtime-class-set'
import { createRewriteCssImportsPlugins } from './rewrite-css-imports'
import { slash } from './utils'

const debug = createDebug()
const weappTailwindcssPackageDir = resolvePackageDir('weapp-tailwindcss')
const weappTailwindcssDirPosix = slash(weappTailwindcssPackageDir)
const PACKAGE_JSON_FILE = 'package.json'

function resolveImplicitTailwindcssBasedirFromViteRoot(root: string) {
  const resolvedRoot = path.resolve(root)
  if (!existsSync(resolvedRoot)) {
    return resolvedRoot
  }
  const searchRoots: string[] = []
  let current = resolvedRoot

  while (true) {
    searchRoots.push(current)
    const parent = path.dirname(current)
    if (parent === current) {
      break
    }
    current = parent
  }

  const tailwindConfigPath = findTailwindConfig(searchRoots)
  if (tailwindConfigPath) {
    return path.dirname(tailwindConfigPath)
  }

  const packageRoot = findNearestPackageRoot(resolvedRoot)
  if (packageRoot && existsSync(path.join(packageRoot, PACKAGE_JSON_FILE))) {
    return packageRoot
  }

  return resolvedRoot
}

/**
 * @name UnifiedViteWeappTailwindcssPlugin
 * @description uni-app vite vue3 版本插件
 * @link https://tw.icebreaker.top/docs/quick-start/frameworks/uni-app-vite
 */
export function UnifiedViteWeappTailwindcssPlugin(options: UserDefinedOptions = {}): Plugin[] | undefined {
  const rewriteCssImportsSpecified = Object.hasOwn(options, 'rewriteCssImports')
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
  const bundleRuntimeClassSetManager = createBundleRuntimeClassSetManager()

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

  async function ensureBundleRuntimeClassSet(snapshot: BundleSnapshot, forceRefresh = false) {
    const forceRuntimeRefresh = forceRefresh || process.env.WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH === '1'
    const invalidation = resolveRuntimeRefreshOptions()
    const shouldRefreshPatcher = forceRuntimeRefresh || invalidation.changed
    const forceCollectBySource = snapshot.runtimeAffectingChangedByType.html.size > 0
      || snapshot.runtimeAffectingChangedByType.js.size > 0

    await refreshRuntimeState(shouldRefreshPatcher)
    await runtimeState.patchPromise

    if (shouldRefreshPatcher) {
      runtimeSet = undefined
      runtimeSetPromise = undefined
      await bundleRuntimeClassSetManager.reset()
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
        ) {
          const nextTailwindcssBasedir = resolveImplicitTailwindcssBasedirFromViteRoot(resolvedRoot)
          if (opts.tailwindcssBasedir !== nextTailwindcssBasedir) {
            const previousBasedir = opts.tailwindcssBasedir
            opts.tailwindcssBasedir = nextTailwindcssBasedir
            debug(
              'align tailwindcss basedir with vite root: %s -> %s',
              previousBasedir ?? 'undefined',
              nextTailwindcssBasedir,
            )
            await refreshRuntimeState(true)
          }
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
        ensureBundleRuntimeClassSet,
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
