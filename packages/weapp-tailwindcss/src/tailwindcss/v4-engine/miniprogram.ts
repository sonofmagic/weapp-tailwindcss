import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindV4GenerateTarget } from './types'
import type { AppType } from '@/types'
import { createStyleHandler, normalizeTailwindcssWebRpxDeclarations, postcss, protectDynamicColorMixAlpha } from '@weapp-tailwindcss/postcss'
import { hasCssMacroStyleOptions, transformCssMacroCss } from '@/css-macro/auto'
import { shouldUseUniAppWebRpxCompatibility } from '@/runtime-branch/generator-target-env'
import { pruneMiniProgramGeneratedCss } from '../miniprogram'

const defaultStyleHandler = createStyleHandler({
  cssChildCombinatorReplaceValue: ['view', 'text'],
  cssRemoveHoverPseudoClass: true,
  isMainChunk: true,
  majorVersion: 4,
})
const CSS_DECLARATION_URL_RE = /(:\s*)url\(([^\n\r"';[\]{}]*[[\]{}][^\n\r;]*)\)(?=\s*;)/g

type TailwindV4TargetStyleOptions = Partial<IStyleHandlerOptions> & {
  appType?: AppType | undefined
}

export function normalizeTailwindV4GeneratedUrlValues(css: string) {
  return css.replace(CSS_DECLARATION_URL_RE, (match, prefix: string, urlValue: string) => {
    try {
      return `${prefix}url("${urlValue.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}")`
    }
    catch {
      return match
    }
  })
}

export async function transformTailwindV4CssToWeapp(
  css: string,
  options?: Partial<IStyleHandlerOptions>,
) {
  const macroCss = hasCssMacroStyleOptions(options)
    ? await transformCssMacroCss(css, options)
    : css
  const compatibleCss = normalizeTailwindV4GeneratedUrlValues(macroCss)
  const customPropertyValues = options?.customPropertyValues
  const protectedCss = protectDynamicColorMixAlpha(compatibleCss, { customPropertyValues })
  const result = await defaultStyleHandler(protectedCss.css, {
    cssChildCombinatorReplaceValue: ['view', 'text'],
    cssRemoveHoverPseudoClass: true,
    isMainChunk: true,
    majorVersion: 4,
    ...options,
  })
  const isUniAppXUvueTarget = options?.uniAppX === true
    && options.uniAppXCssTarget === 'uvue'
  const pruneOptions = {
    preserveContentInit: isUniAppXUvueTarget ? false : undefined,
    preservePreflight: true,
    preserveConditionalComments: hasCssMacroStyleOptions(options),
  }
  return pruneMiniProgramGeneratedCss(protectedCss.restore(result.css), pruneOptions)
}

export function transformTailwindV4WebRpxCss(css: string) {
  if (!css.includes('rpx')) {
    return css
  }

  try {
    const root = postcss.parse(css)
    const changed = normalizeTailwindcssWebRpxDeclarations(root, { majorVersion: 4 })
    return changed ? root.toString() : css
  }
  catch {
    return css
  }
}

export async function transformTailwindV4CssByTarget(
  css: string,
  target: TailwindV4GenerateTarget,
  options?: TailwindV4TargetStyleOptions,
) {
  if (target === 'weapp') {
    return transformTailwindV4CssToWeapp(css, options)
  }

  const webCss = hasCssMacroStyleOptions(options)
    ? transformCssMacroCss(css, options)
    : css
  const resolvedWebCss = await webCss
  return shouldUseUniAppWebRpxCompatibility(options?.appType)
    ? transformTailwindV4WebRpxCss(resolvedWebCss)
    : resolvedWebCss
}
