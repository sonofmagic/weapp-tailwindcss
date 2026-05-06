export * from './bundlers/vite/index'
/** {@link UnifiedViteWeappTailwindcssPlugin} 的推荐别名，方便在 Vite plugins 中注册 */
export { UnifiedViteWeappTailwindcssPlugin as WeappTailwindcss } from './bundlers/vite/index'
/** {@link UnifiedViteWeappTailwindcssPlugin} 的小写别名，兼容函数式命名习惯 */
export { UnifiedViteWeappTailwindcssPlugin as weappTailwindcss } from './bundlers/vite/index'

export type { UserDefinedOptions } from './types'
