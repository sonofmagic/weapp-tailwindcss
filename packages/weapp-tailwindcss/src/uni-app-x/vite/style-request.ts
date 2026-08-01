import { normalizeTailwindcssV4InfinityCalcCss } from '@weapp-tailwindcss/postcss'
import { cleanUrl } from '@/bundlers/vite/utils'

const preprocessorLangs = new Set(['scss', 'sass', 'less', 'styl', 'stylus'])
const INLINE_LANG_RE = /lang\.([a-z]+)/i
const PREPROCESSOR_EXT_RE = /\.(?:scss|sass|less|styl|stylus)(?:\?|$)/i
const UVUE_NVUE_RE = /\.(?:uvue|nvue)$/
const CSS_MODULE_EXPORT_RE = /^\s*export\s+default\s+(?:\{|\w|\[\])/

export function isPreprocessorRequest(id: string, lang?: string): boolean {
  const normalizedLang = lang?.toLowerCase()
  if (normalizedLang && preprocessorLangs.has(normalizedLang)) {
    return true
  }
  const inlineLangMatch = id.match(INLINE_LANG_RE)
  const inlineLang = inlineLangMatch?.[1]
  if (inlineLang && preprocessorLangs.has(inlineLang.toLowerCase())) {
    return true
  }
  return PREPROCESSOR_EXT_RE.test(id)
}

export function resolveUniAppXCssTarget(id: string) {
  return UVUE_NVUE_RE.test(cleanUrl(id)) ? 'uvue' : undefined
}

export function isCssModuleExport(code: string) {
  return CSS_MODULE_EXPORT_RE.test(code)
}

interface ResolvePreprocessorTransformOptions {
  isIosPlatform: boolean
  isNativeAppStyleTarget: boolean
  isWebGeneratorTarget: boolean
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
  if (options.isWebGeneratorTarget && !options.isNativeAppStyleTarget) {
    return { result: undefined }
  }
}
