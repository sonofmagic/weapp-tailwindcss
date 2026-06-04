export * from './bundlers/gulp/index'
/** {@link createPlugins} 的推荐别名，方便在 Gulp 流程中注册 */
export { createPlugins as WeappTailwindcss } from './bundlers/gulp/index'
/** {@link createPlugins} 的小写别名，兼容函数式命名习惯 */
export { createPlugins as weappTailwindcss } from './bundlers/gulp/index'

export type { UserDefinedOptions } from './types'
