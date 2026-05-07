import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindV4GenerateTarget } from './types'
import { createStyleHandler } from '@weapp-tailwindcss/postcss'
import { pruneMiniProgramGeneratedCss } from '../miniprogram'
import { lowerModernColorFunctionsForMiniProgram } from './color-compatibility'

const defaultStyleHandler = createStyleHandler({
  cssChildCombinatorReplaceValue: ['view', 'text'],
  cssRemoveHoverPseudoClass: true,
  isMainChunk: true,
  majorVersion: 4,
})

export async function transformTailwindV4CssToWeapp(
  css: string,
  options?: Partial<IStyleHandlerOptions>,
) {
  const compatibleCss = lowerModernColorFunctionsForMiniProgram(css)
  const result = await defaultStyleHandler(compatibleCss, {
    cssChildCombinatorReplaceValue: ['view', 'text'],
    cssRemoveHoverPseudoClass: true,
    isMainChunk: true,
    majorVersion: 4,
    ...options,
  })
  return pruneMiniProgramGeneratedCss(result.css)
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
