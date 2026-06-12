import type { InternalUserDefinedOptions } from '@/types'
import path from 'node:path'
import { postcss } from '@weapp-tailwindcss/postcss'
import { normalizeOutputPathKey } from '../../shared/module-graph'
import { isCSSRequest } from '../utils'

export const SOURCE_STYLE_OUTPUT_EXT_RE = /\.(?:less|sass|scss|styl|stylus|pcss|postcss)$/i
export const CSS_SOURCE_OUTPUT_EXT_RE = /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss)$/i
export const MINI_PROGRAM_STYLE_OUTPUT_EXT_RE = /\.(?:wx|ac|jx|tt|q|ty)ss$/i

const SOURCE_STYLE_NON_CSS_SYNTAX_RE = /(?:^|\n)\s*(?:\/\/|\$[\w-]+\s*:|@(?:use|forward|mixin|include|function)\b)/

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

export function resolveViteCssOutputFile(
  file: string,
  opts: InternalUserDefinedOptions,
  isWebGeneratorTarget: boolean,
  preserveCssExtension = false,
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
  return file.replace(SOURCE_STYLE_OUTPUT_EXT_RE, '.wxss')
}

export function resolveViteCssPipelineOutputFile(
  file: string,
  _opts: Pick<InternalUserDefinedOptions, 'cssMatcher'>,
  rootDir: string,
  isWebGeneratorTarget = false,
  preserveCssExtension = false,
) {
  const normalizedFile = resolveReplayCssOutputFile(rootDir, file)
  if (
    isWebGeneratorTarget
    || preserveCssExtension
    || MINI_PROGRAM_STYLE_OUTPUT_EXT_RE.test(normalizedFile)
    || !CSS_SOURCE_OUTPUT_EXT_RE.test(normalizedFile)
    || !isCSSRequest(normalizedFile)
  ) {
    return normalizedFile
  }
  return normalizedFile.replace(CSS_SOURCE_OUTPUT_EXT_RE, '.wxss')
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

export function isAppOriginCssFile(file: string) {
  return path.basename(stripStyleFileExtension(file)) === 'app-origin'
}

export function isMainAppCssFile(file: string) {
  return path.basename(stripStyleFileExtension(file)) === 'app'
}

export function isMainStyleEntryCssFile(file: string) {
  const basename = path.basename(stripStyleFileExtension(file))
  return basename === 'app' || basename === 'main'
}

export function isTailwindEntryCssFile(file: string) {
  return path.basename(stripStyleFileExtension(file)) === 'tailwind'
}
