import type { PluginCreator, Rule } from 'postcss'
import type { WeappTailwindcssPostcssPluginAdapters, WeappTailwindcssPostcssPluginOptions } from './types'
import postcss from 'postcss'
import { prependConfigDirective } from './config-directive'
import { addDependencyMessages, addSourceDependencyMessages, replaceRootCss, resolvePostcssBase, resolvePostcssProjectRoot } from './context'
import { hasTailwindApplyDirective, hasTailwindRootDirectives } from './directives'
import { collectAutoTailwindCandidates, collectPostcssLocalSources } from './source-files'
import { resolvePostcssTailwindVersion } from './tailwind-version'

const PLUGIN_NAME = 'weapp-tailwindcss'

function isTailwindV4ApplyOnlyCss(css: string, root: postcss.Root) {
  return hasTailwindApplyDirective(css)
    && !hasTailwindRootDirectives(root, { importFallback: true })
}

function resolveTailwindV4PostcssSourceCss(css: string, sourceOptions: Pick<WeappTailwindcssPostcssPluginOptions, 'packageName'>, root: postcss.Root) {
  return isTailwindV4ApplyOnlyCss(css, root)
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

export function createWeappTailwindcssPostcssPlugin(
  adapters: WeappTailwindcssPostcssPluginAdapters,
): PluginCreator<WeappTailwindcssPostcssPluginOptions> {
  const plugin: PluginCreator<WeappTailwindcssPostcssPluginOptions> = (options = {}) => {
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
        const generatorOptions = adapters.normalizeGeneratorOptions(userGeneratorOptions)
        const tailwindVersion = resolvePostcssTailwindVersion(root, result, options)

        const [collectedSources, autoCandidates] = await Promise.all([
          collectPostcssLocalSources(root, result, options),
          collectAutoTailwindCandidates(root, result, options),
        ])
        const generatorConfig = generatorOptions.config ?? options.config
        const rawCss = sourceOptions.css ?? root.toString()
        const isApplyOnlyTailwindV4Css = tailwindVersion === 4 && isTailwindV4ApplyOnlyCss(rawCss, root)
        const source = await adapters.resolveTailwindV4Source({
          ...sourceOptions,
          css: prependConfigDirective(
            resolveTailwindV4PostcssSourceCss(rawCss, sourceOptions, root),
            generatorConfig,
          ),
          base: resolvePostcssBase(result, options),
          projectRoot: resolvePostcssProjectRoot(result, options),
        })
        const generator = adapters.createGenerator(source)
        const generated = await generator.generate({
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
          target: generatorOptions.target,
        })
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

  plugin.postcss = true
  return plugin
}

export type {
  NormalizedWeappTailwindcssPostcssGeneratorOptions,
  TailwindCandidateSource,
  TailwindResolvedSource,
  TailwindV4SourceOptions,
  WeappTailwindcssPostcssGenerateOptions,
  WeappTailwindcssPostcssGenerateResult,
  WeappTailwindcssPostcssGenerator,
  WeappTailwindcssPostcssGeneratorUserOptions,
  WeappTailwindcssPostcssPluginAdapters,
  WeappTailwindcssPostcssPluginOptions,
  WeappTailwindcssPostcssTailwindVersion,
  WeappTailwindcssPostcssTarget,
} from './types'
