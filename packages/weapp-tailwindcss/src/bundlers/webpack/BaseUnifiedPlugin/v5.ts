// webpack 5
import type { TailwindV4CssSource } from '@tailwindcss-mangle/engine'
import type { Compiler } from 'webpack'
import type { WebpackCssSourceRegistration } from '../loaders/runtime-registry'
import type { AppType, IBaseWebpackPlugin, InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import path from 'node:path'
import micromatch from 'micromatch'
import { pluginName } from '@/constants'
import { getCompilerContext } from '@/context'
import { createDebug } from '@/debug'
import { normalizeWeappTailwindcssGeneratorOptions } from '@/generator'
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
  const appendOutputIgnoredPath = (watchOptions?: WebpackWatchOptions) => {
    const outputPath = compiler.outputPath || compiler.options?.output?.path
    const outputDir = outputPath ? path.resolve(outputPath) : undefined
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
    const outputDir = outputPath ? path.resolve(outputPath) : undefined
    if (!outputDir) {
      return
    }

    const watchOptions = (compiler.watching as { watchOptions?: WebpackWatchOptions } | undefined)?.watchOptions
    if (watchOptions) {
      appendOutputIgnoredPath(watchOptions)
    }
  }

  compiler.hooks.watchRun?.tap(pluginName, syncOutputIgnoredPath)
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
      twPatcher,
      refreshTailwindcssRuntime,
      refreshTailwindcssPatcher,
    } = this.options
    const initialTailwindRuntime = tailwindRuntime ?? twPatcher
    const refreshTailwindRuntime = refreshTailwindcssRuntime ?? refreshTailwindcssPatcher

    const disabledOptions = resolvePluginDisabledState(disabled)
    const isTailwindcssV4 = (initialTailwindRuntime.majorVersion ?? 0) >= 4
    const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(this.options.generator)
    const shouldRewriteCssImports = isTailwindcssV4 || generatorOptions.target === 'web'
    const isMpxApp = isMpx(this.appType)
    if (shouldRewriteCssImports) {
      setupMpxTailwindcssRedirect(weappTailwindcssPackageDir, isMpxApp)
    }
    if (disabledOptions.plugin) {
      return
    }
    setupWebpackWatchOutputIgnore(compiler)
    const readyPromise = createTailwindRuntimeReadyPromise(initialTailwindRuntime)
    const runtimeState = {
      tailwindRuntime: initialTailwindRuntime,
      twPatcher: initialTailwindRuntime,
      readyPromise,
      refreshTailwindcssRuntime: refreshTailwindRuntime,
      refreshTailwindcssPatcher: refreshTailwindRuntime,
    }

    let runtimeSetPrepared = false
    let runtimeSetSignature: string | undefined
    let runtimeRefreshRequiredForCompilation = false
    let watchRunObserved = false
    const runtimeWatchDependencyFiles = new Set<string>()
    const runtimeWatchDependencyContexts = new Set<string>()
    const webpackProcessedCssSourceFiles = new Set<string>()
    const webpackCssSources = new Map<string, string | undefined>()
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
        (runtimeState.twPatcher.majorVersion ?? 0) < 4
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
    const markWebpackProcessedCssSource = (file: string) => {
      webpackProcessedCssSourceFiles.add(path.resolve(file))
    }
    const registerWebpackCssSourceFile = (source: WebpackCssSourceRegistration) => {
      webpackCssSources.set(path.resolve(source.file), source.css)
    }
    const pruneWebpackCssSources = (activeSourceFiles: ReadonlySet<string>, options: { watchMode?: boolean | undefined } = {}) => {
      const tailwindOptions = resolveTailwindcssOptions(runtimeState.twPatcher.options)
      const isTailwindcssV4 = (runtimeState.twPatcher.majorVersion ?? 0) >= 4
      if (!isTailwindcssV4 && options.watchMode !== true) {
        return
      }
      const configuredSourceFiles = new Set<string>()
      if (isTailwindcssV4) {
        for (const entry of tailwindOptions?.v4?.cssEntries ?? []) {
          configuredSourceFiles.add(path.resolve(entry))
        }
        for (const source of tailwindOptions?.v4?.cssSources ?? []) {
          if (source.file) {
            configuredSourceFiles.add(path.resolve(source.file))
          }
        }
      }
      for (const file of webpackCssSources.keys()) {
        if (!activeSourceFiles.has(file) && !configuredSourceFiles.has(file)) {
          webpackCssSources.delete(file)
        }
      }
    }
    const isWebpackProcessedTailwindEntryAsset = (file: string) => {
      if (
        (runtimeState.twPatcher.majorVersion ?? 0) < 4
        || !this.options.mainCssChunkMatcher(file, this.appType)
        || webpackProcessedCssSourceFiles.size === 0
      ) {
        return false
      }
      const tailwindOptions = resolveTailwindcssOptions(runtimeState.twPatcher.options)
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
      registerWebpackCssSourceFile,
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
      isKnownWebpackProcessedCssAsset(file) {
        return webpackProcessedCssSourceFiles.has(path.resolve(file))
          || isWebpackProcessedTailwindEntryAsset(file)
      },
      isWebpackProcessedCssAsset(file, rawSource) {
        return webpackProcessedCssSourceFiles.has(path.resolve(file))
          || isWebpackProcessedTailwindEntryAsset(file)
          || rawSource.includes('weapp-tailwindcss webpack-generated-css')
      },
      consumeRuntimeRefreshRequirement() {
        runtimeRefreshRequiredForCompilation = false
      },
      isWatchMode: () => watchRunObserved || compiler.options?.watch === true,
      getWatchChangedFiles: collectWatchChangedFiles,
      runtimeClassSetManager: (this.options as any).__internalWebpackRuntimeClassSetManager,
      getWebpackCssSources: () => webpackCssSources,
      pruneWebpackCssSources,
      debug,
    })
  }
}
