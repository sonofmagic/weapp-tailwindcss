import type { Plugin, ResolvedConfig } from 'vite'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import type { UserDefinedOptions } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { logger } from '@weapp-tailwindcss/logger'
import postcssHtmlTransform from '@weapp-tailwindcss/postcss/html-transform'
import { vitePluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { toCustomAttributesEntities } from '@/context/custom-attributes'
import { createDebug } from '@/debug'
import { hasConfiguredTailwindV4CssRoots, upsertTailwindV4CssSource } from '@/tailwindcss/v4/css-sources'
import { createUniAppXPlugins } from '@/uni-app-x'
import { isUniAppXEnabled } from '@/uni-app-x/options'
import { resolveUniUtsPlatform } from '@/utils'
import { resolvePluginDisabledState } from '@/utils/disabled'
import { resolvePackageDir } from '@/utils/resolve-package'
import { normalizeOutputPathKey } from '../shared/module-graph'
import { createViteCssFinalizerOutputPlugin } from './css-finalizer'
import { createGenerateBundleHook } from './generate-bundle'
import { disableAndRemoveTailwindVitePlugins, getPostcssPluginName, removeTailwindPostcssPlugins, removeTailwindVitePlugins } from './official-tailwind-plugins'
import { resolveFilteredPostcssConfig } from './postcss-config'
import { resolveImplicitAppTypeFromViteRoot } from './resolve-app-type'
import { createRewriteCssImportsPlugins } from './rewrite-css-imports'
import { createViteRuntimeClassSet } from './runtime-class-set'
import { createSourceCandidateCollector, isSourceCandidateRequest } from './source-candidates'
import { createViteSourceScanMatcher, resolveViteSourceScanEntries } from './source-scan'
import { resolveImplicitTailwindcssBasedirFromViteRoot } from './tailwind-basedir'
import { cleanUrl, slash } from './utils'

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
  const opts = getCompilerContext({
    ...options,
    __internalDeferMissingCssEntriesWarning: true,
  } as UserDefinedOptions)
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
  const hasInitialTailwindCssRoots = hasConfiguredTailwindV4CssRoots({
    ...options,
    cssEntries: opts.cssEntries ?? options.cssEntries,
  })
  const autoCssSourceContent = new Map<string, string>()
  let refreshRuntimeStateForAutoCssSources: ((force: boolean) => Promise<void>) | undefined
  let autoCssSourcesRefresh: Promise<void> | undefined
  const registerAutoCssSource = async (id: string, css: string) => {
    if (
      tailwindcssMajorVersion < 4
      || !shouldOwnTailwindGeneration
      || hasInitialTailwindCssRoots
    ) {
      return
    }
    const file = cleanUrl(id)
    if (!path.isAbsolute(file)) {
      return
    }
    const sourceFile = path.normalize(file)
    if (autoCssSourceContent.get(sourceFile) === css) {
      return
    }
    autoCssSourceContent.set(sourceFile, css)
    upsertTailwindV4CssSource(opts, {
      file: sourceFile,
      css,
    })
    debug('detected tailwindcss v4 css source from vite css module: %s', sourceFile)
    autoCssSourcesRefresh = (autoCssSourcesRefresh ?? Promise.resolve()).then(async () => {
      await refreshRuntimeStateForAutoCssSources?.(true)
    })
    await autoCssSourcesRefresh
  }
  const rewritePlugins = createRewriteCssImportsPlugins({
    getAppType: () => opts.appType,
    rootImport: shouldOwnTailwindGeneration
      ? `${weappTailwindcssDirPosix}/generator-placeholder.css`
      : undefined,
    onTailwindRootCss: (id, code) => registerAutoCssSource(id, code),
    shouldOwnTailwindGeneration,
    shouldRewrite: shouldRewriteCssImports,
    weappTailwindcssDirPosix,
  })

  if (disabledOptions.plugin) {
    return rewritePlugins.length ? rewritePlugins : undefined
  }

  const customAttributesEntities = toCustomAttributesEntities(customAttributes)
  let resolvedConfig: ResolvedConfig | undefined
  let recordedGeneratorCandidates: Set<string> | undefined
  const sourceCandidateCollector = createSourceCandidateCollector()
  let sourceScanEntries: TailwindSourceEntry[] | undefined
  let sourceScanMatcher: ((file: string) => boolean) | undefined
  const pendingSourceCandidateSyncs = new Set<Promise<void>>()
  const processedCssAssets = new WeakSet<object>()
  const processedCssAssetFiles = new Set<string>()
  const rememberedMainCssSources = new Map<string, string>()
  const rememberedMainCssSignatureByFile = new Map<string, string>()
  const {
    runtimeState,
    refreshRuntimeState,
    ensureRuntimeClassSet,
    ensureBundleRuntimeClassSet,
  } = createViteRuntimeClassSet({
    opts,
    initialTwPatcher,
    refreshTailwindcssPatcher,
    uniAppXEnabled,
    customAttributesEntities,
    disabledDefaultTemplateHandler,
    debug,
  })
  refreshRuntimeStateForAutoCssSources = refreshRuntimeState
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
    const file = cleanUrl(id)
    if (sourceScanMatcher && !sourceScanMatcher(file)) {
      sourceCandidateCollector.remove(file)
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
  const generateBundleHook = createGenerateBundleHook({
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
  })
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
        const file = cleanUrl(id)
        if (sourceScanMatcher && !sourceScanMatcher(file)) {
          sourceCandidateCollector.remove(file)
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
        const sourceScan = await resolveViteSourceScanEntries(opts, runtimeState.twPatcher)
        sourceScanEntries = sourceScan?.entries
        sourceScanMatcher = createViteSourceScanMatcher(sourceScanEntries)
        sourceCandidateCollector.syncInline(sourceScan?.inlineCandidates)
        await sourceCandidateCollector.scanRoot({
          entries: sourceScanEntries,
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
        handler: generateBundleHook,
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
