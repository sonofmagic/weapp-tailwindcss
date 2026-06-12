import type {
  WeappTailwindcssPostcssPluginAdapters,
  WeappTailwindcssPostcssPluginOptions,
} from '@weapp-tailwindcss/postcss'
import type { PluginCreator } from 'postcss'
import { createWeappTailwindcssPostcssPlugin } from '@weapp-tailwindcss/postcss'
import {
  createWeappTailwindcssGenerator,
  normalizeWeappTailwindcssGeneratorOptions,
  resolveTailwindV3Source,
  resolveTailwindV4Source,
} from './generator'

const adapters: WeappTailwindcssPostcssPluginAdapters = {
  createGenerator: source => createWeappTailwindcssGenerator(source as Parameters<typeof createWeappTailwindcssGenerator>[0]),
  normalizeGeneratorOptions: options => normalizeWeappTailwindcssGeneratorOptions(options),
  resolveTailwindV3Source,
  resolveTailwindV4Source,
}

export type { WeappTailwindcssPostcssPluginOptions }

export const weappTailwindcssPostcssPlugin: PluginCreator<WeappTailwindcssPostcssPluginOptions> = createWeappTailwindcssPostcssPlugin(adapters)

export default weappTailwindcssPostcssPlugin
