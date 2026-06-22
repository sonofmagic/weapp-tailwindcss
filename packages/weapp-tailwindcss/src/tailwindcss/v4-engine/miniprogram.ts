import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindV4GenerateTarget } from './types'
import type { AppType } from '@/types'
import { createStyleHandler, postcss, protectDynamicColorMixAlpha } from '@weapp-tailwindcss/postcss'
import { hasCssMacroStyleOptions, transformCssMacroCss } from '@/css-macro/auto'
import { shouldUseWebGeneratorTargetFromEnv } from '@/runtime-branch/generator-target-env'
import { pruneMiniProgramGeneratedCss } from '../miniprogram'
import { collectRpxTextSelectorValues } from './generator/rpx-candidates'

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
    preservePreflight: true,
    preserveConditionalComments: hasCssMacroStyleOptions(options),
  }
  return pruneMiniProgramGeneratedCss(protectedCss.restore(result.css), pruneOptions)
}

export function transformTailwindV4WebRpxTextCss(css: string) {
  if (!css.includes('text-\\[') || !css.includes('rpx') || !css.includes('color')) {
    return css
  }

  try {
    const root = postcss.parse(css)
    let changed = false
    root.walkRules((rule) => {
      const values = collectRpxTextSelectorValues(rule.selector)
      if (values.size === 0) {
        return
      }
      rule.walkDecls('color', (decl) => {
        if (values.has(decl.value.trim())) {
          decl.prop = 'font-size'
          changed = true
        }
      })
    })
    return changed ? root.toString() : css
  }
  catch {
    return css
  }
}

function shouldTransformWebRpxTextCss(options: TailwindV4TargetStyleOptions | undefined) {
  return options?.appType === 'uni-app-vite' || shouldUseWebGeneratorTargetFromEnv()
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
  return shouldTransformWebRpxTextCss(options)
    ? transformTailwindV4WebRpxTextCss(resolvedWebCss)
    : resolvedWebCss
}
