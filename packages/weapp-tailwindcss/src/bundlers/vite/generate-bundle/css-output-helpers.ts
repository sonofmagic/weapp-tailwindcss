import type { OutputAsset, OutputChunk } from 'rollup'
import type { UserDefinedOptions } from '@/types'
import { normalizeOutputPathKey } from '@/bundlers/shared/module-graph'
import { canProcessViteSourceStyleAsCss, resolveViteCssOutputFile, resolveViteCssPipelineOutputFileFromSourceFile, SOURCE_STYLE_OUTPUT_EXT_RE } from './css-output'
import { createCssImportShell, createRootMiniProgramOriginStyleOutputFile, isRootMiniProgramStyleOutputFile, shouldKeepRootMiniProgramStyleAsImportShell, shouldMoveRootMiniProgramStyleToImportShellOrigin } from './root-style-output'

export function resolveCssBundleOutputFile(options: {
  bundleFiles: string[]
  defaultStyleOutputExtension: string
  file: string
  isWebGeneratorTarget: boolean
  opts: UserDefinedOptions
  shouldPreserveAppCssExtension: boolean
}) {
  const {
    bundleFiles,
    defaultStyleOutputExtension,
    file,
    isWebGeneratorTarget,
    opts,
    shouldPreserveAppCssExtension,
  } = options
  let outputFile = resolveViteCssOutputFile(file, opts, isWebGeneratorTarget, shouldPreserveAppCssExtension, defaultStyleOutputExtension, bundleFiles)
  if (
    outputFile === file
    && isRootMiniProgramStyleOutputFile(file)
    && shouldMoveRootMiniProgramStyleToImportShellOrigin(opts.appType)
  ) {
    outputFile = createRootMiniProgramOriginStyleOutputFile(file)
  }
  return outputFile
}

export function shouldSkipRawSourceStyleAsset(outputFile: string, file: string, rawSource: string) {
  return outputFile !== file && !canProcessViteSourceStyleAsCss(rawSource, file)
}

export function resolveOutputFileFromMatchedCssSource(options: {
  bundleFiles: string[]
  defaultStyleOutputExtension: string
  isWebGeneratorTarget: boolean
  opts: UserDefinedOptions
  rootDir: string
  shouldPreserveAppCssExtension: boolean
  sourceFile: string | undefined
  sourceRoot?: string | undefined
}) {
  const {
    bundleFiles,
    defaultStyleOutputExtension,
    isWebGeneratorTarget,
    opts,
    rootDir,
    shouldPreserveAppCssExtension,
    sourceFile,
    sourceRoot,
  } = options
  if (!sourceFile) {
    return undefined
  }
  const outputFile = resolveViteCssPipelineOutputFileFromSourceFile(
    sourceFile,
    opts,
    rootDir,
    isWebGeneratorTarget,
    shouldPreserveAppCssExtension,
    sourceRoot,
    defaultStyleOutputExtension,
    bundleFiles,
  )
  return opts.cssMatcher(outputFile)
    ? outputFile
    : undefined
}

export function createMatchedCssSourceOutputResolver(options: {
  assetSourceFile: string
  file: string
  originalFileNames?: string[] | undefined
  resolveOutputFileFromMatchedCssSource: (sourceFile: string | undefined) => string | undefined
}) {
  const {
    assetSourceFile,
    file,
    originalFileNames,
    resolveOutputFileFromMatchedCssSource,
  } = options
  return (sourceFile: string | undefined) => {
    if (!sourceFile) {
      return undefined
    }
    if (
      normalizeOutputPathKey(assetSourceFile.replace(/[?#].*$/, '')) === normalizeOutputPathKey(sourceFile.replace(/[?#].*$/, ''))
      || originalFileNames?.some(originalFile =>
        normalizeOutputPathKey(originalFile.replace(/[?#].*$/, '')) === normalizeOutputPathKey(sourceFile.replace(/[?#].*$/, '')),
      )
    ) {
      return file
    }
    return resolveOutputFileFromMatchedCssSource(sourceFile)
  }
}

export function hasViteProcessedCssResultForSource(
  sourceFile: string,
  getViteProcessedCssAssetResults?: (() => Iterable<[string, unknown]> | undefined) | undefined,
) {
  const sourceKey = normalizeOutputPathKey(sourceFile)
  for (const [file] of getViteProcessedCssAssetResults?.() ?? []) {
    if (normalizeOutputPathKey(file) === sourceKey) {
      return true
    }
  }
  return false
}

export function applyCssResultToBundle(options: {
  assetSourceFile: string
  bundle: Record<string, OutputAsset | OutputChunk>
  emitOrReplayCssAsset: (file: string, source: string) => void
  file: string
  originalSource: OutputAsset
  outputFile: string
  source: string
  viteProcessedCssAsset: boolean
  appType: unknown
}) {
  const {
    appType,
    assetSourceFile,
    bundle,
    emitOrReplayCssAsset,
    file,
    originalSource,
    outputFile,
    source,
    viteProcessedCssAsset,
  } = options
  if (outputFile === file) {
    originalSource.source = source
    return
  }
  const shouldKeepSourceAsImportShell = isRootMiniProgramStyleOutputFile(file)
    && isRootMiniProgramStyleOutputFile(outputFile)
    && shouldKeepRootMiniProgramStyleAsImportShell(appType)
  const importShellSource = shouldKeepSourceAsImportShell
    ? createCssImportShell(file, outputFile)
    : undefined
  if (bundle[file] === originalSource && originalSource.originalFileNames?.includes(assetSourceFile)) {
    const existingOutput = bundle[outputFile]
    if (existingOutput?.type === 'asset') {
      existingOutput.source = source
    }
    else {
      emitOrReplayCssAsset(outputFile, source)
    }
    originalSource.source = importShellSource ?? source
    return
  }
  const existingOutput = bundle[outputFile]
  if (existingOutput?.type === 'asset') {
    existingOutput.source = source
  }
  else {
    emitOrReplayCssAsset(outputFile, source)
  }
  if (!viteProcessedCssAsset && SOURCE_STYLE_OUTPUT_EXT_RE.test(file)) {
    delete bundle[file]
  }
  else {
    originalSource.source = importShellSource ?? ''
  }
}
