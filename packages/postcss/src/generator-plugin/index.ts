import type { PluginCreator, Root } from 'postcss'
import type { WeappTailwindcssPostcssPluginAdapters, WeappTailwindcssPostcssPluginOptions } from './types'
import { transformWebCssCompat } from '../compat/web-css'
import { collectApplyOnlyCssSelectorsRoot, filterApplyOnlyGeneratedCss } from './apply-only'
import { prependConfigDirective } from './config-directive'
import { addDependencyMessages, addSourceDependencyMessages, replaceRootCss, resolvePostcssBase, resolvePostcssProjectRoot } from './context'
import { hasTailwindApplyDirective, hasTailwindRootDirectives } from './directives'
import { collectAutoTailwindCandidates, collectPostcssLocalSources } from './source-files'

const PLUGIN_NAME = 'weapp-tailwindcss'

function isTailwindV4ApplyOnlyCss(css: string, root: Root) {
  return hasTailwindApplyDirective(css)
    && !hasTailwindRootDirectives(root, { importFallback: true })
}

function resolveTailwindV4PostcssSourceCss(css: string, sourceOptions: Pick<WeappTailwindcssPostcssPluginOptions, 'packageName'>, root: Root) {
  const packageName = sourceOptions.packageName ?? 'tailwindcss'
  return isTailwindV4ApplyOnlyCss(css, root)
    ? `@import "${packageName}" source(none);\n@reference "${packageName}";\n${css}`
    : css
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
        const rawCss = sourceOptions.css ?? root.toString()

        const [collectedSources, autoCandidates] = await Promise.all([
          collectPostcssLocalSources(root, result, options),
          collectAutoTailwindCandidates(root, result, options, rawCss),
        ])
        const generatorConfig = generatorOptions.config ?? options.config
        const isApplyOnlyTailwindV4Css = isTailwindV4ApplyOnlyCss(rawCss, root)
        const applyOnlyCssSelectors = isApplyOnlyTailwindV4Css
          ? collectApplyOnlyCssSelectorsRoot(root)
          : undefined
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
          ? filterApplyOnlyGeneratedCss(generated.css, applyOnlyCssSelectors ?? new Set())
          : generated.css
        const finalCss = generated.target === 'web'
          ? transformWebCssCompat(css, generatorOptions.webCompat)
          : css

        replaceRootCss(root, finalCss, result)
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
  WeappTailwindcssPostcssTarget,
} from './types'
