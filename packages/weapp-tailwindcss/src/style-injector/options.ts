import type {
  MpxSubPackageConfig,
  MpxSubPackageStyleEntry,
  ResolvedSubpackageStyleScope,
  SubpackageStyleGenerateContext,
  SubpackageStyleGenerator,
  TaroSubPackageConfig,
  TaroSubPackageStyleEntry,
  UniAppManualStyleConfig,
  UniAppStyleScopeInput,
  UniAppSubPackageConfig,
  UniAppSubPackageStyleEntry,
  WeappStyleInjectorOptions,
} from 'weapp-style-injector'

export type WeappTailwindcssStyleInjectorUserOptions = boolean | WeappTailwindcssStyleInjectorOptions

export interface WeappTailwindcssStyleInjectorOptions extends WeappStyleInjectorOptions {
  /**
   * uni-app 的 `pages.json` 路径。未传入时，uni-app 预设会按当前工作目录探测 `src/pages.json` 与 `pages.json`。
   */
  pagesJsonPath?: string | string[] | undefined
  /**
   * Taro 的 `app.config` 路径。未传入时，Taro 预设会按当前工作目录探测常见配置文件。
   */
  appConfigPath?: string | string[] | undefined
  /**
   * Mpx 的 app 配置路径。未传入时，Mpx 预设会按当前工作目录探测 `src/app.mpx`、`app.mpx` 等入口。
   */
  appPath?: string | string[] | undefined
  /**
   * Mpx 源码根目录。
   */
  sourceRoot?: string | undefined
  /**
   * 框架分包样式配置。
   */
  subPackages?: UniAppSubPackageConfig | UniAppSubPackageConfig[] | TaroSubPackageConfig | TaroSubPackageConfig[] | MpxSubPackageConfig | MpxSubPackageConfig[] | undefined
  /**
   * uni-app 通用分包配置。
   */
  uniAppSubPackages?: UniAppSubPackageConfig | UniAppSubPackageConfig[] | undefined
  /**
   * uni-app 手动样式作用域配置。
   */
  uniAppStyleScopes?: UniAppManualStyleConfig | UniAppManualStyleConfig[] | undefined
  /**
   * 已解析的分包样式作用域。通常只在需要完全接管预设解析时使用。
   */
  subpackageStyleScopes?: ResolvedSubpackageStyleScope[] | undefined
  /**
   * 生成分包样式入口内容。
   */
  generateSubpackageStyle?: SubpackageStyleGenerator | ((context: SubpackageStyleGenerateContext) => string | Uint8Array | null | undefined | Promise<string | Uint8Array | null | undefined>) | undefined
  /**
   * 加载由源码模块推导出的目标样式内容。Webpack 场景必须同步返回。
   */
  loadSubpackageTargetStyle?: ((fileName: string, sourceAbsolutePath: string) => string | Uint8Array | null | undefined | Promise<string | Uint8Array | null | undefined>) | undefined
  /**
   * 分包样式源文件名。
   */
  sourceFileName?: string | string[] | undefined
  /**
   * 分包样式输出名。
   */
  outputName?: string | undefined
  /**
   * 限定需要注入分包入口的目标文件。
   */
  files?: string | string[] | undefined
  /**
   * 分包目标文件 include 规则。
   *
   * @remarks 推荐写在 `styleEntries` 内，仅对对应样式入口生效。本字段保留用于兼容旧配置。
   */
  include?: WeappStyleInjectorOptions['include']
  /**
   * 分包目标文件 exclude 规则。
   *
   * @remarks 推荐写在 `styleEntries` 内，仅对对应样式入口生效。本字段保留用于兼容旧配置。
   */
  exclude?: WeappStyleInjectorOptions['exclude']
  /**
   * uni-app 旧版分包入口文件名配置。
   *
   * @deprecated 请使用 `sourceFileName`。
   */
  indexFileName?: string | string[] | undefined
  /**
   * Taro 旧版分包入口文件名配置。
   *
   * @deprecated 请使用 `sourceFileName`。
   */
  indexFileNames?: string | string[] | undefined
  /**
   * uni-app 样式作用域配置。
   */
  styleScopes?: UniAppStyleScopeInput | UniAppStyleScopeInput[] | undefined
  /**
   * 框架分包样式入口配置。
   *
   * @remarks 只写 `include` / `exclude` / `files` 时，会默认向匹配分包样式注入主包样式引用。
   */
  styleEntries?: UniAppSubPackageStyleEntry | UniAppSubPackageStyleEntry[] | TaroSubPackageStyleEntry | TaroSubPackageStyleEntry[] | MpxSubPackageStyleEntry | MpxSubPackageStyleEntry[] | undefined
  /**
   * 生成分包入口前是否走框架预处理。
   */
  preprocess?: boolean | undefined
}

export function normalizeStyleInjectorOptions(
  options: WeappTailwindcssStyleInjectorUserOptions | undefined,
): WeappTailwindcssStyleInjectorOptions | undefined {
  if (options === true) {
    return {}
  }
  if (!options) {
    return undefined
  }
  return options
}
