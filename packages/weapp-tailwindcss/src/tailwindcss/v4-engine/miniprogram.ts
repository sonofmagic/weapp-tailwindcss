import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindV4GenerateTarget } from './types'
import { createStyleHandler, protectDynamicColorMixAlpha } from '@weapp-tailwindcss/postcss'
import { hasCssMacroStyleOptions } from '@/css-macro/auto'
import { pruneMiniProgramGeneratedCss } from '../miniprogram'

const defaultStyleHandler = createStyleHandler({
  cssChildCombinatorReplaceValue: ['view', 'text'],
  cssRemoveHoverPseudoClass: true,
  isMainChunk: true,
  majorVersion: 4,
})
const CSS_DECLARATION_URL_RE = /(:\s*)url\(([^\n\r"';[\]{}]*[[\]{}][^\n\r;]*)\)(?=\s*;)/g

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
  const compatibleCss = normalizeTailwindV4GeneratedUrlValues(css)
  const customPropertyValues = options && 'customPropertyValues' in options
    ? (options as { customPropertyValues?: ReadonlyMap<string, string> }).customPropertyValues
    : undefined
  const protectedCss = protectDynamicColorMixAlpha(compatibleCss, { customPropertyValues })
  const result = await defaultStyleHandler(protectedCss.css, {
    cssChildCombinatorReplaceValue: ['view', 'text'],
    cssRemoveHoverPseudoClass: true,
    isMainChunk: true,
    majorVersion: 4,
    ...options,
  })
  const pruneOptions = {
    preserveConditionalComments: hasCssMacroStyleOptions(options),
  }
  return pruneMiniProgramGeneratedCss(protectedCss.restore(result.css), pruneOptions)
}

export async function transformTailwindV4CssByTarget(
  css: string,
  target: TailwindV4GenerateTarget,
  options?: Partial<IStyleHandlerOptions>,
) {
  return target === 'weapp'
    ? transformTailwindV4CssToWeapp(css, options)
    : css
}
