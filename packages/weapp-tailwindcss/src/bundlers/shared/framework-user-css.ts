import type { GenerateCssByGeneratorOptions, GenerateCssByGeneratorResult } from './generator-css'
import type { NormalizedWeappTailwindcssGeneratorOptions } from '@/generator'
import { filterExistingCssRules, postcss } from '@weapp-tailwindcss/postcss'
import { createCssSourceOrderAppend, finalizeMiniProgramGeneratorCss, resolveGeneratorStyleOptions, splitRawSourceByGeneratedCssOrder } from './generator-css/generation-helpers'
import { removeTailwindV4GeneratedUserCssArtifacts, splitUserCssLayerBlocks, stripTailwindSourceMediaFragments, stripUnmatchedTailwindSourceMediaCloseFragments, transformGeneratorUserCss } from './generator-css/user-css'
import { reorderMarkedUserLayerComponentsCss, wrapUserLayerComponentsCss } from './generator-css/user-layer-order'

function normalizeUserSource(source: string) {
  try {
    const root = postcss.parse(source)
    root.walkAtRules('media', (rule) => {
      if (/^source\(/.test(rule.params)) {
        rule.replaceWith(...rule.nodes ?? [])
      }
    })
    return root.toString()
  }
  catch {
    return stripUnmatchedTailwindSourceMediaCloseFragments(stripTailwindSourceMediaFragments(source))
  }
}

export async function restoreFrameworkProcessedUserCss(
  css: string,
  generated: GenerateCssByGeneratorResult,
  source: string,
  options: GenerateCssByGeneratorOptions,
  generatorOptions: NormalizedWeappTailwindcssGeneratorOptions,
) {
  const userCssOptions = {
    generatorTarget: generated.target,
    generatorStyleOptions: resolveGeneratorStyleOptions(options.opts, options.cssHandlerOptions, generatorOptions.styleOptions),
    cssUserHandlerOptions: options.cssUserHandlerOptions,
    styleHandler: options.styleHandler,
    importFallback: generatorOptions.importFallback,
  }
  const transform = async (value: string) => {
    const parts = splitUserCssLayerBlocks(value)
    const layer = await transformGeneratorUserCss(parts.layer, userCssOptions)
    const rest = await transformGeneratorUserCss(parts.rest, userCssOptions)
    return removeTailwindV4GeneratedUserCssArtifacts(finalizeMiniProgramGeneratorCss(
      createCssSourceOrderAppend(wrapUserLayerComponentsCss(layer), rest),
      generated.target,
      options.runtimeState.tailwindRuntime.majorVersion,
      options.opts.cssPreflight,
      { injectPreflight: false, preservePreflight: generated.metadata?.preflightMode?.preserve, styleOptions: options.cssHandlerOptions },
    ))
  }
  const userSource = normalizeUserSource(source)
  const ordered = splitRawSourceByGeneratedCssOrder(userSource, generated.metadata?.rawCss ?? '')
    ?? { before: '', after: userSource }
  // 已经过框架转换的 CSS 不再重放框架插件；双方完成小程序适配后再比较和合并。
  const before = filterExistingCssRules(css, await transform(ordered.before))
  const withBefore = createCssSourceOrderAppend(before, css)
  const after = filterExistingCssRules(withBefore, await transform(ordered.after))
  return reorderMarkedUserLayerComponentsCss(createCssSourceOrderAppend(withBefore, after))
}
