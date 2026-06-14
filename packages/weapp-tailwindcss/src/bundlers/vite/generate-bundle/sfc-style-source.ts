import type { OutputChunk } from 'rollup'
import type { BundleSnapshot } from '../bundle-state'
import type { RememberedCssSource } from './types'
import path from 'node:path'
import { hasTailwindApplyDirective, hasTailwindRootDirectives, hasTailwindSourceDirectives } from '../../shared/generator-css/directives'
import { normalizeOutputPathKey } from '../../shared/module-graph'
import { CSS_SOURCE_OUTPUT_EXT_RE } from './css-output'
import { scoreMatchingStyleFileBase } from './style-matching'

const SFC_STYLE_SOURCE_EXTENSIONS = ['.vue', '.uvue', '.nvue', '.svelte', '.mpx'] as const
const SFC_STYLE_BLOCK_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi

export function extractSfcStyleSources(source: string) {
  const styleSources: string[] = []
  SFC_STYLE_BLOCK_RE.lastIndex = 0
  let match = SFC_STYLE_BLOCK_RE.exec(source)
  while (match !== null) {
    styleSources.push(match[1] ?? '')
    match = SFC_STYLE_BLOCK_RE.exec(source)
  }
  return styleSources
}

export function hasSfcStyleSources(source: string) {
  return extractSfcStyleSources(source).length > 0
}

export function hasTailwindGenerationSource(source: string) {
  return hasTailwindSourceDirectives(source, { importFallback: true })
    || hasTailwindRootDirectives(source, { importFallback: true })
    || hasTailwindApplyDirective(source)
}

export async function resolveSfcStyleSourceFromOutputFile(
  outputFile: string,
  snapshot: BundleSnapshot,
  outputRoot: string,
  sourceRoot: string | undefined,
  cssMatcher: ((file: string) => boolean) | undefined,
  getSfcSource: ((file: string) => string | undefined) | undefined,
  debug: (format: string, ...args: unknown[]) => void,
): Promise<RememberedCssSource | undefined> {
  const sourceFile = resolveSfcStyleFileFromSiblingChunk(outputFile, snapshot, outputRoot, sourceRoot, cssMatcher, debug)
  if (!sourceFile) {
    debug('sfc style source infer skipped: no source file for %s', outputFile)
    return undefined
  }
  const source = getSfcSource?.(sourceFile)
  if (source == null) {
    debug('sfc style source infer skipped: missing known source for %s -> %s', outputFile, sourceFile)
    return undefined
  }
  const rawSource = extractSfcStyleSources(source).join('\n')
  if (!rawSource || !hasTailwindGenerationSource(rawSource)) {
    debug('sfc style source infer skipped: no tailwind generation source for %s -> %s', outputFile, sourceFile)
    return undefined
  }
  debug('sfc style source inferred: %s -> %s', outputFile, sourceFile)
  return {
    outputFile,
    rawSource,
    sourceFile,
  }
}

export function normalizeSfcSourceFileForCompare(file: string) {
  return normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
}

export function collectChunkModuleIds(output: OutputChunk) {
  const moduleIds = Array.isArray(output.moduleIds) ? output.moduleIds : []
  return [
    output.facadeModuleId,
    ...moduleIds,
    ...Object.keys(output.modules ?? {}),
  ].filter((id, index, ids): id is string => typeof id === 'string' && id.length > 0 && ids.indexOf(id) === index)
}

