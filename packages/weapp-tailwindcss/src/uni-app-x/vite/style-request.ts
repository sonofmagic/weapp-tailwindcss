import path from 'node:path'
import { normalizeTailwindcssV4InfinityCalcCss } from '@weapp-tailwindcss/postcss'
import { isSourcePreprocessorRequest } from '@/bundlers/shared/style-requests'
import { cleanUrl } from '@/bundlers/vite/utils'

const UVUE_NVUE_RE = /\.(?:uvue|nvue)$/
const CSS_MODULE_EXPORT_RE = /^\s*export\s+default\s+(?:\{|\w|\[\])/
const RELATIVE_REFERENCE_RE = /@reference\s+(["'])(\.\.?[\\/][^"']+)\1\s*;?/g
const WINDOWS_ABSOLUTE_PATH_RE = /^[a-z]:[\\/]/i

export function isPreprocessorRequest(id: string, lang?: string): boolean {
  return isSourcePreprocessorRequest(id, lang)
}

export function resolveUniAppXCssTarget(id: string) {
  return UVUE_NVUE_RE.test(cleanUrl(id)) ? 'uvue' : undefined
}

export function isCssModuleExport(code: string) {
  return CSS_MODULE_EXPORT_RE.test(code)
}

export function normalizeRelativeTailwindReferences(code: string, id: string) {
  if (!code.includes('@reference')) {
    return code
  }
  const sourceFile = cleanUrl(id)
  const pathApi = WINDOWS_ABSOLUTE_PATH_RE.test(sourceFile) ? path.win32 : path
  const sourceDir = pathApi.dirname(sourceFile)
  return code.replace(RELATIVE_REFERENCE_RE, (_full, quote: string, request: string) => {
    const resolved = pathApi.resolve(sourceDir, request).replace(/\\/g, '/')
    return `@reference ${quote}${resolved}${quote};`
  })
}

interface ResolvePreprocessorTransformOptions {
  isIosPlatform: boolean
  isNativeAppStyleTarget: boolean
}

export function resolvePreprocessorTransform(
  code: string,
  id: string,
  lang: string | undefined,
  options: ResolvePreprocessorTransformOptions,
) {
  if (!isPreprocessorRequest(id, lang)) {
    return
  }
  if (options.isIosPlatform) {
    const normalizedCode = normalizeTailwindcssV4InfinityCalcCss(code)
    return {
      result: normalizedCode === code ? undefined : { code: normalizedCode, map: null },
    }
  }
  if (!options.isNativeAppStyleTarget) {
    return { result: undefined }
  }
}
