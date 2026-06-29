// webpack 5
import type { TailwindV4CssSource } from '@tailwindcss-mangle/engine'
import type { Compiler } from 'webpack'
import type { WebpackCssSourceRegistration, WebpackGeneratedCssRegistration } from '../loaders/runtime-registry'
import type { AppType, IBaseWebpackPlugin, InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import path from 'node:path'
import micromatch from 'micromatch'
import { pluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'
import { isMpx, setupMpxTailwindcssRedirect } from '@/shared/mpx'
import { createBuiltinWebpackStyleInjectorPlugin } from '@/style-injector/internal'
import { createTailwindRuntimeReadyPromise, ensureRuntimeClassSet, refreshTailwindRuntimeState } from '@/tailwindcss/runtime'
import { resolveTailwindcssOptions } from '@/tailwindcss/runtime-options'
import { getRuntimeClassSetSignature } from '@/tailwindcss/runtime/cache'
import { hasConfiguredTailwindV4CssRoots, upsertTailwindV4CssSource } from '@/tailwindcss/v4/css-sources'
import { resolvePluginDisabledState } from '@/utils/disabled'
import { resolvePackageDir } from '@/utils/resolve-package'
import { hasTailwindGeneratedCss, hasTailwindGeneratedCssMarkers } from '../../shared/generator-css'
import { normalizeTailwindConfigDirectives } from '../../shared/generator-css/directives'
import { isWatchFileInRuntimeDependencies } from './shared'
import { setupWebpackV5ProcessAssetsHook } from './v5-assets'
import { setupWebpackV5Loaders } from './v5-loaders'

const debug = createDebug()
export const weappTailwindcssPackageDir = resolvePackageDir('weapp-tailwindcss')

type WebpackWatchOptions = NonNullable<Parameters<Compiler['watch']>[0]>
type WebpackWatchIgnoredItem = string | RegExp | ((file: string) => boolean)
const outputIgnoredPredicatePath = Symbol('weapp-tailwindcss.outputIgnoredPredicatePath')

type OutputIgnoredPredicate = ((file: string) => boolean) & {
  [outputIgnoredPredicatePath]?: string
}

function normalizeIgnoredList(ignored: WebpackWatchOptions['ignored']): WebpackWatchIgnoredItem[] {
  const items: unknown[] = Array.isArray(ignored) ? [...ignored] : [ignored]
  return items.filter((item): item is WebpackWatchIgnoredItem =>
    typeof item === 'string' || item instanceof RegExp || typeof item === 'function',
  )
}

function createOutputIgnoredPredicate(
  ignoredList: WebpackWatchIgnoredItem[],
  ignoredPath: string,
) {
  const predicate: OutputIgnoredPredicate = (file: string) => {
    const resolvedFile = path.resolve(file)
    if (resolvedFile === ignoredPath || resolvedFile.startsWith(`${ignoredPath}${path.sep}`)) {
      return true
    }

    const normalizedFile = file.replace(/\\/g, '/')
    return ignoredList.some((item) => {
      if (typeof item === 'string') {
        const resolvedItem = path.resolve(item)
        if (resolvedFile === resolvedItem || resolvedFile.startsWith(`${resolvedItem}${path.sep}`)) {
          return true
        }
        return micromatch.isMatch(normalizedFile, item)
      }
      if (item instanceof RegExp) {
        return item.test(normalizedFile)
      }
      return item(file)
    })
  }
  predicate[outputIgnoredPredicatePath] = ignoredPath
  return predicate
}

function appendIgnoredPath(ignored: WebpackWatchOptions['ignored'], ignoredPath: string) {
  if (
    typeof ignored === 'function'
    && (ignored as OutputIgnoredPredicate)[outputIgnoredPredicatePath] === ignoredPath
  ) {
    return ignored
  }

  const ignoredList = normalizeIgnoredList(ignored)
  const hasNonStringIgnoredRule = ignoredList.some(item => typeof item !== 'string')
  if (hasNonStringIgnoredRule) {
    return createOutputIgnoredPredicate(ignoredList, ignoredPath)
  }

  if (ignoredList.some(item => typeof item === 'string' && path.resolve(item) === ignoredPath)) {
    return ignored
  }
  return [...ignoredList, ignoredPath]
}

function setupWebpackWatchOutputIgnore(compiler: Compiler) {
  const appendOutputIgnoredPath = (watchOptions?: WebpackWatchOptions, outputPath?: string) => {
    const resolvedOutputPath = outputPath || compiler.outputPath || compiler.options?.output?.path
    const outputDir = resolvedOutputPath ? path.resolve(resolvedOutputPath) : undefined
    if (!outputDir) {
      return watchOptions
    }

    if (watchOptions && typeof watchOptions === 'object') {
      const nextIgnored = appendIgnoredPath(watchOptions.ignored, outputDir)
      if (nextIgnored === undefined) {
        delete watchOptions.ignored
      }
      else {
        watchOptions.ignored = nextIgnored as NonNullable<WebpackWatchOptions['ignored']>
      }
      return watchOptions
    }

    return { ignored: appendIgnoredPath(undefined, outputDir) } as WebpackWatchOptions
  }

  const compilerWatchOptions = appendOutputIgnoredPath(compiler.options.watchOptions)
  if (compilerWatchOptions) {
    compiler.options.watchOptions = compilerWatchOptions
  }

  const syncOutputIgnoredPath = () => {
    const outputPath = compiler.outputPath || compiler.options?.output?.path
    const watchOptions = (compiler.watching as { watchOptions?: WebpackWatchOptions } | undefined)?.watchOptions
    if (watchOptions) {
      appendOutputIgnoredPath(watchOptions, outputPath)
    }
  }

  compiler.hooks.watchRun?.tap(pluginName, syncOutputIgnoredPath)
  compiler.hooks.thisCompilation?.tap(pluginName, (compilation) => {
    const outputPath = compilation.compiler?.outputPath || compilation.outputOptions?.path
    const watchOptions = (compiler.watching as { watchOptions?: WebpackWatchOptions } | undefined)?.watchOptions
    if (watchOptions) {
      appendOutputIgnoredPath(watchOptions, outputPath)
    }
    else {
      const compilerWatchOptions = appendOutputIgnoredPath(compiler.options.watchOptions, outputPath)
      if (compilerWatchOptions) {
        compiler.options.watchOptions = compilerWatchOptions
      }
    }
  })
}

/**
 * @name WeappTailwindcss
 * @description webpack5 核心转义插件
 * @link https://tw.icebreaker.top/docs/intro
 */

export class WeappTailwindcss implements IBaseWebpackPlugin {
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
      tailwindRuntime,
      refreshTailwindcssRuntime,
      styleInjector,
    } = this.options
    const initialTailwindRuntime = tailwindRuntime
    const refreshTailwindRuntime = refreshTailwindcssRuntime

    const disabledOptions = resolvePluginDisabledState(disabled)
    const shouldRewriteCssImports = this.options.rewriteCssImports === true
    const isMpxApp = isMpx(this.appType)
    if (shouldRewriteCssImports) {
      setupMpxTailwindcssRedirect(weappTailwindcssPackageDir, isMpxApp)
    }
    if (disabledOptions.plugin) {
      return
    }
    if (initialTailwindRuntime.majorVersion !== 4) {
      throw new Error('weapp-tailwindcss/webpack 新生成管线仅支持 Tailwind CSS v4，请升级 tailwindcss 或停留在旧版 weapp-tailwindcss。')
    }
    setupWebpackWatchOutputIgnore(compiler)
    const readyPromise = createTailwindRuntimeReadyPromise(initialTailwindRuntime)
    const runtimeState = {
      tailwindRuntime: initialTailwindRuntime,
      readyPromise,
      refreshTailwindcssRuntime: refreshTailwindRuntime,
    }

    let runtimeSetPrepared = false
    let runtimeSetSignature: string | undefined
    let runtimeRefreshRequiredForCompilation = false
    let watchRunObserved = false
    const runtimeWatchDependencyFiles = new Set<string>()
    const runtimeWatchDependencyContexts = new Set<string>()
    const webpackProcessedCssSourceFiles = new Set<string>()
    const webpackCssSources = new Map<string, { css: string | undefined, processed?: boolean | undefined }>()
    const webpackGeneratedCssSources = new Map<string, WebpackGeneratedCssRegistration>()
    const currentWebpackCssSourceFiles = new Set<string>()
    const currentWebpackCssSourceModules = new Set<string>()
    let runtimeMetadataPrepared = false

    const updateRuntimeWatchDependencies = async () => {
      runtimeWatchDependencyFiles.clear()
      runtimeWatchDependencyContexts.clear()

      const tailwindOptions = resolveTailwindcssOptions(runtimeState.tailwindRuntime.options)
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

      if (typeof runtimeState.tailwindRuntime.collectContentTokens !== 'function') {
        return
      }

      try {
        const report = await runtimeState.tailwindRuntime.collectContentTokens()
        for (const entry of report.entries ?? []) {
          const file = typeof entry === 'object' && entry !== null && 'file' in entry
            ? entry.file
            : undefined
          if (typeof file === 'string') {
            runtimeWatchDependencyFiles.add(file)
          }
        }
        for (const source of report.sources ?? []) {
          const base = typeof source === 'object' && source !== null && 'base' in source
            ? source.base
            : undefined
          if (typeof base === 'string') {
            runtimeWatchDependencyContexts.add(base)
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
        !source.file
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
    const markWebpackProcessedCssSource = (file: string) => {
      webpackProcessedCssSourceFiles.add(path.resolve(file))
    }
    const markWebpackCssSourceModule = (file: string) => {
      currentWebpackCssSourceModules.add(path.resolve(file))
    }
    const registerWebpackCssSourceFile = (source: WebpackCssSourceRegistration) => {
      const file = path.resolve(source.file)
      const previous = webpackCssSources.get(file)
      if (source.processed === true && previous?.processed === false) {
        currentWebpackCssSourceFiles.add(file)
        return
      }
      webpackCssSources.set(file, {
        css: typeof source.css === 'string'
          ? normalizeTailwindConfigDirectives(source.css, path.dirname(file))
          : source.css,
        processed: source.processed,
      })
      currentWebpackCssSourceFiles.add(file)
    }
    const registerWebpackGeneratedCss = (source: WebpackGeneratedCssRegistration) => {
      const file = path.resolve(source.file)
      webpackGeneratedCssSources.set(file, {
        ...source,
        file,
      })
      currentWebpackCssSourceFiles.add(file)
    }
    const pruneWebpackCssSources = (activeSourceFiles: ReadonlySet<string>, _options: { watchMode?: boolean | undefined } = {}) => {
      const tailwindOptions = resolveTailwindcssOptions(runtimeState.tailwindRuntime.options)
      const configuredSourceFiles = new Set<string>()
      for (const entry of tailwindOptions?.v4?.cssEntries ?? []) {
        configuredSourceFiles.add(path.resolve(entry))
      }
      for (const source of tailwindOptions?.v4?.cssSources ?? []) {
        if (source.file) {
          configuredSourceFiles.add(path.resolve(source.file))
        }
      }
      for (const file of webpackCssSources.keys()) {
        if (!activeSourceFiles.has(file) && !configuredSourceFiles.has(file)) {
          webpackCssSources.delete(file)
        }
      }
      for (const file of webpackGeneratedCssSources.keys()) {
        if (!activeSourceFiles.has(file) && !configuredSourceFiles.has(file)) {
          webpackGeneratedCssSources.delete(file)
        }
      }
    }
    const prepareWebpackCssSources = (activeAssetResources: ReadonlySet<string> = new Set()) => {
      const tailwindOptions = resolveTailwindcssOptions(runtimeState.tailwindRuntime.options)
      const configuredSourceFiles = new Set<string>()
      for (const entry of tailwindOptions?.v4?.cssEntries ?? []) {
        configuredSourceFiles.add(path.resolve(entry))
      }
      for (const source of tailwindOptions?.v4?.cssSources ?? []) {
        if (source.file) {
          configuredSourceFiles.add(path.resolve(source.file))
        }
      }
      const activeSourceFiles = new Set([
        ...configuredSourceFiles,
        ...currentWebpackCssSourceModules,
        ...activeAssetResources,
        ...[...currentWebpackCssSourceFiles].filter(file => currentWebpackCssSourceModules.has(file)),
        ...[...currentWebpackCssSourceFiles].filter(file => activeAssetResources.has(file)),
      ])
      currentWebpackCssSourceFiles.clear()
      currentWebpackCssSourceModules.clear()
      return activeSourceFiles
    }
    const isWebpackProcessedTailwindEntryAsset = (isMainCssChunk?: boolean | undefined) => {
      if (
        isMainCssChunk !== true
        || webpackProcessedCssSourceFiles.size === 0
      ) {
        return false
      }
      const tailwindOptions = resolveTailwindcssOptions(runtimeState.tailwindRuntime.options)
      for (const entry of tailwindOptions?.v4?.cssEntries ?? []) {
        if (webpackProcessedCssSourceFiles.has(path.resolve(entry))) {
          return true
        }
      }
      for (const source of tailwindOptions?.v4?.cssSources ?? []) {
        if (source.file && webpackProcessedCssSourceFiles.has(path.resolve(source.file))) {
          return true
        }
      }
      return false
    }

    compiler.hooks.invalid?.tap?.(pluginName, (fileName: string | null) => {
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
      const signature = getRuntimeClassSetSignature(runtimeState.tailwindRuntime)
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

    async function getRuntimeSetInLoader() {
      await getClassSetInLoader()
      return ensureRuntimeClassSet(runtimeState, {
        allowEmpty: true,
      })
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
      runtimeState,
      getClassSetInLoader,
      getRuntimeSetInLoader,
      markWebpackProcessedCssSource,
      markWebpackCssSourceModule,
      registerWebpackCssSourceFile,
      registerWebpackGeneratedCss,
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
      isKnownWebpackProcessedCssAsset(file, metadata) {
        return webpackProcessedCssSourceFiles.has(path.resolve(file))
          || isWebpackProcessedTailwindEntryAsset(metadata?.isMainCssChunk)
      },
      isWebpackProcessedCssAsset(file, rawSource, metadata) {
        return webpackProcessedCssSourceFiles.has(path.resolve(file))
          || isWebpackProcessedTailwindEntryAsset(metadata?.isMainCssChunk)
          || hasTailwindGeneratedCss(rawSource)
          || hasTailwindGeneratedCssMarkers(rawSource)
          || rawSource.includes('weapp-tailwindcss webpack-generated-css')
      },
      consumeRuntimeRefreshRequirement() {
        runtimeRefreshRequiredForCompilation = false
      },
      isWatchMode: () => watchRunObserved || compiler.options?.watch === true,
      getWatchChangedFiles: collectWatchChangedFiles,
      runtimeClassSetManager: (this.options as any).__internalWebpackRuntimeClassSetManager,
      getWebpackCssSources: () => webpackCssSources,
      getWebpackGeneratedCssSources: () => webpackGeneratedCssSources,
      pruneWebpackCssSources,
      prepareWebpackCssSources,
      debug,
    })
    createBuiltinWebpackStyleInjectorPlugin(styleInjector, this.appType)?.apply(compiler)
  }
}
