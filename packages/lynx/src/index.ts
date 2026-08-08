import type { RsbuildPlugin } from '@lynx-js/rspeedy'
import type { WeappTailwindcssGeneratorOptions } from 'weapp-tailwindcss/generator'
import type { PatchRspackConfigOptions, RspackConfigLike } from 'weapp-tailwindcss/rspack'
import type { UserDefinedOptions } from 'weapp-tailwindcss/types'
import { patchRspackConfig, WeappTailwindcss } from 'weapp-tailwindcss/rspack'

const PLUGIN_NAME = 'weapp-tailwindcss:lynx'

interface LynxGeneratorOptions extends Omit<WeappTailwindcssGeneratorOptions, 'target'> {}

/** ReactLynx Rspeedy 适配配置。 */
export interface LynxTailwindcssOptions extends Omit<UserDefinedOptions, 'platform' | 'generator'> {
  /** 透传给 Rspack CSS 规则补丁的配置。 */
  rspack?: PatchRspackConfigOptions | undefined
  /** Tailwind CSS v4 生成配置，目标固定为 Lynx 可消费的 web CSS。 */
  generator?: LynxGeneratorOptions | false | undefined
}

interface RspackPluginChain {
  use: (plugin: new (options: UserDefinedOptions) => unknown, options: [UserDefinedOptions]) => unknown
}

interface BundlerChain {
  plugin: (name: string) => RspackPluginChain
}

interface RsbuildPluginApi {
  modifyBundlerChain: (handler: (chain: BundlerChain) => BundlerChain) => void
  modifyRspackConfig: (handler: (config: RspackConfigLike) => RspackConfigLike) => void
}

function normalizeOptions(options: LynxTailwindcssOptions): UserDefinedOptions {
  const { rspack: _rspack, generator, ...rest } = options
  return {
    ...rest,
    platform: 'lynx',
    cssOptions: {
      ...options.cssOptions,
      platform: 'lynx',
    },
    generator: {
      ...(generator === false ? {} : generator),
      target: 'web',
    },
  }
}

/**
 * 为 ReactLynx + Rspeedy 注册 Tailwind CSS v4 构建链路。
 *
 * Lynx 原生支持 CSS class selector，因此不会改写 JSX `className` 或创建运行时样式表。
 */
export function pluginLynxTailwindcss(options: LynxTailwindcssOptions = {}): RsbuildPlugin {
  const normalizedOptions = normalizeOptions(options)

  return {
    name: PLUGIN_NAME,
    setup(api) {
      const rsbuildApi = api as unknown as RsbuildPluginApi
      rsbuildApi.modifyBundlerChain((chain) => {
        chain.plugin(PLUGIN_NAME).use(WeappTailwindcss, [normalizedOptions])
        return chain
      })
      rsbuildApi.modifyRspackConfig(config => patchRspackConfig(config, options.rspack))
    },
  }
}

export { PLUGIN_NAME }
