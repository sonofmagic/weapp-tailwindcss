import type { OutputAsset, OutputBundle } from 'rollup'
import type { InternalUserDefinedOptions } from '@/types'
import {
  containsCssAfterMinify,
  filterExistingCssRules,
  mergeCoveredCssRuleDeclarations,
  mergeMiniProgramPreflightRuleDeclarations,
  mergeMiniProgramThemeScopeRuleDeclarations,
  postcss,
} from '@weapp-tailwindcss/postcss'
import path from 'pathe'
import { parseBundlerGeneratedCssMarkerBlocks, stripBundlerGeneratedCssMarkers } from '../shared/generated-css-marker'
import { parseImportRequest, removeTailwindSourceDirectives } from '../shared/generator-css/directives'
import { isPureLocalCssImportWrapper } from '../shared/generator-css/local-imports'
import { extractMarkedUserLayerComponentsCss, mergeMarkedUserLayerComponentsCss } from '../shared/generator-css/user-layer-order'
import { normalizeOutputPathKey } from '../shared/module-graph'
import { isSubpackageOutputFile } from './generate-bundle/subpackages'

interface CssAssetMarkerMatcher {
  (asset: OutputAsset, file?: string): boolean
}

interface CssAssetProcessedMarker {
  (asset: OutputAsset, file?: string): void
}

interface CssAssetResultRecordOptions {
  injectIntoMain?: boolean | undefined
  outputFile?: string | undefined
}

interface CssAssetResultRecorder {
  (file: string, css: string, options?: CssAssetResultRecordOptions): void
}

interface CssAssetResultsGetter {
  (): Iterable<[string, string | { css: string, injectIntoMain?: boolean | undefined, outputFile?: string | undefined }]>
}

interface CollectViteProcessedCssAssetOptions {
  opts?: InternalUserDefinedOptions | undefined
  isViteProcessedCssAsset?: CssAssetMarkerMatcher | undefined
  markCssAssetProcessed?: CssAssetProcessedMarker | undefined
  recordCssAssetResult?: CssAssetResultRecorder | undefined
  recordViteProcessedCssAssetResult?: CssAssetResultRecorder | undefined
  resolveViteProcessedCssOutputFile?: ((file: string) => string | undefined) | undefined
  subpackageRoots?: Set<string> | undefined
  debug?: ((format: string, ...args: unknown[]) => void) | undefined
}

interface InjectViteProcessedCssAssetOptions {
  opts: InternalUserDefinedOptions
  getViteProcessedCssAssetResults?: CssAssetResultsGetter | undefined
  markCssAssetProcessed?: CssAssetProcessedMarker | undefined
  recordCssAssetResult?: CssAssetResultRecorder | undefined
  shouldRemoveInjectedSourceAsset?: ((file: string, record: { file: string, css: string, injectIntoMain?: boolean | undefined, outputFile?: string | undefined }) => boolean) | undefined
  debug?: ((format: string, ...args: unknown[]) => void) | undefined
  onUpdate?: ((file: string, original: string, generated: string) => void) | undefined
}

const CSS_OUTPUT_FILE_RE = /\.(?:css|wxss|acss|ttss|qss|jxss|tyss)(?:$|[?#])/i

function isCssOutputFile(file: string) {
  return CSS_OUTPUT_FILE_RE.test(file)
}

function getAssetFile(bundleFile: string, asset: OutputAsset) {
  return asset.fileName || bundleFile
}

function readAssetSource(asset: OutputAsset) {
  return typeof asset.source === 'string'
    ? asset.source
    : asset.source.toString()
}

function clearAssetSource(asset: OutputAsset) {
  asset.source = ''
}

function appendCss(baseCss: string, css: string) {
  if (baseCss.length === 0) {
    return css
  }
  if (css.length === 0) {
    return baseCss
  }
  return `${baseCss}\n${css}`
}

function removeTailwindSourceMediaWrappers(css: string) {
  if (!css.includes('@media source(')) {
    return css
  }
  try {
    const root = postcss.parse(css)
    let changed = false
    root.walkAtRules('media', (atRule) => {
      if (!atRule.params.startsWith('source(')) {
        return
      }
      if (atRule.nodes && atRule.nodes.length > 0) {
        atRule.replaceWith(...atRule.nodes)
      }
      else {
        atRule.remove()
      }
      changed = true
    })
    root.walkAtRules((atRule) => {
      if (atRule.nodes && atRule.nodes.length === 0) {
        atRule.remove()
        changed = true
      }
    })
    return changed ? root.toString() : css
  }
  catch {
    return css
      .replace(/@media\s+source\([^)]*\)\s*\{\s*\/\*!\s*weapp-tailwindcss generator-placeholder\s*\*\/?\s*\}/gi, '')
      .replace(/@media\s+source\([^)]*\)\s*\{\s*\}/gi, '')
  }
}

