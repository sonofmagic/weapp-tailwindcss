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
export {
  resolveDefaultMpxAppPaths,
  resolveMpxSubPackages,
} from './mpx'
export type {
  MpxSubPackageConfig,
  MpxSubPackageStyleEntry,
  ResolvedMpxSubPackage,
} from './mpx'
export {
  collectSubpackageStyleAssets,
  collectSubpackageTargetStyleAssets,
  getSubpackageStyleAssetExt,
  isFileInSubpackageScope,
  isFileMatchedBySubpackageScope,
  isLikelyStyleAssetSource,
  isMatchedSourceModuleTargetFile,
  isSourceFileMatchedBySubpackageScope,
  isSourceModuleTargetFile,
  isSubpackageStyleOutputFile,
  isSupportedStyleExt,
  normalizeOutputName,
  resolveSubpackageOutputFileName,
  resolveSubpackageStyleImport,
  shouldInjectSubpackageStyleImport,
} from './subpackage'
export type {
  ResolvedSubpackageStyleAsset,
  ResolvedSubpackageStyleScope,
  ResolvedSubpackageTargetSourceFile,
  ResolvedSubpackageTargetSourceModule,
  ResolvedSubpackageTargetStyleAsset,
  SubpackageStyleBundler,
  SubpackageStyleFramework,
  SubpackageStyleGenerateContext,
  SubpackageStyleGenerator,
} from './subpackage'
export {
  createTaroSubPackageImportResolver,
  resolveTaroSubPackages,
} from './taro'
export type {
  ResolvedTaroSubPackage,
  TaroSubPackageConfig,
  TaroSubPackageStyleEntry,
} from './taro'
export {
  createUniAppSubPackageImportResolver,
  resolveUniAppStyleScopes,
  splitUniAppStyleScopes,
} from './uni-app'
export type {
  ResolvedSubPackage,
  UniAppManualStyleConfig,
  UniAppStyleScopeInput,
  UniAppSubPackageConfig,
  UniAppSubPackageStyleEntry,
} from './uni-app'
export {
  ensurePosix,
  mergePerFileResolvers,
  normalizeRelativeImport,
  normalizeRoot,
  toArray,
} from './utils'

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
