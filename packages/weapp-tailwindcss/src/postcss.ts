import type {
  PluginCreator,
  WeappTailwindcssPostcssGenerateOptions,
  WeappTailwindcssPostcssGenerator,
  WeappTailwindcssPostcssPluginAdapters,
  WeappTailwindcssPostcssPluginOptions,
} from '@weapp-tailwindcss/postcss'
import { createWeappTailwindcssPostcssPlugin } from '@weapp-tailwindcss/postcss'
import {
  createWeappTailwindcssGenerator,
  normalizeWeappTailwindcssGeneratorOptions,
  resolveTailwindV3Source,
  resolveTailwindV4Source,
} from './generator'

const adapters: WeappTailwindcssPostcssPluginAdapters = {
  createGenerator: (source) => {
    const generator = createWeappTailwindcssGenerator(source as Parameters<typeof createWeappTailwindcssGenerator>[0])
    return {
      generate: async (options?: WeappTailwindcssPostcssGenerateOptions) => {
        const generated = await generator.generate(options as Parameters<typeof generator.generate>[0])
        return {
          css: generated.css,
          rawCss: generated.rawCss,
          target: generated.target,
          classSet: generated.classSet,
          dependencies: generated.dependencies,
        }
      },
    } satisfies WeappTailwindcssPostcssGenerator
  },
  normalizeGeneratorOptions: options => normalizeWeappTailwindcssGeneratorOptions(options as Parameters<typeof normalizeWeappTailwindcssGeneratorOptions>[0]),
  resolveTailwindV3Source: options => resolveTailwindV3Source(options as Parameters<typeof resolveTailwindV3Source>[0]),
  resolveTailwindV4Source: options => resolveTailwindV4Source(options as Parameters<typeof resolveTailwindV4Source>[0]),
}

export type { WeappTailwindcssPostcssPluginOptions }

export const weappTailwindcssPostcssPlugin: PluginCreator<WeappTailwindcssPostcssPluginOptions> = createWeappTailwindcssPostcssPlugin(adapters)

export default weappTailwindcssPostcssPlugin