function removeTailwindEntryDirectivesFromCss(css: string) {
  return removeTailwindSourceDirectives(removeTailwindSourceMediaWrappers(css))
}

function stripStyleExtension(file: string) {
  return file.replace(/[?#].*$/, '').replace(/\.(?:css|wxss|acss|ttss|qss|jxss|tyss|scss|sass|less|styl|stylus|pcss|postcss)$/i, '')
}

function isStyleImportRequest(request: string | undefined) {
  return typeof request === 'string'
    && request.length > 0
    && !/^(?:https?:)?\/\//i.test(request)
    && /\.(?:css|wxss|acss|ttss|qss|jxss|tyss)(?:$|[?#])/i.test(request)
}

function resolveImportedStyleFile(targetFile: string, request: string | undefined) {
  if (!isStyleImportRequest(request)) {
    return
  }
  const cleanRequest = request!.replace(/[?#].*$/, '')
  if (cleanRequest.startsWith('/')) {
    return normalizeOutputPathKey(cleanRequest.slice(1))
  }
  const targetDir = path.posix.dirname(normalizeOutputPathKey(targetFile))
  return normalizeOutputPathKey(path.posix.join(targetDir === '.' ? '' : targetDir, cleanRequest))
}

function collectImportedStyleFiles(css: string, targetFile: string) {
  const imports = new Set<string>()
  try {
    const root = postcss.parse(css)
    root.walkAtRules('import', (atRule) => {
      const importedFile = resolveImportedStyleFile(targetFile, parseImportRequest(atRule.params))
      if (importedFile) {
        imports.add(importedFile)
      }
    })
  }
  catch {
  }
  return imports
}

function normalizeMarkerOutputFile(
  markerFile: string,
  resolveViteProcessedCssOutputFile: ((file: string) => string | undefined) | undefined,
) {
  return resolveViteProcessedCssOutputFile?.(markerFile) ?? markerFile
}

function isMatchingGeneratedCssMarkerFile(
  targetFile: string,
  markerFile: string | undefined,
  resolveViteProcessedCssOutputFile: ((file: string) => string | undefined) | undefined,
) {
  if (!markerFile) {
    return false
  }
  const targetKey = normalizeOutputPathKey(stripStyleExtension(targetFile))
  const markerKey = normalizeOutputPathKey(stripStyleExtension(normalizeMarkerOutputFile(
    markerFile,
    resolveViteProcessedCssOutputFile,
  )))
  return targetKey === markerKey
}

function resolveViteProcessedCssAssetSource(
  file: string,
  rawSource: string,
  resolveViteProcessedCssOutputFile: ((file: string) => string | undefined) | undefined,
) {
  const blocks = parseBundlerGeneratedCssMarkerBlocks(rawSource)
    .filter(block => block.bundler === 'vite')
  if (blocks.length <= 1) {
    return stripBundlerGeneratedCssMarkers(rawSource)
  }
  const matchedCss = blocks
    .filter(block => isMatchingGeneratedCssMarkerFile(file, block.file, resolveViteProcessedCssOutputFile))
    .map(block => block.css)
  return matchedCss.length > 0
    ? matchedCss.join('\n')
    : stripBundlerGeneratedCssMarkers(rawSource)
}

function collectMatchingGeneratedCssMarkerFiles(
  file: string,
  rawSource: string,
  resolveViteProcessedCssOutputFile: ((file: string) => string | undefined) | undefined,
) {
  return parseBundlerGeneratedCssMarkerBlocks(rawSource)
    .filter(block => block.bundler === 'vite')
    .filter(block => isMatchingGeneratedCssMarkerFile(file, block.file, resolveViteProcessedCssOutputFile))
    .map(block => block.file)
    .filter((markerFile): markerFile is string => typeof markerFile === 'string' && markerFile.length > 0)
}

function collectRootStyleBundleCssSources(bundle: OutputBundle, excludedFile: string) {
  const sources: string[] = []
  const excludedFileKey = normalizeOutputPathKey(excludedFile)
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = normalizeOutputPathKey(getAssetFile(bundleFile, output))
    if (file === excludedFileKey || !isRootStyleOutputFile(file)) {
      continue
    }
    const source = stripBundlerGeneratedCssMarkers(readAssetSource(output)).trim()
    if (source.length > 0) {
      sources.push(source)
    }
  }
  return sources
}

function collectSingleViteGeneratedCssMarkerFile(rawSource: string) {
  const blocks = parseBundlerGeneratedCssMarkerBlocks(rawSource)
    .filter(block => block.bundler === 'vite')
  if (blocks.length !== 1) {
    return undefined
  }
  const file = blocks[0]?.file
  return typeof file === 'string' && file.length > 0 ? file : undefined
}

function shouldFilterRootGeneratedCssMarkerForScopedAsset(
  targetFile: string,
  markerFile: string,
  resolveViteProcessedCssOutputFile: ((file: string) => string | undefined) | undefined,
) {
  const resolvedTargetFile = normalizeMarkerOutputFile(targetFile, resolveViteProcessedCssOutputFile)
  const resolvedMarkerFile = normalizeMarkerOutputFile(markerFile, resolveViteProcessedCssOutputFile)
  if (
    !isRootStyleOutputFile(resolvedMarkerFile)
    || isRootStyleOutputFile(resolvedTargetFile)
  ) {
    return false
  }
  return !isMatchingGeneratedCssMarkerFile(targetFile, markerFile, resolveViteProcessedCssOutputFile)
}

function removeCssCoveredByRootStyleBundleSources(
  bundle: OutputBundle,
  file: string,
  css: string,
) {
  return removeDanglingCssSourceTraceComments(removeCssCoveredByImportedViteResults(
    css,
    collectRootStyleBundleCssSources(bundle, file),
  ))
}

function removeDanglingCssSourceTraceComments(css: string) {
  if (!css.includes('/* tokens:')) {
    return css
  }
  try {
    const root = postcss.parse(css)
    let changed = false
    root.each((node) => {
      if (node.type !== 'comment' || !node.text.trim().startsWith('tokens:')) {
        return
      }
      const next = node.next()
      if (next?.type === 'rule' || next?.type === 'atrule') {
        return
      }
      node.remove()
      changed = true
    })
    return changed ? root.toString().trim() : css
  }
  catch {
    return css
  }
}

export function removeCssCoveredByRootStyleAssets(
  bundle: OutputBundle,
  options: {
    cssMatcher: (file: string) => boolean
    debug?: ((format: string, ...args: unknown[]) => void) | undefined
    isViteProcessedCssAsset?: CssAssetMarkerMatcher | undefined
    onUpdate?: ((file: string, original: string, generated: string) => void) | undefined
    recordCssAssetResult?: CssAssetResultRecorder | undefined
    subpackageRoots?: Set<string> | undefined
  },
) {
  let updated = 0
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = getAssetFile(bundleFile, output)
    if (
      !options.cssMatcher(file)
      || isRootStyleOutputFile(file)
      || options.isViteProcessedCssAsset?.(output, file) === true
      || (
        options.subpackageRoots != null
        && isSubpackageOutputFile(file, options.subpackageRoots)
      )
    ) {
      continue
    }
    const rawSource = readAssetSource(output)
    const nextCss = removeCssCoveredByRootStyleBundleSources(bundle, file, rawSource)
    if (nextCss === rawSource) {
      continue
    }
    output.source = nextCss
    options.recordCssAssetResult?.(file, nextCss)
    options.onUpdate?.(file, rawSource, nextCss)
    options.debug?.('remove root-covered css rules from scoped asset: %s bytes=%d', file, nextCss.length)
    updated++
  }
  return updated
}

function shouldInjectViteProcessedCssResult(
  opts: InternalUserDefinedOptions,
  targetFile: string,
  sourceFile: string,
  options: {
    injectIntoMain?: boolean | undefined
    outputFile?: string | undefined
  },
) {
  if (options.injectIntoMain === true) {
    return isRootStyleOutputFile(targetFile)
      || (
        typeof options.outputFile === 'string'
        && normalizeOutputPathKey(options.outputFile) === normalizeOutputPathKey(targetFile)
      )
  }
  if (options.injectIntoMain === false) {
    return false
  }
  const targetFileKey = normalizeOutputPathKey(targetFile)
  const sourceFileKey = normalizeOutputPathKey(sourceFile)
  return sourceFileKey !== targetFileKey
    && (
      opts.mainCssChunkMatcher(sourceFile, opts.appType)
      || (
        typeof options.outputFile === 'string'
        && normalizeOutputPathKey(options.outputFile) !== targetFileKey
        && opts.mainCssChunkMatcher(options.outputFile, opts.appType)
      )
    )
}

function isRootStyleOutputFile(file: string) {
  const normalized = normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
  return isCssOutputFile(normalized) && !normalized.includes('/')
}

function isMiniProgramStyleOutputFile(file: string) {
  return /\.(?:wxss|acss|ttss|qss|jxss|tyss)(?:$|[?#])/i.test(file)
}

function shouldPreserveMiniProgramImportShell(opts: InternalUserDefinedOptions, file: string, css: string) {
  return (opts.appType === 'taro' || opts.appType === 'uni-app-vite' || opts.appType === 'uni-app-x')
    && isMiniProgramStyleOutputFile(file)
    && opts.cssMatcher(file)
    && isPureLocalCssImportWrapper(css)
}

function resolvePreservedImportShellInjectionTarget(
  opts: InternalUserDefinedOptions,
  bundle: OutputBundle,
  file: string,
  css: string,
) {
  if (opts.appType !== 'taro') {
    return
  }
  const importedStyleFiles = collectImportedStyleFiles(css, file)
  if (importedStyleFiles.size !== 1) {
    return
  }
  const [importedFile] = importedStyleFiles
  if (!importedFile) {
    return
  }
  if (!isRootStyleOutputFile(importedFile)) {
    return
  }
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const outputFile = getAssetFile(bundleFile, output)
    if (normalizeOutputPathKey(outputFile) === normalizeOutputPathKey(importedFile)) {
      return outputFile
    }
  }
}

function shouldUseCssAssetAsMainInjectionTarget(
  opts: InternalUserDefinedOptions,
  file: string,
  records: Array<{ injectIntoMain?: boolean | undefined, outputFile?: string | undefined }>,
) {
  const fileKey = normalizeOutputPathKey(file)
  if (
    !isRootStyleOutputFile(file)
    && records.some(record =>
      typeof record.outputFile === 'string'
      && normalizeOutputPathKey(record.outputFile) === fileKey,
    )
  ) {
    return false
  }
  if (!isRootStyleOutputFile(file)) {
    return records.some(record =>
      record.injectIntoMain === true
      && typeof record.outputFile === 'string'
      && normalizeOutputPathKey(record.outputFile) === fileKey,
    )
  }
  const explicitTargetMatched = records.some((record) => {
    if (record.injectIntoMain !== true) {
      return false
    }
    return isRootStyleOutputFile(file)
      || (
        typeof record.outputFile === 'string'
        && normalizeOutputPathKey(record.outputFile) === fileKey
      )
  })
  if (explicitTargetMatched) {
    return true
  }
  if (records.some(record => record.injectIntoMain === true)) {
    return false
  }
  if (opts.mainCssChunkMatcher(file, opts.appType)) {
    return true
  }
  return isRootStyleOutputFile(file)
    && records.some(record => record.injectIntoMain === true)
}

function isViteProcessedCssResultImported(record: { file: string, outputFile?: string | undefined }, importedStyleFiles: Set<string>) {
  return importedStyleFiles.has(normalizeOutputPathKey(record.file))
    || (
      typeof record.outputFile === 'string'
      && importedStyleFiles.has(normalizeOutputPathKey(record.outputFile))
    )
}

function isViteProcessedCssResultCoveredByImportedBundleAsset(
  record: { file: string, outputFile?: string | undefined },
  importedStyleFiles: Set<string>,
  assetFiles: Set<string>,
) {
  for (const candidate of [record.file, record.outputFile]) {
    if (typeof candidate !== 'string' || candidate.length === 0) {
      continue
    }
    const candidateKey = normalizeOutputPathKey(candidate)
    if (!importedStyleFiles.has(candidateKey)) {
      continue
    }
    if (assetFiles.has(candidateKey)) {
      return true
    }
  }
  return false
}

function removeCssCoveredByImportedViteResults(
  css: string,
  importedCssSources: string[],
) {
  if (importedCssSources.length === 0) {
    return css
  }
  const importedCss = importedCssSources
    .map(source => stripBundlerGeneratedCssMarkers(source).trim())
    .filter(Boolean)
    .join('\n')
  if (importedCss.length === 0) {
    return css
  }
  return filterExistingCssRules(importedCss, css)
}

function collectImportedBundleCssSources(bundle: OutputBundle, importedStyleFiles: Set<string>) {
  if (importedStyleFiles.size === 0) {
    return []
  }
  const importedFileNames = new Set([...importedStyleFiles].map(file => path.posix.basename(file)))
  const importedSources: string[] = []
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = normalizeOutputPathKey(getAssetFile(bundleFile, output))
    const imported = importedStyleFiles.has(file)
      || (
        !file.includes('/')
        && importedFileNames.has(path.posix.basename(file))
      )
    if (!imported) {
      continue
    }
    importedSources.push(readAssetSource(output))
  }
  return importedSources
}

function collectBundleAssetFiles(bundle: OutputBundle) {
  const files = new Set<string>()
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    files.add(normalizeOutputPathKey(getAssetFile(bundleFile, output)))
  }
  return files
}

export function isCssImportOnlyBundleAsset(
  bundle: OutputBundle,
  file: string,
  css: string,
) {
  const importedStyleFiles = collectImportedStyleFiles(css, file)
  if (importedStyleFiles.size === 0) {
    return false
  }
  let hasNonImportNode = false
  try {
    const root = postcss.parse(css)
    root.each((node) => {
      if (node.type === 'comment') {
        return
      }
      if (node.type !== 'atrule' || node.name !== 'import') {
        hasNonImportNode = true
      }
    })
  }
  catch {
    return false
  }
  if (hasNonImportNode) {
    return false
  }
  return collectImportedBundleCssSources(bundle, importedStyleFiles).length > 0
}

function isCoveredViteGeneratedSourceAsset(
  file: string,
  existingAssetFiles: Set<string>,
  resolveViteProcessedCssOutputFile: ((file: string) => string | undefined) | undefined,
) {
  const resolvedOutputFile = normalizeOutputPathKey(resolveViteProcessedCssOutputFile?.(file) ?? file)
  const fileKey = normalizeOutputPathKey(file)
  return resolvedOutputFile !== fileKey && existingAssetFiles.has(resolvedOutputFile)
}

function isSourceRootPrefixedOutputFile(file: string, outputFile: string) {
  const fileKey = normalizeOutputPathKey(file)
  const outputFileKey = normalizeOutputPathKey(outputFile)
  return fileKey !== outputFileKey && fileKey.endsWith(`/${outputFileKey}`)
}

export function collectViteProcessedCssAssetResults(
  bundle: OutputBundle,
  options: CollectViteProcessedCssAssetOptions,
) {
  let collected = 0
  const existingAssetFiles = collectBundleAssetFiles(bundle)
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = getAssetFile(bundleFile, output)
    if (!isCssOutputFile(file) || !options.isViteProcessedCssAsset?.(output, file)) {
      continue
    }
    const rawSource = readAssetSource(output)
    let nextCss = resolveViteProcessedCssAssetSource(
      file,
      rawSource,
      options.resolveViteProcessedCssOutputFile,
    )
    const singleMarkerFile = collectSingleViteGeneratedCssMarkerFile(rawSource)
    if (
      singleMarkerFile
      && (
        options.subpackageRoots == null
        || !isSubpackageOutputFile(file, options.subpackageRoots)
      )
      && shouldFilterRootGeneratedCssMarkerForScopedAsset(file, singleMarkerFile, options.resolveViteProcessedCssOutputFile)
    ) {
      nextCss = removeCssCoveredByRootStyleBundleSources(bundle, file, nextCss)
    }
    if (nextCss !== rawSource) {
      output.source = nextCss
    }
    options.markCssAssetProcessed?.(output, file)
    options.recordCssAssetResult?.(file, nextCss)
    const resolvedOutputFile = options.resolveViteProcessedCssOutputFile?.(file) ?? file
    const shouldReplayIntoMainCss = options.opts != null
      && (
        (
          isRootStyleOutputFile(file)
          && options.opts.mainCssChunkMatcher(file, options.opts.appType)
        )
        || (
          isSourceRootPrefixedOutputFile(file, resolvedOutputFile)
          && isRootStyleOutputFile(resolvedOutputFile)
          && options.opts.mainCssChunkMatcher(resolvedOutputFile, options.opts.appType)
        )
      )
    options.recordViteProcessedCssAssetResult?.(file, nextCss, {
      injectIntoMain: shouldReplayIntoMainCss || undefined,
      outputFile: resolvedOutputFile,
    })
    if (normalizeOutputPathKey(resolvedOutputFile) !== normalizeOutputPathKey(file)) {
      options.recordViteProcessedCssAssetResult?.(resolvedOutputFile, nextCss, {
        injectIntoMain: shouldReplayIntoMainCss || undefined,
        outputFile: resolvedOutputFile,
      })
    }
    for (const markerFile of collectMatchingGeneratedCssMarkerFiles(
      file,
      rawSource,
      options.resolveViteProcessedCssOutputFile,
    )) {
      if (normalizeOutputPathKey(markerFile) === normalizeOutputPathKey(file)) {
        continue
      }
      options.recordViteProcessedCssAssetResult?.(markerFile, nextCss, {
        injectIntoMain: shouldReplayIntoMainCss || undefined,
        outputFile: resolvedOutputFile,
      })
      if (
        normalizeOutputPathKey(resolvedOutputFile) !== normalizeOutputPathKey(markerFile)
        && normalizeOutputPathKey(resolvedOutputFile) !== normalizeOutputPathKey(file)
      ) {
        options.recordViteProcessedCssAssetResult?.(resolvedOutputFile, nextCss, {
          injectIntoMain: shouldReplayIntoMainCss || undefined,
          outputFile: resolvedOutputFile,
        })
      }
    }
    if (isCoveredViteGeneratedSourceAsset(file, existingAssetFiles, options.resolveViteProcessedCssOutputFile)) {
      delete bundle[bundleFile]
      options.debug?.('skip covered vite-generated source css asset: %s', file)
      collected++
      continue
    }
    options.debug?.('collect vite-processed css asset: %s bytes=%d', file, nextCss.length)
    collected++
  }
  return collected
}

export function injectViteProcessedCssIntoMainCssAssets(
  bundle: OutputBundle,
  options: InjectViteProcessedCssAssetOptions,
) {
  const viteCssResults = [...(options.getViteProcessedCssAssetResults?.() ?? [])]
    .map(([file, record]) => {
      return typeof record === 'string'
        ? { file, css: record, injectIntoMain: undefined }
        : { file, css: record.css, injectIntoMain: record.injectIntoMain, outputFile: record.outputFile }
    })
    .filter(record => record.css.length > 0)
  let injected = 0
  for (const [bundleFile, bundleOutput] of Object.entries(bundle)) {
    let output = bundleOutput
    if (output.type !== 'asset') {
      continue
    }
    let file = getAssetFile(bundleFile, output)
    if (
      !options.opts.cssMatcher(file)
      || !shouldUseCssAssetAsMainInjectionTarget(options.opts, file, viteCssResults)
    ) {
      continue
    }
    let originalSource = readAssetSource(output)
    if (shouldPreserveMiniProgramImportShell(options.opts, file, originalSource)) {
      const importedTargetFile = resolvePreservedImportShellInjectionTarget(options.opts, bundle, file, originalSource)
      if (typeof importedTargetFile === 'string') {
        options.debug?.('preserve mini-program css import shell asset: %s -> %s', file, importedTargetFile)
        const importedOutput = Object.entries(bundle).find(([candidateFile, candidate]) =>
          candidate.type === 'asset'
          && normalizeOutputPathKey(getAssetFile(candidateFile, candidate)) === normalizeOutputPathKey(importedTargetFile),
        )?.[1]
        if (importedOutput?.type === 'asset') {
          output = importedOutput
          file = importedTargetFile
          originalSource = readAssetSource(output)
        }
        else {
          continue
        }
      }
      else {
        options.debug?.('preserve mini-program css import shell asset: %s', file)
        continue
      }
    }
    const fileKey = normalizeOutputPathKey(file)
    const mainFileKey = normalizeOutputPathKey(file)
    let nextCss = removeTailwindEntryDirectivesFromCss(originalSource)
    const importedStyleFiles = collectImportedStyleFiles(nextCss, file)
    const importedBundleCssSources = collectImportedBundleCssSources(bundle, importedStyleFiles)
    nextCss = removeCssCoveredByImportedViteResults(
      nextCss,
      importedBundleCssSources,
    )
    const importedViteCssResults = viteCssResults.filter(record => isViteProcessedCssResultImported(record, importedStyleFiles))
    const bundleAssetFiles = collectBundleAssetFiles(bundle)
    const uncoveredImportedViteCssResults = importedViteCssResults.filter(
      record => !isViteProcessedCssResultCoveredByImportedBundleAsset(record, importedStyleFiles, bundleAssetFiles),
    )
    const importedCssSources = [
      ...importedBundleCssSources,
      ...uncoveredImportedViteCssResults.map(record => record.css),
    ]
    nextCss = removeCssCoveredByImportedViteResults(nextCss, uncoveredImportedViteCssResults.map(record => record.css))
    for (const record of viteCssResults) {
      if (!isRootStyleOutputFile(file)) {
        if (
          typeof record.outputFile !== 'string'
          || normalizeOutputPathKey(record.outputFile) !== fileKey
        ) {
          continue
        }
      }
      if (!shouldInjectViteProcessedCssResult(options.opts, mainFileKey, record.file, record)) {
        continue
      }
      if (isViteProcessedCssResultImported(record, importedStyleFiles)) {
        continue
      }
      let css = stripBundlerGeneratedCssMarkers(record.css).trim()
      css = removeCssCoveredByImportedViteResults(css, importedCssSources).trim()
      if (css.length === 0) {
        continue
      }
      if (containsCssAfterMinify(nextCss, css) || filterExistingCssRules(nextCss, css).length === 0) {
        continue
      }
      const mergedLayerCss = mergeMarkedUserLayerComponentsCss(nextCss, css)
      if (mergedLayerCss.merged) {
        nextCss = mergedLayerCss.css
        css = extractMarkedUserLayerComponentsCss(css).rest.trim()
        if (css.length === 0) {
          continue
        }
      }
      if (containsCssAfterMinify(nextCss, css)) {
        continue
      }
      const mergedPreflightDeclarations = mergeMiniProgramPreflightRuleDeclarations(nextCss, css)
      if (mergedPreflightDeclarations.changed) {
        nextCss = mergedPreflightDeclarations.baseCss
        css = mergedPreflightDeclarations.css.trim()
        if (css.length === 0) {
          continue
        }
      }
      const mergedThemeScopeDeclarations = mergeMiniProgramThemeScopeRuleDeclarations(nextCss, css)
      if (mergedThemeScopeDeclarations.changed) {
        nextCss = mergedThemeScopeDeclarations.baseCss
        css = mergedThemeScopeDeclarations.css.trim()
        if (css.length === 0) {
          continue
        }
      }
      const mergedRuleDeclarations = mergeCoveredCssRuleDeclarations(nextCss, css)
      if (mergedRuleDeclarations.changed) {
        nextCss = mergedRuleDeclarations.baseCss
        css = mergedRuleDeclarations.css.trim()
        if (css.length === 0) {
          continue
        }
      }
      const missingCss = filterExistingCssRules(nextCss, css)
      if (missingCss.length === 0 || containsCssAfterMinify(nextCss, missingCss)) {
        continue
      }
      nextCss = appendCss(nextCss, missingCss)
    }
    if (nextCss === originalSource) {
      continue
    }
    output.source = nextCss
    options.markCssAssetProcessed?.(output, file)
    options.recordCssAssetResult?.(file, nextCss)
    options.onUpdate?.(file, originalSource, nextCss)
    options.debug?.('inject vite-processed css into main css asset: %s bytes=%d', file, nextCss.length)
    for (const record of viteCssResults) {
      if (!options.shouldRemoveInjectedSourceAsset?.(file, record)) {
        continue
      }
      const recordFileKey = normalizeOutputPathKey(record.file)
      for (const [candidateFile, candidateOutput] of Object.entries(bundle)) {
        if (candidateOutput.type !== 'asset') {
          continue
        }
        const candidateKey = normalizeOutputPathKey(getAssetFile(candidateFile, candidateOutput))
        const isRecordFile = candidateKey === recordFileKey
        const candidateSource = readAssetSource(candidateOutput).trim()
        const isProcessedSource = candidateSource === record.css.trim()
          || (candidateSource.length > 0 && containsCssAfterMinify(nextCss, candidateSource))
        if ((!isRecordFile && !isProcessedSource) || candidateKey === normalizeOutputPathKey(file)) {
          continue
        }
        clearAssetSource(candidateOutput)
        options.debug?.('remove injected vite-processed source css asset: %s -> %s', candidateKey, file)
      }
    }
    injected++
  }
  return injected
}
