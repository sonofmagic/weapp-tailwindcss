import pkg from '../package.json'

export const runtimeAopLoader = 'weapp-tw-runtime-aop-loader'

export const WeappTailwindcssWebpackPluginOptimizeChunkAssetsHooks
  = 'WeappTailwindcssWebpackPluginOptimizeChunkAssetsHooks'

export const pluginName = 'weapp-tailwindcss'

export const vitePluginName = 'weapp-tailwindcss:adaptor'

export const WEAPP_TW_REQUIRED_NODE_VERSION = '22.18.0'
export const WEAPP_TW_REQUIRED_NODE_VERSION_RANGE = '^22.18.0 || >=24.11.0'
export const WEAPP_TW_VERSION = pkg.version

export const DEFAULT_RUNTIME_PACKAGE_REPLACEMENTS = {
  'tailwind-merge': '@weapp-tailwindcss/merge',
  'class-variance-authority': '@weapp-tailwindcss/cva',
  'tailwind-variants': '@weapp-tailwindcss/variants',
} as const
