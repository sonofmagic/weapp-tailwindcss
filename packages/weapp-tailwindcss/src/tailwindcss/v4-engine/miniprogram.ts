import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import { createStyleHandler } from '@weapp-tailwindcss/postcss'
import postcss from 'postcss'

const defaultStyleHandler = createStyleHandler({
  cssRemoveHoverPseudoClass: true,
  isMainChunk: true,
  majorVersion: 4,
})

function removeAtSupports(css: string) {
  const root = postcss.parse(css)
  root.walkAtRules('supports', (atRule) => {
    atRule.remove()
  })
  return root.toString()
}

export async function transformTailwindV4CssToWeapp(
  css: string,
  options?: Partial<IStyleHandlerOptions>,
) {
  const result = await defaultStyleHandler(css, {
    cssRemoveHoverPseudoClass: true,
    isMainChunk: true,
    majorVersion: 4,
    ...options,
  })
  return removeAtSupports(result.css)
}
