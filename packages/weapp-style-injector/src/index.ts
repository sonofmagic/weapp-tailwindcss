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

export { createTaroSubPackageImportResolver } from './taro'
export type { TaroSubPackageConfig } from './taro'

export { createUniAppSubPackageImportResolver } from './uni-app'
export type { UniAppSubPackageConfig } from './uni-app'

export { weappStyleInjector } from './vite'
export { weappStyleInjector as default } from './vite'
export type { ViteWeappStyleInjectorOptions } from './vite'
export { weappStyleInjectorTaro } from './vite/taro'
export type { ViteTaroStyleInjectorOptions } from './vite/taro'
export { weappStyleInjectorUniApp } from './vite/uni-app'
export type { ViteUniAppStyleInjectorOptions } from './vite/uni-app'

export {
  weappStyleInjectorWebpack,
  WeappStyleInjectorWebpackPlugin,
} from './webpack'
export type { WebpackWeappStyleInjectorOptions } from './webpack'
export { weappStyleInjectorWebpackTaro } from './webpack/taro'
export type { WebpackTaroStyleInjectorOptions } from './webpack/taro'
export { weappStyleInjectorWebpackUniApp } from './webpack/uni-app'
export type { WebpackUniAppStyleInjectorOptions } from './webpack/uni-app'
