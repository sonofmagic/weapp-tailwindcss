export { createWeappTailwindcssGenerator } from './generator'
export type * from './generator'
export { createPlugins } from './gulp'
export { weappTailwindcssPostcssPlugin } from './postcss'
export type { WeappTailwindcssPostcssPluginOptions } from './postcss'
export type * from './types'
/**
 * @deprecated 请改用 `import { WeappTailwindcss } from 'weapp-tailwindcss/vite'`。
 */
export { UnifiedViteWeappTailwindcssPlugin } from './vite'
export { UnifiedWebpackPluginV5, weappTailwindcssPackageDir } from './webpack'
