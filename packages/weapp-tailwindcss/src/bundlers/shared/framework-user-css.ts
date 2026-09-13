import type { GenerateCssByGeneratorOptions, GenerateCssByGeneratorResult } from './generator-css'
import type { NormalizedWeappTailwindcssGeneratorOptions } from '@/generator'
import { filterExistingCssRules, postcss } from '@weapp-tailwindcss/postcss'
import { createCssSourceOrderAppend, finalizeMiniProgramGeneratorCss, resolveGeneratorStyleOptions, splitRawSourceByGeneratedCssOrder } from './generator-css/generation-helpers'
import { stripTailwindBanners } from './generator-css/markers'
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

function normalizeMergedCharset(css: string) {
  if (!css.includes('@charset')) {
    return css
  }
  try {
    const root = postcss.parse(css)
    let charset: postcss.AtRule | undefined
    root.walkAtRules('charset', (rule) => {
      charset ??= rule.clone({ raws: { before: '', afterName: ' ' } })
      rule.remove()
    })
    if (charset) {
      // 各输入已被解码；合并产物只保留文件开头的一条编码声明。
      root.prepend(charset)
    }
    return root.toString()
  }
  catch {
    return css
  }
}

function filterGeneratedRulesPreservingOverrides(base: string, source: string) {
  const filtered = filterExistingCssRules(base, source)
  try {
    const root = postcss.parse(source)
    const contents = new Map<string, Set<string>>()
    root.walkRules((rule) => {
      const key = rule.selector.replace(/\s+/g, ' ').trim()
      const values = contents.get(key) ?? new Set<string>()
      values.add(rule.toString().replace(/\s+/g, ''))
      contents.set(key, values)
    })
    const overridden = new Set([...contents].filter(([, values]) => values.size > 1).map(([key]) => key))
    const filteredText = filtered.replace(/\s+/g, '')
    const baseRuleTexts = new Set<string>()
    postcss.parse(base).walkRules((rule) => {
      baseRuleTexts.add(rule.toString().replace(/\s+/g, ''))
    })
    const seenValues = new Map<string, Set<string>>()
    const restored: string[] = []
    root.walkRules((rule) => {
      const key = rule.selector.replace(/\s+/g, ' ').trim()
      const normalized = rule.toString().replace(/\s+/g, '')
      const values = seenValues.get(key) ?? new Set<string>()
      const followsOverride = [...values].some(value => value !== normalized)
      if (overridden.has(key) && !filteredText.includes(normalized)
        && (!baseRuleTexts.has(normalized) || followsOverride)) {
        restored.push(rule.toString())
      }
      values.add(normalized)
      seenValues.set(key, values)
    })
    return restored.length ? createCssSourceOrderAppend(filtered, restored.join('\n')) : filtered
  }
  catch {
    return filtered
  }
}

function deduplicateExactRulesWithoutCrossingOverrides(css: string) {
  // 大型生成产物通常已经由生成器按来源去重；避免在每次构建上重复遍历完整规则树。
  if (css.length > 250_000) {
    return css
  }
  try {
    const root = postcss.parse(css)
    const previous = new Map<string, { rule: postcss.Rule, content: string }>()
    root.walkRules((rule) => {
      const selector = rule.selector.replace(/\s+/g, ' ').trim()
      const content = rule.toString().replace(/\s+/g, '')
      const prior = previous.get(selector)
      if (prior && prior.content === content) {
        // 保留首次出现的位置，避免重复的框架层规则越过后续覆盖项。
        rule.remove()
        return
      }
      previous.set(selector, { rule, content })
    })
    return root.toString()
  }
  catch {
    return css
  }
}

export async function restoreFrameworkProcessedUserCss(
  css: string,
  generated: GenerateCssByGeneratorResult,
  source: string,
  options: GenerateCssByGeneratorOptions,
  generatorOptions: NormalizedWeappTailwindcssGeneratorOptions,
) {
  const generatedSource = [generated.metadata?.rawCss, css].filter(Boolean).join('\n')
  const userCssOptions = {
    generatorTarget: generated.target,
    generatedSource,
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
    ), generatedSource)
  }
  const userSource = normalizeUserSource(source)
  const ordered = splitRawSourceByGeneratedCssOrder(userSource, generated.metadata?.rawCss ?? '')
    ?? { before: '', after: userSource }
  // 已经过框架转换的 CSS 不再重放框架插件；双方完成小程序适配后再比较和合并。
  const before = await transform(ordered.before)
  const after = await transform(ordered.after)
  // 框架产物是用户规则顺序的权威来源；只清理生成侧的重复副本，不能按集合删除用户覆盖。
  // 框架处理结果来自用户输入，必须完整保留重复规则及其级联顺序。
  const generatedBefore = filterGeneratedRulesPreservingOverrides(css, before)
  const generatedAfter = filterGeneratedRulesPreservingOverrides(createCssSourceOrderAppend(css, generatedBefore), after)
  const withBefore = createCssSourceOrderAppend(generatedBefore, css)
  return stripTailwindBanners(normalizeMergedCharset(deduplicateExactRulesWithoutCrossingOverrides(reorderMarkedUserLayerComponentsCss(createCssSourceOrderAppend(withBefore, generatedAfter)))))
}
