export const runtimeAopLoader = 'weapp-tw-runtime-aop-loader'

export const ManglePluginHooks = 'ManglePluginHooks'

export const WeappTailwindcssWebpackPluginOptimizeChunkAssetsHooks
  = 'WeappTailwindcssWebpackPluginOptimizeChunkAssetsHooks'

export const pluginName = 'weapp-tailwindcss-webpack-plugin'

export const vitePluginName = 'weapp-tailwindcss:adaptor'

export const WEAPP_TW_REQUIRED_NODE_VERSION = '18.17.0'

export const DEFAULT_RUNTIME_PACKAGE_REPLACEMENTS = {
  'tailwind-merge': '@weapp-tailwindcss/merge',
  'class-variance-authority': '@weapp-tailwindcss/cva',
  'tailwind-variants': '@weapp-tailwindcss/variants',
} as const
