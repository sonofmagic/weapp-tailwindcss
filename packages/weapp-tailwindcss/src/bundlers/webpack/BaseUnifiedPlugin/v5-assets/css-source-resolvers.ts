import type { SetupWebpackV5ProcessAssetsHookOptions } from './helpers'
import type { WebpackCssHandlerOptions } from './pipeline-helpers'
import path from 'node:path'
import { resolveTailwindcssOptions } from '@/tailwindcss/runtime-options'
import { hasTailwindGeneratedCss, hasTailwindGeneratedCssMarkers, hasTailwindSourceDirectives } from '../../../shared/generator-css'
import { hasTailwindApplyDirective, hasTailwindRootDirectives } from '../../../shared/generator-css/directives'
import { scoreTailwindV4CssSourceFileMatch } from '../../../shared/generator-css/source-resolver/matching'
import { inferWebpackMainCssFiles, resolveSingleActiveWebpackCssResource } from '../shared'
import { createWebpackGeneratorCssSource, isSameWebpackCssSourceScope, isWebpackCssSourceRepresentedInAsset, removeWebpackGeneratorNonTailwindImports } from './pipeline-helpers'

export function createWebpackCssSourceResolvers(options: {
  activeWebpackAssetResourceFiles: ReadonlySet<string>
  appType: SetupWebpackV5ProcessAssetsHookOptions['appType']
  compilerOptions: SetupWebpackV5ProcessAssetsHookOptions['options']
  compilation: { chunks: Iterable<{ files?: Iterable<string> | string[] | undefined, hasRuntime?: () => boolean, name?: string | undefined }> }
  cssAssetResources: ReadonlyMap<string, ReadonlySet<string>>
  cssHandlerOptionsCache: Map<string, WebpackCssHandlerOptions>
  cssSources: Map<string, { css: string | undefined, processed?: boolean | undefined }>
  cssUserHandlerOptionsCache: Map<string, WebpackCssHandlerOptions>
  groupedCssEntriesLength: number
  singleCssAssetFile?: string | undefined
  isWebGeneratorTarget: boolean
  outputDir: string
  runtimeState: SetupWebpackV5ProcessAssetsHookOptions['runtimeState']
}) {
  const {
    activeWebpackAssetResourceFiles,
    appType,
    compilerOptions,
    compilation,
    cssAssetResources,
    cssHandlerOptionsCache,
    cssSources,
    cssUserHandlerOptionsCache,
    groupedCssEntriesLength,
    singleCssAssetFile,
    isWebGeneratorTarget,
    outputDir,
    runtimeState,
  } = options
  const hasConfiguredTailwindV4SourceRoots = () => {
    const tailwindOptions = resolveTailwindcssOptions(runtimeState.tailwindRuntime.options)
    return (tailwindOptions?.v4?.cssEntries?.length ?? 0) > 0
      || (tailwindOptions?.v4?.cssSources?.length ?? 0) > 0
  }
  const configuredMainCssEntryFiles = (() => {
    const tailwindOptions = resolveTailwindcssOptions(runtimeState.tailwindRuntime.options)
    return [
      ...(tailwindOptions?.v4?.cssEntries ?? []),
    ]
      .filter((file): file is string => typeof file === 'string' && file.length > 0)
      .map(file => path.resolve(file))
  })()
  const inferredMainCssFiles = inferWebpackMainCssFiles(
    compilation.chunks as Iterable<{ files?: Iterable<string> | string[] | undefined, hasRuntime?: () => boolean, name?: string | undefined }>,
    compilerOptions.cssMatcher,
    {
      mainSourceFiles: new Set(configuredMainCssEntryFiles),
      resourcesByAsset: cssAssetResources,
    },
  )
  const singleConfiguredCssAsset = isWebGeneratorTarget
    && configuredMainCssEntryFiles.length > 0
    && groupedCssEntriesLength === 1
    ? singleCssAssetFile
    : undefined
  const isMainCssChunk = (file: string) =>
    compilerOptions.mainCssChunkMatcher(file, appType)
    || inferredMainCssFiles.has(file)
    || file === singleConfiguredCssAsset
  const activeWebpackCssSourceFiles = new Set<string>()
  const resolveConfiguredMainCssSourceFile = (file: string) => {
    if (!isMainCssChunk(file)) {
      return undefined
    }
    for (const sourceFile of configuredMainCssEntryFiles) {
      if (cssSources.has(sourceFile)) {
        activeWebpackCssSourceFiles.add(sourceFile)
        return sourceFile
      }
    }
    return undefined
  }
  const resolveWebpackCssSourceFile = (file: string, rawSource?: string | undefined) => {
    const assetResources = cssAssetResources.get(file)
    const activeAssetResource = resolveSingleActiveWebpackCssResource(assetResources, activeWebpackAssetResourceFiles)
    if (cssSources.size === 0) {
      if (activeAssetResource) {
        activeWebpackCssSourceFiles.add(activeAssetResource)
        return activeAssetResource
      }
      if (assetResources && assetResources.size > 0) {
        return undefined
      }
      return resolveConfiguredMainCssSourceFile(file)
    }
    const resourceMatches = [...(assetResources ?? [])]
      .filter(sourceFile => cssSources.has(sourceFile))
      .sort()
    if (resourceMatches.length === 1) {
      const sourceFile = resourceMatches[0]
      activeWebpackCssSourceFiles.add(sourceFile!)
      return sourceFile
    }
    const tailwindSourceMatches = resourceMatches.filter((sourceFile) => {
      const sourceCss = cssSources.get(sourceFile)?.css
      return sourceCss
        && (
          hasTailwindRootDirectives(sourceCss, { importFallback: true })
          || hasTailwindSourceDirectives(sourceCss, { importFallback: true })
          || hasTailwindApplyDirective(sourceCss)
          || hasTailwindGeneratedCss(sourceCss)
          || hasTailwindGeneratedCssMarkers(sourceCss)
        )
    })
    if (tailwindSourceMatches.length === 1) {
      const sourceFile = tailwindSourceMatches[0]
      activeWebpackCssSourceFiles.add(sourceFile!)
      return sourceFile
    }
    if (activeAssetResource) {
      activeWebpackCssSourceFiles.add(activeAssetResource)
      return activeAssetResource
    }
    if (rawSource) {
      const representedTailwindSourceMatches = [...cssSources.entries()]
        .filter(([, source]) => isWebpackCssSourceRepresentedInAsset(rawSource, source.css))
        .map(([sourceFile]) => ({
          sourceFile,
          score: scoreTailwindV4CssSourceFileMatch(file, sourceFile, {
            outputRoot: outputDir,
            projectRoot: compilerOptions.tailwindcssBasedir,
            cwd: compilerOptions.tailwindcssBasedir,
          }),
        }))
        .filter(match => match.score > 0)
        .sort((a, b) => b.score - a.score || a.sourceFile.localeCompare(b.sourceFile))
      const bestScore = representedTailwindSourceMatches[0]?.score ?? 0
      const bestMatches = representedTailwindSourceMatches.filter(match => match.score === bestScore)
      if (bestMatches.length === 1) {
        const sourceFile = bestMatches[0]!.sourceFile
        activeWebpackCssSourceFiles.add(sourceFile)
        return sourceFile
      }
    }
    const pathMatches = [...cssSources.keys()]
      .map(sourceFile => ({
        sourceFile,
        score: scoreTailwindV4CssSourceFileMatch(file, sourceFile, {
          outputRoot: outputDir,
          projectRoot: compilerOptions.tailwindcssBasedir,
          cwd: compilerOptions.tailwindcssBasedir,
        }),
      }))
      .filter(match => match.score >= 1000)
      .sort((a, b) => b.score - a.score || a.sourceFile.localeCompare(b.sourceFile))
    const bestPathScore = pathMatches[0]?.score ?? 0
    const bestPathMatches = pathMatches.filter(match => match.score === bestPathScore)
    if (bestPathMatches.length === 1) {
      const sourceFile = bestPathMatches[0]!.sourceFile
      activeWebpackCssSourceFiles.add(sourceFile)
      return sourceFile
    }
    if (assetResources && assetResources.size > 0) {
      return undefined
    }
    return resolveConfiguredMainCssSourceFile(file)
  }
  const isSameWebpackSourceScope = (outputFile: string, candidateSourceFile: string, currentSourceFile?: string | undefined) =>
    isSameWebpackCssSourceScope({
      candidateSourceFile,
      currentSourceFile,
      outputFile,
      resourcesByAsset: cssAssetResources,
    })
  const getCssHandlerOptions = (file: string, rawSource?: string | undefined) => {
    const majorVersion = runtimeState.tailwindRuntime.majorVersion
    const isMainChunk = isMainCssChunk(file)
    const sourceFile = resolveWebpackCssSourceFile(file, rawSource)
    const sourceCss = sourceFile ? cssSources.get(sourceFile)?.css : undefined
    const generatorSourceCss = removeWebpackGeneratorNonTailwindImports(sourceCss)
    const generatorCssSource = createWebpackGeneratorCssSource(sourceFile, generatorSourceCss)
    const cacheKey = [
      majorVersion ?? 'unknown',
      isMainChunk ? '1' : '0',
      sourceFile ?? 'asset',
      sourceCss === undefined ? 'source:0' : compilerOptions.cache.computeHash(sourceCss),
      generatorSourceCss === sourceCss || generatorSourceCss === undefined ? 'generator-source:0' : compilerOptions.cache.computeHash(generatorSourceCss),
      file,
    ].join(':')
    const cached = cssHandlerOptionsCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const created = {
      isMainChunk,
      postcssOptions: {
        options: {
          from: sourceFile ?? file,
        },
      },
      sourceOptions: {
        outputRoot: outputDir,
        ...(generatorCssSource === undefined ? {} : { cssSources: [generatorCssSource] }),
        ...(generatorSourceCss === undefined ? {} : { sourceCss: generatorSourceCss }),
        ...(sourceFile === undefined ? {} : { sourceFile }),
      },
      ...(majorVersion === undefined ? {} : { majorVersion }),
    }
    cssHandlerOptionsCache.set(cacheKey, created)
    return created
  }
  const getCssUserHandlerOptions = (file: string) => {
    const majorVersion = runtimeState.tailwindRuntime.majorVersion
    const sourceFile = resolveWebpackCssSourceFile(file)
    const sourceCss = sourceFile ? cssSources.get(sourceFile)?.css : undefined
    const generatorSourceCss = removeWebpackGeneratorNonTailwindImports(sourceCss)
    const cacheKey = [
      majorVersion ?? 'unknown',
      sourceFile ?? 'asset',
      sourceCss === undefined ? 'source:0' : compilerOptions.cache.computeHash(sourceCss),
      generatorSourceCss === sourceCss || generatorSourceCss === undefined ? 'generator-source:0' : compilerOptions.cache.computeHash(generatorSourceCss),
      file,
    ].join(':')
    const cached = cssUserHandlerOptionsCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const created = {
      ...getCssHandlerOptions(file),
      isMainChunk: false,
    }
    cssUserHandlerOptionsCache.set(cacheKey, created)
    return created
  }

  return {
    activeWebpackCssSourceFiles,
    configuredMainCssEntryFiles,
    getCssHandlerOptions,
    getCssUserHandlerOptions,
    hasConfiguredTailwindV4SourceRoots,
    isSameWebpackSourceScope,
    resolveWebpackCssSourceFile,
  }
}
