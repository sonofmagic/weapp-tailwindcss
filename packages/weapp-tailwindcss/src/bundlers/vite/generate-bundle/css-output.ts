import type { InternalUserDefinedOptions } from '@/types'
import path from 'node:path'
import { postcss } from '@weapp-tailwindcss/postcss'
import { normalizeOutputPathKey } from '../../shared/module-graph'
import { isCSSRequest } from '../utils'

export const SOURCE_STYLE_OUTPUT_EXT_RE = /\.(?:less|sass|scss|styl|stylus|pcss|postcss)$/i
export const CSS_SOURCE_OUTPUT_EXT_RE = /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss)$/i

const SOURCE_STYLE_NON_CSS_SYNTAX_RE = /(?:^|\n)\s*(?:\/\/|\$[\w-]+\s*:|@(?:use|forward|mixin|include|function)\b)/
const FALLBACK_STYLE_OUTPUT_EXTENSION = '.css'

function normalizeStyleOutputExtension(value: string | undefined) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined
  }
  const normalized = value.trim().toLowerCase()
  return normalized.startsWith('.') ? normalized : `.${normalized}`
}

function getMatchedStyleOutputExtension(
  file: string,
  cssMatcher: ((file: string) => boolean) | undefined,
) {
  const cleanFile = file.replace(/[?#].*$/, '')
  if (!cssMatcher?.(cleanFile)) {
    return undefined
  }
  const ext = path.extname(cleanFile)
  if (!ext || ext === '.css') {
    return undefined
  }
  return ext
}

function resolveStyleOutputExtensionFromFiles(
  files: Iterable<string> | undefined,
  cssMatcher: ((file: string) => boolean) | undefined,
  stem?: string | undefined,
) {
  let extension: string | undefined
  for (const file of files ?? []) {
    const cleanFile = file.replace(/[?#].*$/, '')
    const matchedExtension = getMatchedStyleOutputExtension(cleanFile, cssMatcher)
    if (!matchedExtension) {
      continue
    }
    if (stem && cleanFile.slice(0, -matchedExtension.length) !== stem) {
      continue
    }
    if (extension && extension !== matchedExtension) {
      return undefined
    }
    extension = matchedExtension
  }
  return extension
}

export function resolveMiniProgramStyleOutputExtension(options: {
  cssMatcher?: ((file: string) => boolean) | undefined
  fallback?: string | undefined
  files?: Iterable<string> | undefined
  stem?: string | undefined
} = {}) {
  return normalizeStyleOutputExtension(options.fallback)
    ?? resolveStyleOutputExtensionFromFiles(options.files, options.cssMatcher, options.stem)
    ?? resolveStyleOutputExtensionFromFiles(options.files, options.cssMatcher)
    ?? FALLBACK_STYLE_OUTPUT_EXTENSION
}

export function resolveReplayCssOutputFile(rootDir: string, file: string) {
  const nextFile = path.isAbsolute(file) ? path.relative(rootDir, file) : file
  const normalizedFile = normalizeOutputPathKey(nextFile)
  if (
    normalizedFile.length === 0
    || normalizedFile === '.'
    || normalizedFile === '..'
    || normalizedFile.startsWith('../')
  ) {
    return normalizeOutputPathKey(path.basename(file))
  }
  return normalizedFile
}

function normalizeViteSourceRoot(rootDir: string, sourceRoot: string | undefined) {
  if (typeof sourceRoot !== 'string' || sourceRoot.trim().length === 0) {
    return undefined
  }
  return normalizeOutputPathKey(path.isAbsolute(sourceRoot)
    ? path.relative(rootDir, sourceRoot)
    : sourceRoot)
    .replace(/\/+$/, '')
}

export function resolveReplayCssOutputFileFromSourceRoot(rootDir: string, file: string, sourceRoot: string | undefined) {
  const outputFile = resolveReplayCssOutputFile(rootDir, file)
  const normalizedSourceRoot = normalizeViteSourceRoot(rootDir, sourceRoot)
  if (!normalizedSourceRoot) {
    return outputFile
  }
  if (outputFile === normalizedSourceRoot) {
    return path.posix.basename(outputFile)
  }
  if (outputFile.startsWith(`${normalizedSourceRoot}/`)) {
    return outputFile.slice(normalizedSourceRoot.length + 1)
  }
  return outputFile
}

export function resolveViteCssOutputFile(
  file: string,
  opts: InternalUserDefinedOptions,
  isWebGeneratorTarget: boolean,
  preserveCssExtension = false,
  styleOutputExtension?: string | undefined,
  styleOutputFiles?: Iterable<string> | undefined,
) {
  if (
    isWebGeneratorTarget
    || preserveCssExtension
    || opts.cssMatcher(file)
    || !SOURCE_STYLE_OUTPUT_EXT_RE.test(file)
    || !isCSSRequest(file)
  ) {
    return file
  }
  const stem = file.replace(/[?#].*$/, '').replace(SOURCE_STYLE_OUTPUT_EXT_RE, '')
  return file.replace(SOURCE_STYLE_OUTPUT_EXT_RE, resolveMiniProgramStyleOutputExtension({
    cssMatcher: opts.cssMatcher,
    fallback: styleOutputExtension,
    files: styleOutputFiles,
    stem,
  }))
}

export function resolveViteCssPipelineOutputFile(
  file: string,
  opts: Pick<InternalUserDefinedOptions, 'cssMatcher' | 'platform'>,
  rootDir: string,
  isWebGeneratorTarget = false,
  preserveCssExtension = false,
  sourceRoot?: string | undefined,
  styleOutputExtension?: string | undefined,
  styleOutputFiles?: Iterable<string> | undefined,
) {
  const normalizedFile = resolveReplayCssOutputFileFromSourceRoot(rootDir, file, sourceRoot)
  if (
    isWebGeneratorTarget
    || preserveCssExtension
    || opts.cssMatcher(normalizedFile)
    || !CSS_SOURCE_OUTPUT_EXT_RE.test(normalizedFile)
    || !isCSSRequest(normalizedFile)
  ) {
    return normalizedFile
  }
  const stem = normalizedFile.replace(/[?#].*$/, '').replace(CSS_SOURCE_OUTPUT_EXT_RE, '')
  return normalizedFile.replace(CSS_SOURCE_OUTPUT_EXT_RE, resolveMiniProgramStyleOutputExtension({
    cssMatcher: opts.cssMatcher,
    fallback: styleOutputExtension,
    files: styleOutputFiles,
    stem,
  }))
}

export function canProcessViteSourceStyleAsCss(source: string, file: string) {
  if (SOURCE_STYLE_NON_CSS_SYNTAX_RE.test(source)) {
    return false
  }
  try {
    postcss.parse(source, { from: file })
    return true
  }
  catch {
    return false
  }
}

export function normalizeCssSourceForCompare(css: string) {
  return css.trim()
}

export function stripStyleFileExtension(file: string) {
  const normalized = file.replace(/[?#].*$/, '')
  const ext = path.extname(normalized)
  return ext ? normalized.slice(0, -ext.length) : normalized
}
