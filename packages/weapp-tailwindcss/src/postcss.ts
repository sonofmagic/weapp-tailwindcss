import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { PluginCreator } from 'postcss'
import type {
  TailwindV4CandidateSource,
  TailwindV4SourceOptions,
  WeappTailwindcssGenerateOptions,
  WeappTailwindcssGeneratorUserOptions,
} from './generator'
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

export interface WeappTailwindcssPostcssPluginOptions extends TailwindV4SourceOptions {
  generator?: WeappTailwindcssGeneratorUserOptions
  version?: 3 | 4
  config?: string
  postcssPlugin?: string
  candidates?: Iterable<string>
  scanSources?: WeappTailwindcssGenerateOptions['scanSources']
  sources?: TailwindV4CandidateSource[]
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
      const source = tailwindVersion === 3
        ? await resolveTailwindV3Source({
            config: generatorConfig,
            css: sourceOptions.css ?? root.toString(),
            base: resolvePostcssBase(result, options),
            cwd: resolvePostcssProjectRoot(result, options),
            projectRoot: resolvePostcssProjectRoot(result, options),
            packageName: options.packageName,
            postcssPlugin: options.postcssPlugin,
          })
        : await resolveTailwindV4Source({
            ...sourceOptions,
            css: prependConfigDirective(sourceOptions.css ?? root.toString(), generatorConfig),
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

      replaceRootCss(root, generated.css, result)
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
