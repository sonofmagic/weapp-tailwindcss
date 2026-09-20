import type { OutputAsset, OutputBundle } from 'rollup'
import type { CssFinalizerContext } from './options'
import { applyConfiguredCssCalc } from '@weapp-tailwindcss/postcss/transform'
import { collectViteProcessedCssSources } from './options'

/** 在所有 CSS 资产完成组装后，为普通 Web 样式补齐显式启用的 calc 计算。 */
export async function finalizeWebCssCalc(bundle: OutputBundle, context: CssFinalizerContext) {
  const cssCalc = context.opts.cssOptions?.cssCalc ?? context.opts.cssCalc
  if (!cssCalc) {
    return
  }
  const assets = Object.values(bundle).filter((output): output is OutputAsset =>
    output.type === 'asset'
    && context.opts.cssMatcher(output.fileName)
    && !context.opts.htmlMatcher(output.fileName),
  )
  const pending = assets.map(asset => ({
    asset,
    original: typeof asset.source === 'string' ? asset.source : new TextDecoder().decode(asset.source),
  })).filter(({ original }) => original.includes('calc('))
  if (pending.length === 0) {
    return
  }
  // 只有唯一生成上下文才允许跨资产补充变量，多个主题入口不能按遍历顺序互相覆盖。
  const sources = new Set(collectViteProcessedCssSources(context.getViteProcessedCssAssetResults))
  const contextCss = sources.size === 1 ? sources.values().next().value : undefined
  for (const { asset, original } of pending) {
    const css = await applyConfiguredCssCalc(original, { cssCalc, contextCss })
    if (css !== original) {
      asset.source = css
      context.recordCssAssetResult?.(asset.fileName, css)
      context.opts.onUpdate(asset.fileName, original, css)
    }
  }
}
