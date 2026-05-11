import type { Plugin, ResolvedConfig } from 'vite'
import type { BundleSnapshot } from './bundle-state'
import type { UserDefinedOptions } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import postcssHtmlTransform from '@weapp-tailwindcss/postcss/html-transform'
import { vitePluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { toCustomAttributesEntities } from '@/context/custom-attributes'
import { createDebug } from '@/debug'
import { resolveTailwindcssOptions } from '@/tailwindcss/patcher-options'
import { collectRuntimeClassSet, createTailwindRuntimeReadyPromise, refreshTailwindRuntimeState } from '@/tailwindcss/runtime'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { createUniAppXPlugins } from '@/uni-app-x'
import { isUniAppXEnabled } from '@/uni-app-x/options'
import { resolveUniUtsPlatform } from '@/utils'
import { resolvePluginDisabledState } from '@/utils/disabled'
import { resolvePackageDir } from '@/utils/resolve-package'
import { normalizeOutputPathKey } from '../shared/module-graph'
import { createViteCssFinalizerOutputPlugin } from './css-finalizer'
import { createGenerateBundleHook } from './generate-bundle'
import { createBundleRuntimeClassSetManager } from './incremental-runtime-class-set'
import { disableAndRemoveTailwindVitePlugins, getPostcssPluginName, removeTailwindPostcssPlugins, removeTailwindVitePlugins } from './official-tailwind-plugins'
import { resolveFilteredPostcssConfig } from './postcss-config'
import { resolveImplicitAppTypeFromViteRoot } from './resolve-app-type'
import { createRewriteCssImportsPlugins } from './rewrite-css-imports'
import { createSourceCandidateCollector, isSourceCandidateRequest } from './source-candidates'
import { resolveImplicitTailwindcssBasedirFromViteRoot } from './tailwind-basedir'
import { slash } from './utils'

const debug = createDebug()
const weappTailwindcssPackageDir = resolvePackageDir('weapp-tailwindcss')
const weappTailwindcssDirPosix = slash(weappTailwindcssPackageDir)

/**
 * @name WeappTailwindcss
 * @description uni-app vite / uni-app-x 版本插件
 * @link https://tw.icebreaker.top/docs/quick-start/frameworks/uni-app-vite
 */
export function WeappTailwindcss(options: UserDefinedOptions = {}): Plugin[] | undefined {
  const hasExplicitAppType = typeof options.appType === 'string' && options.appType.trim().length > 0
  const hasExplicitTailwindcssBasedir = typeof options.tailwindcssBasedir === 'string'
    && options.tailwindcssBasedir.trim().length > 0
  const opts = getCompilerContext(options)
  const {
    disabled,
    customAttributes,
    onLoad,
    mainCssChunkMatcher,
    styleHandler,
    jsHandler,
    twPatcher: initialTwPatcher,
    refreshTailwindcssPatcher,
    uniAppX,
    disabledDefaultTemplateHandler,
  } = opts
  const uniAppXEnabled = isUniAppXEnabled(uniAppX)

  const disabledOptions = resolvePluginDisabledState(disabled)
  const tailwindcssMajorVersion = initialTwPatcher.majorVersion ?? 0
  const shouldOwnTailwindGeneration = !disabledOptions.plugin
  const shouldRewriteCssImports = tailwindcssMajorVersion >= 4
  const rewritePlugins = createRewriteCssImportsPlugins({
    getAppType: () => opts.appType,
    rootImport: shouldOwnTailwindGeneration
      ? `${weappTailwindcssDirPosix}/generator-placeholder.css`
      : undefined,
    shouldOwnTailwindGeneration,
    shouldRewrite: shouldRewriteCssImports,
    weappTailwindcssDirPosix,
  })

  if (disabledOptions.plugin) {
    return rewritePlugins.length ? rewritePlugins : undefined
  }

  const customAttributesEntities = toCustomAttributesEntities(customAttributes)

  const readyPromise = createTailwindRuntimeReadyPromise(initialTwPatcher)

  const runtimeState = {
    twPatcher: initialTwPatcher,
    readyPromise,
    refreshTailwindcssPatcher,
  }
  let runtimeSet: Set<string> | undefined
  let runtimeSetPromise: Promise<Set<string>> | undefined
  let resolvedConfig: ResolvedConfig | undefined
  let runtimeRefreshSignature: string | undefined
  let runtimeRefreshOptionsKey: string | undefined
  let recordedGeneratorCandidates: Set<string> | undefined
  const bundleRuntimeClassSetManager = createBundleRuntimeClassSetManager()
  const sourceCandidateCollector = createSourceCandidateCollector()
  const pendingSourceCandidateSyncs = new Set<Promise<void>>()
  const processedCssAssets = new WeakSet<object>()
  const processedCssAssetFiles = new Set<string>()
  const rememberedMainCssSources = new Map<string, string>()
  const rememberedMainCssSignatureByFile = new Map<string, string>()

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
    const forceRuntimeRefresh = force || process.env.WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH === '1'
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

  async function ensureBundleRuntimeClassSet(snapshot: BundleSnapshot, forceRefresh = false) {
    const forceRuntimeRefresh = forceRefresh || process.env.WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH === '1'
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
  const markCssAssetProcessed = (asset: { source: unknown }, file?: string) => {
    processedCssAssets.add(asset)
    if (file) {
      processedCssAssetFiles.add(normalizeOutputPathKey(file))
    }
  }
  const isCssAssetProcessed = (asset: { source: unknown }, file?: string) => {
    return processedCssAssets.has(asset)
      || (file ? processedCssAssetFiles.has(normalizeOutputPathKey(file)) : false)
  }
  const recordGeneratorCandidates = (candidates: Set<string>) => {
    recordedGeneratorCandidates = new Set(candidates)
  }
  const getRecordedGeneratorCandidates = () => recordedGeneratorCandidates
  const getSourceCandidates = () => sourceCandidateCollector.values()
  const isWatchBuild = () => resolvedConfig?.command === 'build' && resolvedConfig.build.watch != null
  const waitForSourceCandidateSyncs = async () => {
    while (pendingSourceCandidateSyncs.size > 0) {
      await Promise.all(pendingSourceCandidateSyncs)
    }
  }
  const syncChangedSourceCandidateFile = (id: string) => {
    if (!shouldOwnTailwindGeneration || !isSourceCandidateRequest(id)) {
      return Promise.resolve()
    }
    const task = sourceCandidateCollector.syncFile(id)
      .catch((error) => {
        debug('source candidate watch sync failed: %s %O', id, error)
      })
      .finally(() => {
        pendingSourceCandidateSyncs.delete(task)
      })
    pendingSourceCandidateSyncs.add(task)
    return task
  }
  const rememberMainCssSource = (file: string, rawSource: string, cssRuntimeSignature?: string) => {
    rememberedMainCssSources.set(file, rawSource)
    if (cssRuntimeSignature) {
      rememberedMainCssSignatureByFile.set(file, cssRuntimeSignature)
    }
  }
  const getRememberedMainCssSources = () => rememberedMainCssSources
  const getRememberedMainCssSignature = (file: string) => rememberedMainCssSignatureByFile.get(file)
  const setRememberedMainCssSignature = (file: string, cssRuntimeSignature: string) => {
    rememberedMainCssSignatureByFile.set(file, cssRuntimeSignature)
  }
  const cssFinalizerOutputPlugin = createViteCssFinalizerOutputPlugin({
    opts,
    runtimeState,
    ensureRuntimeClassSet,
    debug,
    getResolvedConfig,
    markCssAssetProcessed,
    isCssAssetProcessed,
    getRecordedGeneratorCandidates,
    getSourceCandidates,
    waitForSourceCandidateSyncs,
    rememberMainCssSource,
  })
  const utsPlatform = resolveUniUtsPlatform()
  const isIosPlatform = utsPlatform.isAppIos
  const uniAppXPlugins = uniAppXEnabled
    ? createUniAppXPlugins({
        appType: opts.appType ?? 'uni-app-x',
        customAttributesEntities,
        disabledDefaultTemplateHandler,
        isIosPlatform,
        mainCssChunkMatcher,
        runtimeState,
        styleHandler,
        jsHandler,
        ensureRuntimeClassSet,
        getResolvedConfig,
        uniAppX,
      })
    : undefined

  const plugins: Plugin[] = [
    ...rewritePlugins,
    {
      name: `${vitePluginName}:source-candidates`,
      enforce: 'pre',
      async transform(code, id) {
        if (!shouldOwnTailwindGeneration || !isSourceCandidateRequest(id)) {
          return
        }
        await sourceCandidateCollector.sync(id, code)
      },
      async watchChange(id, change) {
        if (change.event === 'delete') {
          sourceCandidateCollector.remove(id)
          return
        }
        await syncChangedSourceCandidateFile(id)
      },
      async handleHotUpdate(ctx) {
        await syncChangedSourceCandidateFile(ctx.file)
      },
      async buildStart() {
        if (!shouldOwnTailwindGeneration) {
          return
        }
        if (resolvedConfig?.command === 'build' && !isWatchBuild()) {
          sourceCandidateCollector.clear()
        }
        const root = resolvedConfig?.root ?? process.cwd()
        const outDir = resolvedConfig?.build?.outDir
        await sourceCandidateCollector.scanRoot({
          root,
          outDir,
        })
        const basedir = opts.tailwindcssBasedir ? path.resolve(opts.tailwindcssBasedir) : undefined
        if (basedir && basedir !== path.resolve(root)) {
          await sourceCandidateCollector.scanRoot({
            root: basedir,
            outDir,
          })
        }
        for (const cssEntry of opts.tailwindcss?.cssEntries ?? []) {
          const cssEntryRoot = path.dirname(path.resolve(cssEntry))
          if (cssEntryRoot !== path.resolve(root) && cssEntryRoot !== basedir) {
            await sourceCandidateCollector.scanRoot({
              root: cssEntryRoot,
              outDir,
            })
          }
        }
      },
    },
    {
      name: `${vitePluginName}:post`,
      enforce: 'post',
      config(config) {
        if (!shouldOwnTailwindGeneration) {
          return
        }
        if (Array.isArray(config.plugins)) {
          const removed = disableAndRemoveTailwindVitePlugins(config.plugins)
          if (removed > 0) {
            debug('disable official tailwind vite plugins in generator mode: %d', removed)
          }
        }
        const root = config.root ? path.resolve(config.root) : process.cwd()
        const baseConfig = {
          resolve: {
            alias: [
              {
                find: /^tailwindcss$/,
                replacement: path.join(weappTailwindcssPackageDir, 'generator-placeholder.css'),
              },
            ],
          },
        }
        if (config.css?.postcss !== undefined) {
          return baseConfig
        }
        return resolveFilteredPostcssConfig(root).then((postcssConfig) => {
          if (!postcssConfig) {
            return baseConfig
          }
          debug('inline filtered postcss config without official tailwind plugins in generator mode: %d', postcssConfig.removed)
          return {
            ...baseConfig,
            css: {
              postcss: {
                ...postcssConfig.options,
                plugins: postcssConfig.plugins,
              },
            },
          }
        })
      },
      async configResolved(config) {
        resolvedConfig = config
        if (shouldOwnTailwindGeneration) {
          const removed = Array.isArray(config.plugins)
            ? removeTailwindVitePlugins(config.plugins)
            : 0
          if (removed > 0) {
            debug('remove official tailwind vite plugins in generator mode: %d', removed)
          }
        }
        const resolvedRoot = config.root ? path.resolve(config.root) : undefined
        let shouldRefreshRuntime = false
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
            shouldRefreshRuntime = true
          }
        }
        if (
          !hasExplicitAppType
          && resolvedRoot
        ) {
          const nextAppType = resolveImplicitAppTypeFromViteRoot(resolvedRoot)
          if (nextAppType && opts.appType !== nextAppType) {
            const previousAppType = opts.appType
            opts.appType = nextAppType
            logger.info('根据 Vite 项目根目录自动推断 appType -> %s', nextAppType)
            debug(
              'align appType with vite root: %s -> %s',
              previousAppType ?? 'undefined',
              nextAppType,
            )
            shouldRefreshRuntime = true
          }
        }
        if (shouldRefreshRuntime) {
          await refreshRuntimeState(true)
        }
        if (typeof config.css.postcss === 'object' && Array.isArray(config.css.postcss.plugins)) {
          const postcssPlugins = config.css.postcss.plugins as unknown[]
          if (shouldOwnTailwindGeneration) {
            const removed = removeTailwindPostcssPlugins(postcssPlugins)
            if (removed > 0) {
              debug('remove official tailwind postcss plugins in generator mode: %d', removed)
            }
          }
          const idx = postcssPlugins.findIndex(x =>
            getPostcssPluginName(x) === 'postcss-html-transform')
          if (idx > -1) {
            postcssPlugins.splice(idx, 1, postcssHtmlTransform())
            debug('remove postcss-html-transform plugin from vite config')
          }
        }
      },
      generateBundle: {
        order: 'post',
        handler: createGenerateBundleHook({
          opts,
          runtimeState,
          ensureRuntimeClassSet,
          ensureBundleRuntimeClassSet,
          debug,
          getResolvedConfig,
          markCssAssetProcessed,
          getSourceCandidates,
          waitForSourceCandidateSyncs,
          rememberMainCssSource,
          getRememberedMainCssSources,
          getRememberedMainCssSignature,
          setRememberedMainCssSignature,
          recordGeneratorCandidates,
        }),
      },
      outputOptions(options) {
        const plugins = options.plugins
        return {
          ...options,
          plugins: Array.isArray(plugins)
            ? [...plugins, cssFinalizerOutputPlugin]
            : [cssFinalizerOutputPlugin],
        }
      },
    },
  ]
  if (uniAppXPlugins) {
    plugins.push(...uniAppXPlugins)
  }
  return plugins
}
