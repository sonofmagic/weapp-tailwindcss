export * from './bundlers/vite/index'
/** {@link WeappTailwindcss} 的小写别名，兼容函数式命名习惯 */
export { WeappTailwindcss as weappTailwindcss } from './bundlers/vite/index'
export {
  WeappTailwindcssWeb,
  weappTailwindcssWeb,
} from './bundlers/vite/web'
export type { WeappTailwindcssWebOptions } from './bundlers/vite/web'

export type { UserDefinedOptions } from './types'
