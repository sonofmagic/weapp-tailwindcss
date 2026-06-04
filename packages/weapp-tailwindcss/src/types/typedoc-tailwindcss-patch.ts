import type { SourceEntry } from '@tailwindcss/oxide'
import type { PackageResolvingOptions } from 'local-pkg'
import type { ILengthUnitsPatchOptions } from 'tailwindcss-patch'
import type { TailwindV4CssSource } from '../tailwindcss/v4-engine'

export type CacheStrategy = 'merge' | 'overwrite'
export type CacheDriver = 'file' | 'memory' | 'noop'

/**
 * Tailwind 类名缓存配置。
 */
export interface CacheOptions {
  /**
   * 是否启用缓存。
   */
  enabled?: boolean
  /**
   * 解析缓存路径时使用的工作目录。
   */
  cwd?: string
  /**
   * 缓存文件写入目录。
   */
  dir?: string
  /**
   * 缓存文件名。未传入时，会在推导出的缓存目录下使用 `class-cache.json`。
   */
  file?: string
  /**
   * 新类名列表与已有缓存合并时使用的策略。
   */
  strategy?: CacheStrategy
  /**
   * 缓存持久化方式。默认使用 `file`。
   */
  driver?: CacheDriver
}

/**
 * 类名提取结果的输出配置。
 */
export interface ExtractOptions {
  /**
   * 是否写出提取结果文件。
   */
  write?: boolean
  /**
   * 输出文件路径，可传绝对路径或相对路径。
   */
  file?: string
  /**
   * 输出格式。未传入时使用 JSON。
   */
  format?: 'json' | 'lines'
  /**
   * JSON 格式化缩进。传入可判定为真的值会启用缩进。
   */
  pretty?: number | boolean
  /**
   * 是否从最终列表中移除通配选择器 `*`。
   */
  removeUniversalSelector?: boolean
}

/**
 * 控制运行时 Tailwind context 暴露方式。
 */
export interface ExposeContextOptions {
  /**
   * 暴露 context 时使用的属性名。
   */
  refProperty?: string
}

/**
 * 扩展内置长度单位补丁的默认值。
 */
export interface ExtendLengthUnitsOptions extends Partial<ILengthUnitsPatchOptions> {
  /**
   * 是否启用长度单位补丁。
   */
  enabled?: boolean
}

/**
 * Tailwind 运行时补丁行为配置。
 */
export interface ApplyOptions {
  /**
   * 是否允许覆盖磁盘上已经打过补丁的文件。
   */
  overwrite?: boolean
  /**
   * 是否暴露运行时 Tailwind context，或配置具体暴露方式。
   */
  exposeContext?: boolean | ExposeContextOptions
  /**
   * 扩展长度单位补丁，传入 `false` 可完全关闭。
   */
  extendLengthUnits?: false | ExtendLengthUnitsOptions
}

export interface TailwindRuntimeOptionsBase {
  /**
   * Tailwind 配置文件路径。自动识别不够准确时可以显式传入。
   */
  config?: string
  /**
   * 解析 Tailwind 配置相对路径时使用的工作目录。
   */
  cwd?: string
  /**
   * 自定义 PostCSS 插件名称。未传入时使用默认名称。
   */
  postcssPlugin?: string
}

/**
 * Tailwind CSS v2 补丁配置。
 */
export interface TailwindV2Options extends TailwindRuntimeOptionsBase {}

/**
 * Tailwind CSS v3 补丁配置。
 */
export interface TailwindV3Options extends TailwindRuntimeOptionsBase {}

/**
 * Tailwind CSS v4 提取配置。
 */
export interface TailwindV4Options {
  /**
   * 解析 v4 内容来源与配置时使用的基准目录。
   */
  base?: string
  /**
   * 直接传给 v4 设计系统的原始 CSS。
   */
  css?: string
  /**
   * 构建器在 CSS 落盘前捕获的内存 CSS 入口。
   */
  cssSources?: TailwindV4CssSource[]
  /**
   * 需要扫描 `@config` 指令的 CSS 入口文件。
   */
  cssEntries?: string[]
  /**
   * 覆盖 oxide 扫描器默认扫描的内容来源。
   */
  sources?: SourceEntry[]
  /**
   * 是否启用 UnoCSS 风格的裸任意值，例如 `p-10%`、`p-2.5px`。
   */
  bareArbitraryValues?: boolean | {
    /**
     * 识别裸任意值时允许的单位列表。
     */
    units?: string[]
  } | undefined
}

/**
 * 按 Tailwind 版本划分的补丁配置。
 */
export interface TailwindCssOptions extends TailwindRuntimeOptionsBase {
  /**
   * 当前项目使用的 Tailwind CSS 主版本。未传入时会从已安装包推断。
   */
  version?: 2 | 3 | 4
  /**
   * Tailwind 包名。项目使用分支包时可以改这里。
   */
  packageName?: string
  /**
   * 传给 `local-pkg` 的包解析配置。
   */
  resolve?: PackageResolvingOptions
  /**
   * Tailwind CSS v2 补丁选项。
   */
  v2?: TailwindV2Options
  /**
   * Tailwind CSS v3 补丁选项。
   */
  v3?: TailwindV3Options
  /**
   * Tailwind CSS v4 补丁选项。
   */
  v4?: TailwindV4Options
}

/**
 * Tailwind CSS 补丁运行器的根配置。
 */
export interface TailwindCssPatchOptions {
  /**
   * 解析 Tailwind 资源时使用的项目根目录。默认是 `process.cwd()`。
   */
  projectRoot?: string
  /**
   * Tailwind 运行时配置。
   */
  tailwindcss?: TailwindCssOptions
  /**
   * 补丁行为开关。
   */
  apply?: ApplyOptions
  /**
   * 类名提取结果输出配置。
   */
  extract?: ExtractOptions
  /**
   * 过滤最终类名的函数。
   */
  filter?: (className: string) => boolean
  /**
   * 缓存配置。传入布尔值可快速启用或关闭。
   */
  cache?: boolean | CacheOptions
}
