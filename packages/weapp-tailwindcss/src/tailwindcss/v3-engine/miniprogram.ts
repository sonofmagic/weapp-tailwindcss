import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindV3GenerateTarget } from './types'
import { createStyleHandler } from '@weapp-tailwindcss/postcss'
import { pruneMiniProgramGeneratedCss } from '../miniprogram'

const defaultStyleHandler = createStyleHandler({
  cssRemoveHoverPseudoClass: true,
  isMainChunk: true,
  majorVersion: 3,
})

export async function transformTailwindV3CssToWeapp(
  css: string,
  options?: Partial<IStyleHandlerOptions>,
) {
  const result = await defaultStyleHandler(css, {
    cssRemoveHoverPseudoClass: true,
    isMainChunk: true,
    majorVersion: 3,
    ...options,
  })
  return pruneMiniProgramGeneratedCss(result.css)
}

export async function transformTailwindV3CssByTarget(
  css: string,
  target: TailwindV3GenerateTarget,
  options?: Partial<IStyleHandlerOptions>,
) {
  return target === 'weapp'
    ? transformTailwindV3CssToWeapp(css, options)
    : css
}
