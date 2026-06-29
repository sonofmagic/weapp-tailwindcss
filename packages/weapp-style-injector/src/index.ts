export {
  createStyleInjector,
  DEFAULT_INCLUDE,
  PLUGIN_NAME,
} from './core'
export type {
  GlobPattern,
  InjectionResult,
  PerFileImportResolver,
  StyleInjector,
  WeappStyleInjectorOptions,
} from './core'

export { weappStyleInjector } from './vite'
export { weappStyleInjector as default } from './vite'
export type { ViteWeappStyleInjectorOptions } from './vite'
export { StyleInjector as TaroStyleInjector } from './vite/taro'
export type { ViteTaroStyleInjectorOptions } from './vite/taro'
export { StyleInjector as UniAppStyleInjector } from './vite/uni-app'
export type { ViteUniAppStyleInjectorOptions } from './vite/uni-app'

export {
  weappStyleInjectorWebpack,
  WeappStyleInjectorWebpackPlugin,
} from './webpack'
export type { WebpackWeappStyleInjectorOptions } from './webpack'
export { StyleInjector as MpxStyleInjectorWebpack } from './webpack/mpx'
export type { WebpackMpxStyleInjectorOptions } from './webpack/mpx'
export { StyleInjector as TaroStyleInjectorWebpack } from './webpack/taro'
export type { WebpackTaroStyleInjectorOptions } from './webpack/taro'
export { StyleInjector as UniAppStyleInjectorWebpack } from './webpack/uni-app'
export type { WebpackUniAppStyleInjectorOptions } from './webpack/uni-app'
