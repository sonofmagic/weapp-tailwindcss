import type { OutputAsset, OutputBundle } from 'rollup'
import type { CssFinalizerContext } from './options'
import path from 'node:path'
import { applyConfiguredCssCalc, applyConfiguredCssUnits } from '@weapp-tailwindcss/postcss/transform'
import { normalizeOutputPathKey } from '@/bundlers/shared/module-graph'
import { collectCssCalcScopes } from './css-scope-graph'

interface FinalizedCss {
  original: string
  final: string
}

const previousAssets = new WeakMap<CssFinalizerContext, Map<string, FinalizedCss>>()

function readSource(asset: OutputAsset) {
  return typeof asset.source === 'string' ? asset.source : new TextDecoder().decode(asset.source)
}

/** 按最终消费作用域求值；保留原始表达式供后续 watch 构建重新判断。 */
export async function finalizeCssCalc(bundle: OutputBundle, context: CssFinalizerContext, convertUnits = false) {
  const deferredOptions = context.getFinalCssCalcOptions?.()
  const options = deferredOptions ?? context.opts
  const cssCalc = options.cssOptions?.cssCalc ?? options.cssCalc
  if (!cssCalc) {
    return
  }
  const previous = previousAssets.get(context) ?? new Map<string, FinalizedCss>()
  const assets = new Map(Object.entries(bundle).flatMap(([key, output]) => {
    const file = normalizeOutputPathKey(output.fileName || key)
    return output.type === 'asset' && context.opts.cssMatcher(file) && !context.opts.htmlMatcher(file)
      ? [[file, output] as const]
      : []
  }))
  // Rollup/watch 可能重用上一轮资产对象；求值前恢复我们持有的原始表达式。
  for (const [file, asset] of assets) {
    const prior = previous.get(file)
    if (prior && readSource(asset) === prior.final) {
      asset.source = prior.original
    }
  }
  const conditionalSources = new Set<string>()
  const scopes = collectCssCalcScopes(bundle, {
    matchesCss: file => assets.has(normalizeOutputPathKey(file)),
    onConditionalSource: file => conditionalSources.add(file),
  })
  const sources = new Map([...assets].map(([file, asset]) => [file, readSource(asset)]))
  const next = new Map<string, FinalizedCss>()
  for (const [file, asset] of assets) {
    const original = sources.get(file)!
    const contextCss = [...(scopes.get(file) ?? [file])].map((sourceFile) => {
      const source = sources.get(sourceFile) ?? ''
      // 包装仅供变量安全分析使用，条件导入不能变成无条件主题值。
      return conditionalSources.has(sourceFile) ? `@media all{${source}}` : source
    }).join('\n')
    const calculated = await applyConfiguredCssCalc(original, { ...options, contextCss })
    const outDir = context.getResolvedConfig?.()?.build?.outDir
    const root = context.getResolvedConfig?.()?.root
    const css = convertUnits && deferredOptions
      ? await applyConfiguredCssUnits(calculated, {
          ...options,
          postcssOptions: { options: { from: path.resolve(root ?? '.', outDir ?? '.', file) } },
        })
      : calculated
    next.set(file, { original, final: css })
    if (css !== original) {
      asset.source = css
      // 不把作用域求值后的结果写回生成缓存，下一轮作者 CSS 可能改变安全性。
      context.opts.onUpdate(asset.fileName || file, original, css)
    }
  }
  previousAssets.set(context, next)
}

export function finalizeWebCssCalc(bundle: OutputBundle, context: CssFinalizerContext) {
  return finalizeCssCalc(bundle, context, true)
}