function normalizeSourceStyleModuleId(id: string) {
  const file = id.replace(/[?#].*$/, '')
  if (!CSS_SOURCE_OUTPUT_EXT_RE.test(file)) {
    return undefined
  }
  if (!path.isAbsolute(file)) {
    return undefined
  }
  return path.resolve(file)
}

function resolveSiblingJsChunkFile(outputFile: string, cssMatcher: ((file: string) => boolean) | undefined) {
  const normalizedOutputFile = outputFile.replace(/[?#].*$/, '')
  if (cssMatcher?.(normalizedOutputFile)) {
    const extension = path.extname(normalizedOutputFile)
    return extension ? `${normalizedOutputFile.slice(0, -extension.length)}.js` : undefined
  }
  if (CSS_SOURCE_OUTPUT_EXT_RE.test(normalizedOutputFile)) {
    return normalizedOutputFile.replace(CSS_SOURCE_OUTPUT_EXT_RE, '.js')
  }
  return undefined
}

function normalizeSfcModuleId(id: string) {
  const file = id.replace(/[?#].*$/, '')
  if (!SFC_STYLE_SOURCE_EXTENSIONS.some(extension => file.endsWith(extension))) {
    return undefined
  }
  if (!path.isAbsolute(file)) {
    return undefined
  }
  return path.resolve(file)
}

function resolveSfcStyleFileFromSiblingChunk(
  outputFile: string,
  snapshot: BundleSnapshot,
  outputRoot: string,
  sourceRoot: string | undefined,
  cssMatcher: ((file: string) => boolean) | undefined,
  debug: (format: string, ...args: unknown[]) => void,
) {
  const siblingJsFile = resolveSiblingJsChunkFile(outputFile, cssMatcher)
  if (!siblingJsFile) {
    debug('sfc style sibling chunk skipped: no sibling js for %s', outputFile)
    return undefined
  }
  const normalizedSiblingJsFile = normalizeOutputPathKey(siblingJsFile)
  const siblingChunk = snapshot.entries.find(entry =>
    entry.type === 'js'
    && entry.output.type === 'chunk'
    && normalizeOutputPathKey(entry.file) === normalizedSiblingJsFile,
  )
  if (!siblingChunk || siblingChunk.output.type !== 'chunk') {
    debug('sfc style sibling chunk skipped: missing chunk for %s -> %s', outputFile, siblingJsFile)
    return undefined
  }
  const sourceFiles = collectChunkModuleIds(siblingChunk.output)
    .map(normalizeSfcModuleId)
    .filter((file, index, files): file is string => Boolean(file) && files.indexOf(file) === index)
  if (sourceFiles.length === 0) {
    debug('sfc style sibling chunk skipped: no sfc modules for %s -> %s', outputFile, siblingJsFile)
    return undefined
  }
  const scoredSources = sourceFiles
    .map(sourceFile => ({
      sourceFile,
      score: scoreMatchingStyleFileBase(outputFile, sourceFile, outputRoot, sourceRoot),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
  debug('sfc style sibling chunk candidates: %s -> %s %O', outputFile, siblingJsFile, scoredSources)
  const bestScore = scoredSources[0]?.score
  if (!bestScore) {
    return undefined
  }
  const bestSources = scoredSources.filter(item => item.score === bestScore)
  if (bestSources.length !== 1) {
    debug('sfc style sibling chunk skipped: ambiguous best sources for %s %O', outputFile, bestSources)
    return undefined
  }
  return bestSources[0]?.sourceFile
}

function resolveSourceStyleFileFromSiblingChunk(
  outputFile: string,
  snapshot: BundleSnapshot,
  outputRoot: string,
  sourceRoot: string | undefined,
  debug: (format: string, ...args: unknown[]) => void,
) {
  const siblingJsFile = resolveSiblingJsChunkFile(outputFile)
  if (!siblingJsFile) {
    debug('source style sibling chunk skipped: no sibling js for %s', outputFile)
    return undefined
  }
  const normalizedSiblingJsFile = normalizeOutputPathKey(siblingJsFile)
  const siblingChunk = snapshot.entries.find(entry =>
    entry.type === 'js'
    && entry.output.type === 'chunk'
    && normalizeOutputPathKey(entry.file) === normalizedSiblingJsFile,
  )
  if (!siblingChunk || siblingChunk.output.type !== 'chunk') {
    debug('source style sibling chunk skipped: missing chunk for %s -> %s', outputFile, siblingJsFile)
    return undefined
  }
  const sourceFiles = collectChunkModuleIds(siblingChunk.output)
    .map(normalizeSourceStyleModuleId)
    .filter((file, index, files): file is string => Boolean(file) && files.indexOf(file) === index)
  if (sourceFiles.length === 0) {
    debug('source style sibling chunk skipped: no source style modules for %s -> %s', outputFile, siblingJsFile)
    return undefined
  }
  const scoredSources = sourceFiles
    .map(sourceFile => ({
      sourceFile,
      score: scoreMatchingStyleFileBase(outputFile, sourceFile, outputRoot, sourceRoot),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
  debug('source style sibling chunk candidates: %s -> %s %O', outputFile, siblingJsFile, scoredSources)
  const bestScore = scoredSources[0]?.score
  if (!bestScore) {
    return undefined
  }
  const bestSources = scoredSources.filter(item => item.score === bestScore)
  if (bestSources.length !== 1) {
    debug('source style sibling chunk skipped: ambiguous best sources for %s %O', outputFile, bestSources)
    return undefined
  }
  return bestSources[0]?.sourceFile
}

export function resolveSourceStyleSourceFromOutputFile(
  outputFile: string,
  snapshot: BundleSnapshot,
  outputRoot: string,
  sourceRoot: string | undefined,
  getSourceStyleSource: ((file: string) => string | undefined) | undefined,
  getSourceStyleSources: (() => Iterable<[string, string]>) | undefined,
  debug: (format: string, ...args: unknown[]) => void,
): RememberedCssSource | undefined {
  let sourceFile = resolveSourceStyleFileFromSiblingChunk(outputFile, snapshot, outputRoot, sourceRoot, debug)
  let rawSource = sourceFile ? getSourceStyleSource?.(sourceFile) : undefined
  if (!rawSource || !hasTailwindGenerationSource(rawSource)) {
    const scoredSources = [...(getSourceStyleSources?.() ?? [])]
      .filter(([file, source]) => CSS_SOURCE_OUTPUT_EXT_RE.test(file) && hasTailwindGenerationSource(source))
      .map(([file, source]) => ({
        file,
        source,
        score: scoreMatchingStyleFileBase(outputFile, file, outputRoot, sourceRoot),
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
    const bestScore = scoredSources[0]?.score
    const bestSources = bestScore ? scoredSources.filter(item => item.score === bestScore) : []
    if (bestSources.length === 1) {
      sourceFile = bestSources[0].file
      rawSource = bestSources[0].source
      debug('source style source inferred from cache: %s -> %s', outputFile, sourceFile)
    }
  }
  if (!sourceFile || !rawSource) {
    return undefined
  }
  if (!hasTailwindGenerationSource(rawSource)) {
    debug('source style source infer skipped: no tailwind generation source for %s -> %s', outputFile, sourceFile)
    return undefined
  }
  return {
    outputFile,
    rawSource,
    sourceFile,
  }
}
