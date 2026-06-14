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
import { extractMarkedUserLayerComponentsCss, mergeMarkedUserLayerComponentsCss } from '../shared/generator-css/user-layer-order'
import { normalizeOutputPathKey } from '../shared/module-graph'

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
      opts.mainCssChunk(sourceFile, opts.appType)
      || (
        typeof options.outputFile === 'string'
        && normalizeOutputPathKey(options.outputFile) !== targetFileKey
        && opts.mainCssChunk(options.outputFile, opts.appType)
      )
    )
}

function isRootStyleOutputFile(file: string) {
  const normalized = normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
  return isCssOutputFile(normalized) && !normalized.includes('/')
}

function shouldUseCssAssetAsMainInjectionTarget(
  opts: InternalUserDefinedOptions,
  file: string,
  records: Array<{ injectIntoMain?: boolean | undefined, outputFile?: string | undefined }>,
) {
  const fileKey = normalizeOutputPathKey(file)
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
  if (opts.mainCssChunk(file, opts.appType)) {
    return true
  }
  return isRootStyleOutputFile(file)
    && records.some(record => record.injectIntoMain === true)
}

function isViteProcessedCssResultImported(record: { file: string, outputFile?: string | undefined }, importedStyleFiles: Set<string>) {
  const importedFileNames = new Set([...importedStyleFiles].map(file => path.posix.basename(file)))
  return importedStyleFiles.has(normalizeOutputPathKey(record.file))
    || (
      typeof record.outputFile === 'string'
      && (
        importedStyleFiles.has(normalizeOutputPathKey(record.outputFile))
        || importedFileNames.has(path.posix.basename(normalizeOutputPathKey(record.outputFile)))
      )
    )
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

function isCoveredViteGeneratedSourceAsset(
  file: string,
  existingAssetFiles: Set<string>,
  resolveViteProcessedCssOutputFile: ((file: string) => string | undefined) | undefined,
) {
  const resolvedOutputFile = normalizeOutputPathKey(resolveViteProcessedCssOutputFile?.(file) ?? file)
  const fileKey = normalizeOutputPathKey(file)
  return resolvedOutputFile !== fileKey && existingAssetFiles.has(resolvedOutputFile)
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
    const nextCss = resolveViteProcessedCssAssetSource(
      file,
      rawSource,
      options.resolveViteProcessedCssOutputFile,
    )
    if (nextCss !== rawSource) {
      output.source = nextCss
    }
    options.markCssAssetProcessed?.(output, file)
    options.recordCssAssetResult?.(file, nextCss)
    const resolvedOutputFile = options.resolveViteProcessedCssOutputFile?.(file) ?? file
    const shouldReplayIntoMainCss = options.opts != null
      && (
        options.opts.mainCssChunk(file, options.opts.appType)
        || (
          normalizeOutputPathKey(resolvedOutputFile) !== normalizeOutputPathKey(file)
          && options.opts.mainCssChunk(resolvedOutputFile, options.opts.appType)
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
      clearAssetSource(output)
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
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = getAssetFile(bundleFile, output)
    if (
      !options.opts.cssMatcher(file)
      || !shouldUseCssAssetAsMainInjectionTarget(options.opts, file, viteCssResults)
    ) {
      continue
    }
    const mainFileKey = normalizeOutputPathKey(file)
    const originalSource = readAssetSource(output)
    let nextCss = removeTailwindEntryDirectivesFromCss(originalSource)
    const importedStyleFiles = collectImportedStyleFiles(nextCss, file)
    const importedBundleCssSources = collectImportedBundleCssSources(bundle, importedStyleFiles)
    nextCss = removeCssCoveredByImportedViteResults(
      nextCss,
      importedBundleCssSources,
    )
    const importedViteCssResults = viteCssResults.filter(record => isViteProcessedCssResultImported(record, importedStyleFiles))
    const importedCssSources = [
      ...importedBundleCssSources,
      ...importedViteCssResults.map(record => record.css),
    ]
    nextCss = removeCssCoveredByImportedViteResults(nextCss, importedViteCssResults.map(record => record.css))
    for (const record of viteCssResults) {
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
        const isProcessedSource = readAssetSource(candidateOutput).trim() === record.css.trim()
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
