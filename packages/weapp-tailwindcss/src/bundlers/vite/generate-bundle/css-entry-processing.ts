import { scheduleViteCssTransform } from './transform-scheduling'

export async function processViteCssBundleEntry(options: any) {
  const {
    activeViteCssCacheFiles,
    addWatchFile,
    annotateCssSourceTrace,
    applyCssResultToBundle,
    applyViteCssCacheResult,
    applyViteCssTransformTaskResult,
    bundle,
    bundleFiles,
    cache,
    collectedBundlerGeneratedCssFiles,
    configuredTailwindV4CssSourceFileKeysForScope,
    configuredTailwindV4ExplicitCssEntryFileKeysForScope,
    context,
    createCandidateSignature,
    createCssSourceTraceCacheSignature,
    createCssTokenSourceMap,
    createCssTransformShareScopeKey,
    createInitialCssPipelineContext,
    createRuntimeAffectingSourceSignature,
    createScopedGeneratorCandidateSignature,
    createScopedGeneratorRuntime,
    createScopedGeneratorSourceTraceMap,
    createScopedSourceCandidateGetter,
    createScopedSourceCandidateSourceGetter,
    cssTaskFactories,
    currentSubpackageRoots,
    debug,
    defaultStyleOutputExtension,
    emitOrReplayCssAsset,
    envFlags,
    executeViteCssTransformTask,
    file,
    frameworkRootImportShellTargetByFile,
    generatorCandidatesChanged,
    generatorPlatform,
    generatorRuntime,
    getConfiguredTailwindV4CssSourceEntries,
    getCssHandlerOptions,
    getCssSource,
    getCssUserHandlerOptions,
    getLastCssResult,
    getOriginalCssLayerSource,
    getRememberedCssSources,
    getSfcSource,
    getSourceCandidateSources,
    getViteProcessedCssAssetResult,
    getViteProcessedCssAssetResults,
    hasExplicitConfiguredRootCssEntryForOutput,
    hasRuntimeAffectingChanges,
    hasViteProcessedCssResultForSource,
    isCssAssetProcessed,
    isCssImportOnlyBundleAsset,
    isMiniProgramStyleOutputFile,
    isRootMiniProgramStyleOutputFile,
    isSubpackageOutputFile,
    isTemporaryCssAssetFile,
    isViteProcessedCssAsset,
    isWebGeneratorTarget,
    lastCssResultByFile,
    lastCssSourceHashByFile,
    markCssAssetProcessed,
    measureElapsed,
    metrics,
    normalizeConfiguredTailwindV4CssEntryFileKey,
    normalizeGeneratorUserRawSource,
    normalizeMiniProgramGeneratorRawSource,
    normalizeOutputPathKey,
    normalizeRelativeCssConfigDirectives,
    normalizeViteCssCacheKey,
    onUpdate,
    opts,
    originalEntrySource,
    originalSource,
    outDir,
    processFiles,
    processViteCssCacheTask,
    recordCssAssetResult,
    recordViteProcessedCssAssetResult,
    rememberCssSource,
    rememberProcessCacheKey,
    removeCssCoveredByRootStyleBundleSources,
    resolveAssetSourceFile,
    resolveConfiguredCssEntryRootInjectionTarget,
    resolveConfiguredRootCssSourceStyle,
    resolveCssAssetIdentity,
    resolveCssAssetOutputPlan,
    resolveFrameworkRootImportShellPlan,
    resolveMatchedCssSourceOutputFile,
    resolveReplayCssOutputFile,
    resolveViteCssCompositionPlan,
    resolveViteCssLinkedImpactSignature,
    resolveViteCssPipelineOutputFile,
    resolveViteCssSourcePlan,
    resolveViteCssTransformCachePlan,
    resolveViteCssTransformDecisionPlan,
    rootDir,
    runtimeLinkedCssFiles,
    runtimeSignature,
    runtimeState,
    selectConfiguredRootCssSourceEntry,
    sharedCssResultCache,
    shouldExcludeSubpackageSourceCandidates,
    shouldGenerateWebCssByGenerator,
    shouldInjectCssIntoMainFromOutput,
    shouldKeepCurrentRootCssOutputForConfiguredSource,
    shouldKeepCurrentRootMiniProgramStyleOutputAsImportShell,
    shouldKeepRootMiniProgramStyleAsImportShell,
    shouldMoveRootMiniProgramStyleToImportShellOrigin,
    shouldPreserveAppCssExtension,
    shouldProcessTailwindGeneration,
    shouldSkipRawRememberedCssSource,
    shouldSkipRawSourceStyleAsset,
    shouldSkipViteAssetTransform,
    snapshot,
    sourceRoot,
    state,
    styleHandler,
    temporaryCssAssetSourceResolver,
    timeTask,
    transformFilter,
    transformRuntime,
    transformWebTargetCss,
    useIncrementalMode,
    usedConfiguredTailwindV4CssSourceFiles,
  } = options
  metrics.css.total++
  const assetSourceFile = resolveAssetSourceFile(originalSource, file)
  const rawSource = normalizeRelativeCssConfigDirectives(originalEntrySource, assetSourceFile, outDir, opts)
  const currentRawSourceHasExplicitScanContext = rawSource.includes('@source') || rawSource.includes('@config')
  const cssPipelineContext2 = { ...createInitialCssPipelineContext(file), bundle }
  const rootImportShellOutputFile = resolveReplayCssOutputFile(outDir, originalSource.fileName || file)
  const rootImportShellPlan = resolveFrameworkRootImportShellPlan({
    assetSourceFile,
    configuredTargetFiles: getConfiguredTailwindV4CssSourceEntries().map(entry => resolveMatchedCssSourceOutputFile(entry.file)),
    file,
    isMainChunk: opts.mainCssChunkMatcher(rootImportShellOutputFile, opts.appType),
    isWebGeneratorTarget,
    matchesCss: opts.cssMatcher(rootImportShellOutputFile) || opts.cssMatcher(file),
    processedTargetFiles: [...getViteProcessedCssAssetResults?.() ?? []].flatMap(([, record]) => {
      if (typeof record === 'string' || record.injectIntoMain !== true || !record.outputFile) {
        return []
      }
      return [resolveViteCssPipelineOutputFile(record.outputFile, opts, rootDir, isWebGeneratorTarget, shouldPreserveAppCssExtension, sourceRoot, defaultStyleOutputExtension, bundleFiles)]
    }),
    rawSource,
    rememberedTarget: frameworkRootImportShellTargetByFile.get(rootImportShellOutputFile),
    rootImportShellOutputFile,
    shouldKeep: () => context.cssPipelineStrategy?.shouldKeepRootMiniProgramStyleAsImportShell?.({ ...cssPipelineContext2, css: rawSource, file: rootImportShellOutputFile }),
    shouldMoveToOrigin: () => context.cssPipelineStrategy?.shouldMoveRootMiniProgramStyleToImportShellOrigin?.({ ...cssPipelineContext2, file: rootImportShellOutputFile }),
  })
  const rememberedFrameworkRootImportTarget = rootImportShellPlan.reusableTarget
  if (rootImportShellPlan.targetToRemember) {
    frameworkRootImportShellTargetByFile.set(rootImportShellOutputFile, rootImportShellPlan.targetToRemember)
    if (!rootImportShellPlan.isCurrentImportShell) {
      debug('css remember framework root generated target: %s -> %s', rootImportShellOutputFile, rootImportShellPlan.targetToRemember)
    }
  }
  const cssAssetOutputPlan = resolveCssAssetOutputPlan({
    assetSourceFile,
    bundleFiles,
    configuredEntries: getConfiguredTailwindV4CssSourceEntries(),
    cssPipelineStrategy: context.cssPipelineStrategy,
    defaultStyleOutputExtension,
    file,
    isWebGeneratorTarget,
    normalizeConfiguredSourceFile: normalizeConfiguredTailwindV4CssEntryFileKey,
    opts,
    originalFileNames: originalSource.originalFileNames,
    pipelineContext: cssPipelineContext2,
    resolveOutputFileFromMatchedCssSource: resolveMatchedCssSourceOutputFile,
    rootImportShellOutputFile,
    rootImportShellTarget: rememberedFrameworkRootImportTarget,
    shouldPreserveAppCssExtension,
    shouldReuseRootImportShell: () => shouldKeepRootMiniProgramStyleAsImportShell(context.cssPipelineStrategy?.shouldKeepRootMiniProgramStyleAsImportShell?.({
      ...cssPipelineContext2,
      css: rawSource,
      file: rootImportShellOutputFile,
    })),
  })
  let outputFile = cssAssetOutputPlan.outputFile
  const resolveMatchedOutputFileForCurrentAsset = cssAssetOutputPlan.resolveMatchedOutputFile
  const resolvedFromConfiguredOriginalCssEntry = cssAssetOutputPlan.resolvedFromConfiguredOriginalCssEntry
  if (cssAssetOutputPlan.reusedRootImportShellTarget) {
    debug('css reuse framework root import shell target: %s -> %s', rootImportShellOutputFile, outputFile)
  }
  activeViteCssCacheFiles.add(normalizeViteCssCacheKey(outputFile))
  if (shouldSkipRawSourceStyleAsset(outputFile, file, rawSource, assetSourceFile, opts.cssMatcher)) {
    delete bundle[file]
    debug('css skip raw source style asset: %s -> %s', file, outputFile)
    return
  }
  const hasViteProcessedCssRecord = getViteProcessedCssAssetResult?.(file) != null
  const viteProcessedCssAsset = isViteProcessedCssAsset?.(originalSource, file) === true || hasViteProcessedCssRecord
  const cssAssetIdentity = resolveCssAssetIdentity?.(originalSource, file) ?? {
    kind: viteProcessedCssAsset ? 'bundler-generated' : 'user',
  }
  let resolvedFromTemporaryCssAsset = false
  const applyCssResult = (source) => {
    applyCssResultToBundle({
      assetSourceFile,
      bundle,
      cssPipelineStrategy: context.cssPipelineStrategy,
      emitOrReplayCssAsset,
      file,
      originalSource,
      outputFile,
      pipelineContext: cssPipelineContext2,
      source,
      viteProcessedCssAsset,
    })
  }
  if (shouldSkipViteAssetTransform(originalSource, file, rootDir, transformFilter)) {
    applyCssResult(rawSource)
    markCssAssetProcessed?.(originalSource, outputFile)
    onUpdate(outputFile, rawSource, rawSource)
    metrics.css.transformed++
    debug('css skip transform (filtered): %s', outputFile)
    return
  }
  if (isWebGeneratorTarget && !shouldGenerateWebCssByGenerator) {
    applyCssResult(rawSource)
    markCssAssetProcessed?.(originalSource, outputFile)
    onUpdate(outputFile, rawSource, rawSource)
    debug('css skip web target: %s', outputFile)
    return
  }
  const cssAssetProcessed = isCssAssetProcessed?.(originalSource, file) === true
  const alreadyProcessedCssAsset = viteProcessedCssAsset || cssAssetProcessed
  const configuredTailwindV4CssSourceEntries = getConfiguredTailwindV4CssSourceEntries()
  const normalizedOutputFile = normalizeOutputPathKey(outputFile.replace(/[?#].*$/, ''))
  const isCurrentRootMiniProgramStyleOutput = opts.cssMatcher(outputFile)
    && isMiniProgramStyleOutputFile(outputFile)
    && !normalizedOutputFile.includes('/')
  const cssSourcePlan = await resolveViteCssSourcePlan({
    configuredEntries: configuredTailwindV4CssSourceEntries,
    configuredSourceFileKeys: configuredTailwindV4CssSourceFileKeysForScope,
    cssMatcher: opts.cssMatcher,
    currentRawSourceHasExplicitScanContext,
    cwd: opts.tailwindcssBasedir,
    debug,
    explicitConfiguredSourceFileKeys: configuredTailwindV4ExplicitCssEntryFileKeysForScope,
    file,
    getRememberedCssSources,
    getSfcSource,
    getSourceStyleSource: getCssSource,
    getSourceStyleSources: getSourceCandidateSources,
    hasExplicitConfiguredRootSource: hasExplicitConfiguredRootCssEntryForOutput(outputFile),
    inferenceSourceRoot: sourceRoot,
    isConfiguredSourceProcessed: sourceFile => hasViteProcessedCssResultForSource(sourceFile, getViteProcessedCssAssetResults),
    isConfiguredSourceUsed: sourceFile => usedConfiguredTailwindV4CssSourceFiles.has(normalizeOutputPathKey(sourceFile)),
    isCurrentRootMiniProgramStyleOutput,
    normalizeConfiguredSourceFile: normalizeConfiguredTailwindV4CssEntryFileKey,
    originalSource,
    outputFile,
    outputRoot: outDir,
    projectRoot: sourceRoot ?? rootDir,
    rawSource,
    resolveConfiguredRootSource: () => resolveConfiguredRootCssSourceStyle(outputFile, configuredTailwindV4CssSourceEntries, originalSource.originalFileNames),
    resolveMatchedOutputFile: resolveMatchedOutputFileForCurrentAsset,
    resolveTemporarySource: (temporaryOutputFile, temporaryRawSource) => temporaryCssAssetSourceResolver.resolve(temporaryOutputFile, temporaryRawSource),
    selectConfiguredRootSource: () => selectConfiguredRootCssSourceEntry(outputFile, configuredTailwindV4CssSourceEntries, originalSource.originalFileNames),
    shouldKeepCurrentRootOutput: shouldKeepCurrentRootCssOutputForConfiguredSource,
    shouldKeepRootImportShell: shouldKeepCurrentRootMiniProgramStyleOutputAsImportShell,
    snapshot,
    sourceRoot: opts.tailwindcssBasedir,
    temporaryOutput: isTemporaryCssAssetFile(outputFile),
  })
  outputFile = cssSourcePlan.outputFile
  activeViteCssCacheFiles.add(normalizeViteCssCacheKey(outputFile))
  let outputCssHandlerOptions = getCssHandlerOptions(outputFile)
  if (cssSourcePlan.forceNonMainChunk) {
    outputCssHandlerOptions = {
      ...outputCssHandlerOptions,
      isMainChunk: false,
    }
  }
  let rememberedCssSources = cssSourcePlan.sources
  resolvedFromTemporaryCssAsset = cssSourcePlan.resolvedFromTemporarySource
  for (const sourceFile of cssSourcePlan.usedConfiguredSourceFiles) {
    usedConfiguredTailwindV4CssSourceFiles.add(sourceFile)
  }
  const cssCompositionPlan = resolveViteCssCompositionPlan({
    assetSourceFile,
    configuredSourceFileKeys: configuredTailwindV4CssSourceFileKeysForScope,
    cssEntries: opts.cssEntries,
    cssMatcher: opts.cssMatcher,
    explicitSourceFileKeys: configuredTailwindV4ExplicitCssEntryFileKeysForScope,
    file,
    getCssHandlerOptions,
    getOriginalCssLayerSource,
    isRootStyleOutputFile: isRootMiniProgramStyleOutputFile,
    isWebGeneratorTarget,
    normalizeConfiguredSourceFile: normalizeConfiguredTailwindV4CssEntryFileKey,
    normalizeGeneratorSource: normalizeMiniProgramGeneratorRawSource,
    normalizeGeneratorUserSource: normalizeGeneratorUserRawSource,
    outputCssHandlerOptions,
    outputFile,
    rawSource,
    rememberedSources: rememberedCssSources,
    resolveConfiguredRootInjectionTarget: resolveConfiguredCssEntryRootInjectionTarget,
    resolveMatchedOutputFile: resolveMatchedOutputFileForCurrentAsset,
    resolvedFromTemporarySource: resolvedFromTemporaryCssAsset,
    rootImportShellOutputFile,
    shouldKeepImportedCssShell: isCssImportOnlyBundleAsset(bundle, file, rawSource),
    shouldKeepRootImportShell: shouldKeepRootMiniProgramStyleAsImportShell(context.cssPipelineStrategy?.shouldKeepRootMiniProgramStyleAsImportShell?.({
      ...cssPipelineContext2,
      css: rawSource,
      file: rootImportShellOutputFile,
    })),
    shouldMoveRootImportShellToOrigin: shouldMoveRootMiniProgramStyleToImportShellOrigin(context.cssPipelineStrategy?.shouldMoveRootMiniProgramStyleToImportShellOrigin?.({
      ...cssPipelineContext2,
      file: rootImportShellOutputFile,
    })),
    shouldSkipRememberedSource: (remembered) => {
      const shouldSkip = shouldSkipRawRememberedCssSource(remembered.rawSource, remembered.sourceFile)
      if (shouldSkip) {
        debug('css skip raw remembered source style: %s -> %s', remembered.sourceFile, outputFile)
      }
      return shouldSkip
    },
    viteProcessedCssAsset,
  })
  outputFile = cssCompositionPlan.outputFile
  outputCssHandlerOptions = cssCompositionPlan.outputCssHandlerOptions
  rememberedCssSources = cssCompositionPlan.rememberedSources
  const rememberedCssSource = cssCompositionPlan.rememberedSource
  activeViteCssCacheFiles.add(normalizeViteCssCacheKey(outputFile))
  if (cssCompositionPlan.rootImportShellTarget) {
    frameworkRootImportShellTargetByFile.set(rootImportShellOutputFile, cssCompositionPlan.rootImportShellTarget)
    debug('css remember framework root import shell target: %s -> %s', rootImportShellOutputFile, cssCompositionPlan.rootImportShellTarget)
  }
  if (cssCompositionPlan.preserveImportedCssShell) {
    applyCssResult(rawSource)
    markCssAssetProcessed?.(originalSource, outputFile)
    recordCssAssetResult?.(outputFile, rawSource)
    onUpdate(outputFile, rawSource, rawSource)
    debug('css preserve imported shell asset: %s', outputFile)
    return
  }
  if (cssCompositionPlan.usedConfiguredSourceFile) {
    usedConfiguredTailwindV4CssSourceFiles.add(normalizeOutputPathKey(cssCompositionPlan.usedConfiguredSourceFile))
    temporaryCssAssetSourceResolver.markUsed(cssCompositionPlan.usedConfiguredSourceFile)
  }
  const { cssHandlerOptions: cssHandlerOptions2, generatorCssHandlerOptions, generatorRawSource, generatorSourceFile, generatorUserLayerRawSource, hasCurrentTailwindGenerationDirective, hasRememberedApplySource, hasSameOutputRememberedTailwindGenerationSource, hasStaleViteProcessedCssSource, usesConfiguredTailwindV4FallbackSource, vitePipelineCssAsset, webviewRootCssInjectionTarget } = cssCompositionPlan
  const scopedSourceCandidateGetter = createScopedSourceCandidateGetter(outputFile, generatorCssHandlerOptions)
  const scopedSourceCandidateSourceGetter = createScopedSourceCandidateSourceGetter(outputFile, generatorCssHandlerOptions)
  const sourceTraceSources = scopedSourceCandidateSourceGetter ? await createScopedGeneratorSourceTraceMap(generatorRawSource, generatorSourceFile, scopedSourceCandidateSourceGetter) : void 0
  const sourceTraceTokenSources = sourceTraceSources ? createCssTokenSourceMap(sourceTraceSources, opts) : void 0
  const sourceTraceSignature = createCssSourceTraceCacheSignature(sourceTraceTokenSources, opts)
  const scopedGeneratorRuntime = await createScopedGeneratorRuntime(outputFile, generatorCssHandlerOptions, generatorRuntime, generatorRawSource, generatorSourceFile)
  const annotateCss = css => annotateCssSourceTrace(css, { opts, tokenSources: sourceTraceTokenSources })
  const removeRootCoveredCssFromScopedAsset = (css) => {
    const normalizedOutputFile = normalizeOutputPathKey(outputFile.replace(/[?#].*$/, ''))
    const isRootOrSubpackageCss = !normalizedOutputFile.includes('/')
      || (
        currentSubpackageRoots != null
        && isSubpackageOutputFile(normalizedOutputFile, currentSubpackageRoots)
      )
    return isRootOrSubpackageCss
      ? css
      : removeCssCoveredByRootStyleBundleSources(bundle, outputFile, css)
  }
  const shouldRegenerateMainPackageCssWithScopedCandidates = vitePipelineCssAsset && shouldExcludeSubpackageSourceCandidates(outputFile, generatorCssHandlerOptions)
  const generatorCssUserHandlerOptions = getCssUserHandlerOptions(generatorSourceFile)
  const cssRuntimeAffectingSignature = vitePipelineCssAsset ? createRuntimeAffectingSourceSignature(generatorRawSource, 'css') : snapshot.runtimeAffectingSignatureByFile.get(file) ?? createRuntimeAffectingSourceSignature(generatorRawSource, 'css')
  const cssRuntimeAffectingHash = vitePipelineCssAsset ? cache.computeHash(cssRuntimeAffectingSignature) : snapshot.runtimeAffectingHashByFile.get(file) ?? cache.computeHash(cssRuntimeAffectingSignature)
  const cssShareScope = createCssTransformShareScopeKey(opts, outputFile, generatorRawSource)
  const vitePipelineCssInjectionOutputFile = webviewRootCssInjectionTarget ?? outputFile
  const shouldRecordVitePipelineCssByOutput = normalizeOutputPathKey(vitePipelineCssInjectionOutputFile) === normalizeOutputPathKey(outputFile)
  const shouldInjectVitePipelineCssIntoMain = vitePipelineCssAsset && !resolvedFromConfiguredOriginalCssEntry && outputCssHandlerOptions.isMainChunk !== true && (webviewRootCssInjectionTarget != null || shouldInjectCssIntoMainFromOutput(outputFile, generatorSourceFile, outputCssHandlerOptions))
  const isRuntimeLinkedCss = runtimeLinkedCssFiles.has(file) || runtimeLinkedCssFiles.has(outputFile)
  const cssTransformDecisionPlan = resolveViteCssTransformDecisionPlan({ alreadyProcessedCssAsset, cssAssetIdentityKind: cssAssetIdentity.kind, cssIsMainChunk: cssHandlerOptions2.isMainChunk === true, generatorCandidateSignatureInitialized: state.generatorCandidateSignature !== void 0, generatorCandidatesChanged, generatorRawSource, hasCurrentTailwindGenerationDirective, hasRememberedApplySource, hasRuntimeAffectingChanges, hasSameOutputRememberedTailwindGenerationSource, hasStaleViteProcessedCssSource, isCollectedBundlerGeneratedCssFile: collectedBundlerGeneratedCssFiles.has(file), isProcessCssFile: processFiles.css.has(file), isRuntimeLinkedCss, rawSource, rememberedRawSource: rememberedCssSource?.rawSource, shouldProcessTailwindGeneration, shouldRegenerateMainPackageCssWithScopedCandidates, useIncrementalMode, vitePipelineCssAsset, viteProcessedCssAsset })
  const { shouldReplayLastCss, shouldReuseProcessedCss, shouldTrackGeneratorRuntime, strippedViteProcessedCss } = cssTransformDecisionPlan
  if (shouldReuseProcessedCss) {
    const nextCss = removeRootCoveredCssFromScopedAsset(strippedViteProcessedCss)
    applyCssResult(nextCss)
    markCssAssetProcessed?.(originalSource, outputFile)
    recordCssAssetResult?.(outputFile, nextCss)
    if (vitePipelineCssAsset && rememberedCssSource) {
      rememberCssSource?.({ outputFile: vitePipelineCssInjectionOutputFile, rawSource: generatorRawSource, sourceFile: generatorSourceFile })
    }
    if (shouldRecordVitePipelineCssByOutput) {
      recordViteProcessedCssAssetResult?.(vitePipelineCssInjectionOutputFile, nextCss, { injectIntoMain: outputCssHandlerOptions.isMainChunk ? false : shouldInjectVitePipelineCssIntoMain, outputFile: vitePipelineCssInjectionOutputFile })
    }
    if (vitePipelineCssAsset && shouldInjectVitePipelineCssIntoMain) {
      recordViteProcessedCssAssetResult?.(file, nextCss, { injectIntoMain: shouldInjectVitePipelineCssIntoMain, outputFile: vitePipelineCssInjectionOutputFile })
    }
    onUpdate(outputFile, rawSource, nextCss)
    debug('css skip vite-processed asset: %s', outputFile)
    return
  }
  const trackedGeneratorCandidateSignature = shouldTrackGeneratorRuntime ? createCandidateSignature(scopedGeneratorRuntime) : 'generator:stable'
  const scopedGeneratorCandidateSignature = shouldTrackGeneratorRuntime ? await createScopedGeneratorCandidateSignature(generatorRawSource, generatorSourceFile, trackedGeneratorCandidateSignature, scopedSourceCandidateGetter, { includeFallbackSignature: generatorCssHandlerOptions.isMainChunk, majorVersion: runtimeState.tailwindRuntime.majorVersion }) : trackedGeneratorCandidateSignature
  const linkedImpactSignature = isRuntimeLinkedCss ? resolveViteCssLinkedImpactSignature({ changedHtmlFiles: snapshot.runtimeAffectingChangedByType.html, changedJsFiles: snapshot.runtimeAffectingChangedByType.js, runtimeAffectingSignatureByFile: snapshot.runtimeAffectingSignatureByFile }) : ''
  const cssTransformCachePlan = resolveViteCssTransformCachePlan({ cssIsMainChunk: cssHandlerOptions2.isMainChunk === true, cssRuntimeAffectingHash, cssShareScope, linkedImpactSignature, outputFile, runtimeSignature, scopedGeneratorCandidateSignature, sourceTraceSignature, tailwindcssMajorVersion: runtimeState.tailwindRuntime.majorVersion })
  const { cssCacheKey, cssHashKey, cssSharedCacheKey, cssTaskHash, rememberedCssRuntimeSignature } = cssTransformCachePlan
  if (shouldReplayLastCss) {
    const lastCss = getLastCssResult(lastCssResultByFile, outputFile, file)
    if (lastCss != null) {
      applyCssResult(lastCss)
      markCssAssetProcessed?.(originalSource, outputFile)
      metrics.css.cacheHits++
      debug('css replay last result: %s', outputFile)
      return
    }
  }
  rememberProcessCacheKey(cssCacheKey, cssHashKey)
  scheduleViteCssTransform({
    addWatchFile,
    annotateCss,
    applyCssResult,
    applyViteCssCacheResult,
    applyViteCssTransformTaskResult,
    assetSourceFile,
    cache,
    cssCacheKey,
    cssHandlerOptions: cssHandlerOptions2,
    cssHashKey,
    cssRuntimeAffectingHash,
    cssSharedCacheKey,
    cssTaskFactories,
    cssTaskHash,
    debug,
    envFlags,
    executeViteCssTransformTask,
    file,
    generatorCandidatesChanged,
    generatorCssHandlerOptions,
    generatorCssUserHandlerOptions,
    generatorPlatform,
    generatorRawSource,
    generatorSourceFile,
    generatorUserLayerRawSource,
    getLastCssResult,
    hasRuntimeAffectingChanges,
    isWebGeneratorTarget,
    lastCssResultByFile,
    lastCssSourceHashByFile,
    markCssAssetProcessed,
    measureElapsed,
    metrics,
    normalizeGeneratorUserRawSource,
    normalizeMiniProgramGeneratorRawSource,
    onUpdate,
    opts,
    originalSource,
    outputCssHandlerOptions,
    outputFile,
    processViteCssCacheTask,
    rawSource,
    recordCssAssetResult,
    recordViteProcessedCssAssetResult,
    rememberedCssRuntimeSignature,
    rememberedCssSources,
    rememberCssSource,
    removeRootCoveredCssFromScopedAsset,
    runtimeState,
    scopedGeneratorRuntime,
    scopedSourceCandidateGetter,
    sharedCssResultCache,
    shouldInjectVitePipelineCssIntoMain,
    shouldRecordVitePipelineCssByOutput,
    snapshot,
    styleHandler,
    timeTask,
    transformRuntime,
    transformWebTargetCss,
    useIncrementalMode,
    usesConfiguredTailwindV4FallbackSource,
    vitePipelineCssAsset,
    vitePipelineCssInjectionOutputFile,
  })
}
