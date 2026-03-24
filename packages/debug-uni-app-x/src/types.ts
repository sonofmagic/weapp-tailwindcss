/**
 * 调试插件支持的构建阶段。
 */
export type DebugStage = 'pre' | 'normal' | 'post'

/**
 * 模块匹配规则。
 *
 * - `string`：按子串包含匹配。
 * - `RegExp`：按正则匹配。
 * - `function`：按自定义逻辑匹配。
 */
export type MatchRule = string | RegExp | ((id: string) => boolean)

/**
 * 调试输出的来源类型。
 */
export type DebugWriteType = 'transform' | 'bundle'

/**
 * 单个调试产物的索引信息。
 */
export interface DebugMetaEntry {
  file: string
  id: string
  stage: DebugStage
  type: DebugWriteType
}

/**
 * 调试根目录 `_manifest.json` 的结构。
 */
export interface DebugManifest {
  'pre': DebugMetaEntry[]
  'normal': DebugMetaEntry[]
  'post': DebugMetaEntry[]
  'bundle-pre': DebugMetaEntry[]
  'bundle-normal': DebugMetaEntry[]
  'bundle-post': DebugMetaEntry[]
}

/**
 * 写盘失败时的上下文信息。
 */
export interface DebugErrorContext {
  stage: DebugStage
  type: DebugWriteType
  id: string
}

/**
 * `debugX` 的配置项。
 */
export interface DebugOptions {
  /**
   * 调试产物输出时使用的基准目录。
   *
   * 默认值为 `process.cwd()`。
   */
  cwd?: string
  /**
   * 是否输出 bundle keys 的控制台日志。
   *
   * 默认读取环境变量 `DEBUG_UNI_APP_X_LOG`。
   */
  log?: boolean
  /**
   * 是否启用调试插件。
   *
   * 默认值为 `true`。
   */
  enabled?: boolean
  /**
   * 调试产物输出目录名。
   *
   * 默认值为 `.debug`。
   */
  targetDir?: string
  /**
   * 需要启用的调试阶段。
   *
   * 默认启用 `pre`、`normal`、`post` 三个阶段。
   */
  stages?: DebugStage[]
  /**
   * 需要保留的模块匹配规则。
   *
   * 传入后，仅命中的模块会被写入调试目录。
   */
  include?: MatchRule | MatchRule[]
  /**
   * 需要排除的模块匹配规则。
   */
  exclude?: MatchRule | MatchRule[]
  /**
   * 需要跳过的目标平台。
   *
   * 默认不跳过任何平台。
   */
  skipPlatforms?: string[]
  /**
   * 写盘失败时的回调。
   *
   * 插件本身不会因为写盘失败而中断构建。
   */
  onError?: (error: unknown, context: DebugErrorContext) => void
}
