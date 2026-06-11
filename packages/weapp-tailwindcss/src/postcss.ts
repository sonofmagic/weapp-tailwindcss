import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { PluginCreator, Rule } from 'postcss'
import type {
  TailwindV4CandidateSource,
  TailwindV4SourceOptions,
  WeappTailwindcssGenerateOptions,
  WeappTailwindcssGeneratorUserOptions,
} from './generator'
import postcss from 'postcss'
import { hasTailwindApplyDirective, hasTailwindRootDirectives } from './bundlers/shared/generator-css/directives'
import {
  createWeappTailwindcssGenerator,
  normalizeWeappTailwindcssGeneratorOptions,
  resolveTailwindV3Source,
  resolveTailwindV4Source,
} from './generator'
import { prependConfigDirective } from './postcss/config-directive'
import { addDependencyMessages, addSourceDependencyMessages, replaceRootCss, resolvePostcssBase, resolvePostcssProjectRoot } from './postcss/context'
import { collectAutoTailwindCandidates, collectPostcssLocalSources } from './postcss/source-files'
import { resolvePostcssTailwindVersion } from './postcss/tailwind-version'

const PLUGIN_NAME = 'weapp-tailwindcss'

function isTailwindV4ApplyOnlyCss(css: string) {
  return hasTailwindApplyDirective(css)
    && !hasTailwindRootDirectives(css, { importFallback: true })
}

function resolveTailwindV4PostcssSourceCss(css: string, sourceOptions: Pick<WeappTailwindcssPostcssPluginOptions, 'packageName'>) {
  return isTailwindV4ApplyOnlyCss(css)
    ? `@import "${sourceOptions.packageName ?? 'tailwindcss'}" source(none);\n${css}`
    : css
}

function normalizeSelector(selector: string) {
  return selector.replace(/:not\(#\\#\)/g, '').trim()
}

function collectApplyOnlyCssSelectors(css: string) {
  const selectors = new Set<string>()
  try {
    const root = postcss.parse(css)
    root.walkRules((rule) => {
      if (!rule.nodes?.some(node => node.type === 'atrule' && node.name === 'apply')) {
        return
      }
      for (const selector of rule.selectors ?? [rule.selector]) {
        const normalized = normalizeSelector(selector)
        if (normalized) {
          selectors.add(normalized)
        }
      }
    })
  }
  catch {
  }
  return selectors
}

function ruleMatchesApplyOnlySelector(rule: Rule, selectors: Set<string>) {
  const ruleSelectors = rule.selectors ?? [rule.selector]
  return ruleSelectors.some(selector => selectors.has(normalizeSelector(selector)))
}

function filterApplyOnlyGeneratedCss(css: string, rawCss: string) {
  const selectors = collectApplyOnlyCssSelectors(rawCss)
  if (selectors.size === 0) {
    return css
  }

  try {
    const root = postcss.parse(css)
    root.walkRules((rule) => {
      if (!ruleMatchesApplyOnlySelector(rule, selectors) && !rule.nodes?.some(node => node.type === 'decl' && node.prop.startsWith('--'))) {
        rule.remove()
      }
    })
    root.walkAtRules((rule) => {
      if (rule.nodes !== undefined && rule.nodes.length === 0) {
        rule.remove()
      }
    })
    return root.toString()
  }
  catch {
    return css
  }
}

/**
 * `weapp-tailwindcss` PostCSS 插件配置。
 */
export interface WeappTailwindcssPostcssPluginOptions extends TailwindV4SourceOptions {
  /**
   * 生成器配置，用于控制目标端、Tailwind 配置路径和 v4 兼容层。
   */
  generator?: WeappTailwindcssGeneratorUserOptions
  /**
   * 显式指定 Tailwind CSS 主版本。未传入时会从 CSS 与依赖环境推断。
   */
  version?: 3 | 4
  /**
   * Tailwind 配置文件路径。
   */
  config?: string
  /**
   * Tailwind PostCSS 插件名称。
   */
  postcssPlugin?: string
  /**
   * 额外传入的候选类名。
   */
  candidates?: Iterable<string>
  /**
   * 是否扫描 Tailwind v4 源码入口中的候选类名。
   */
  scanSources?: WeappTailwindcssGenerateOptions['scanSources']
  /**
   * 额外传入的 Tailwind v4 内联候选来源。
   */
  sources?: TailwindV4CandidateSource[]
  /**
   * 传给小程序 CSS 兼容转换器的额外配置。
   */
  styleOptions?: Partial<IStyleHandlerOptions>
}

export const weappTailwindcssPostcssPlugin: PluginCreator<WeappTailwindcssPostcssPluginOptions> = (options = {}) => {
  return {
    postcssPlugin: PLUGIN_NAME,
    async Once(root, { result }) {
      const {
        candidates,
        generator: userGeneratorOptions,
        scanSources,
        sources,
        styleOptions,
        ...sourceOptions
      } = options
      const generatorOptions = normalizeWeappTailwindcssGeneratorOptions(userGeneratorOptions)
      const tailwindVersion = resolvePostcssTailwindVersion(root, result, options)

      const [collectedSources, autoCandidates] = await Promise.all([
        collectPostcssLocalSources(root, result, options),
        collectAutoTailwindCandidates(root, result, options),
      ])
      const generatorConfig = generatorOptions.config ?? options.config
      const rawCss = sourceOptions.css ?? root.toString()
      const isApplyOnlyTailwindV4Css = tailwindVersion === 4 && isTailwindV4ApplyOnlyCss(rawCss)
      const source = tailwindVersion === 3
        ? await resolveTailwindV3Source({
            config: generatorConfig,
            css: rawCss,
            base: resolvePostcssBase(result, options),
            cwd: resolvePostcssProjectRoot(result, options),
            projectRoot: resolvePostcssProjectRoot(result, options),
            packageName: options.packageName,
            postcssPlugin: options.postcssPlugin,
          })
        : await resolveTailwindV4Source({
            ...sourceOptions,
            css: prependConfigDirective(
              resolveTailwindV4PostcssSourceCss(rawCss, sourceOptions),
              generatorConfig,
            ),
            base: resolvePostcssBase(result, options),
            projectRoot: resolvePostcssProjectRoot(result, options),
          })
      const generator = createWeappTailwindcssGenerator(source)
      const generateOptions: WeappTailwindcssGenerateOptions = {
        candidates: new Set([
          ...autoCandidates,
          ...(candidates ?? []),
        ]),
        scanSources: scanSources ?? false,
        sources: [
          ...collectedSources.sources,
          ...(sources ?? []),
        ],
        styleOptions: {
          ...generatorOptions.styleOptions,
          ...styleOptions,
        },
        tailwindcssV3Compatibility: generatorOptions.tailwindcssV3Compatibility,
        target: generatorOptions.target,
      }
      const generated = await generator.generate(generateOptions)
      const css = isApplyOnlyTailwindV4Css
        ? filterApplyOnlyGeneratedCss(generated.css, rawCss)
        : generated.css

      replaceRootCss(root, css, result)
      addDependencyMessages(result, generated)
      addSourceDependencyMessages(result, collectedSources.files)
      result.messages.push({
        type: 'weapp-tailwindcss:generated',
        plugin: PLUGIN_NAME,
        target: generated.target,
        classSet: generated.classSet,
        rawCss: generated.rawCss,
      })
    },
  }
}

weappTailwindcssPostcssPlugin.postcss = true

export default weappTailwindcssPostcssPlugin
