import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { Config } from 'tailwindcss'

export type TailwindV3GenerateTarget = 'weapp' | 'web' | 'tailwind'

/**
 * Tailwind CSS v3 生成器的内联候选来源。
 */
export interface TailwindV3CandidateSource {
  /**
   * 待扫描的源码内容。
   */
  content: string
  /**
   * 内容对应的文件扩展名，用于辅助 Tailwind 判断解析方式。
   */
  extension?: string | undefined
}

/**
 * Tailwind CSS v3 解析出的文件扫描规则。
 */
export interface TailwindV3SourcePattern {
  /**
   * glob 规则的基准目录。
   */
  base: string
  /**
   * glob 匹配规则。
   */
  pattern: string
  /**
   * 是否为排除规则。
   */
  negated: boolean
}

/**
 * Tailwind CSS v3 source 解析配置。
 */
export interface TailwindV3SourceOptions {
  /**
   * 项目根目录。
   */
  projectRoot?: string | undefined
  /**
   * 解析 Tailwind 配置相对路径时使用的工作目录。
   */
  cwd?: string | undefined
  /**
   * 解析 CSS 与 content 来源时使用的基准目录。
   */
  base?: string | undefined
  /**
   * Tailwind v3 入口 CSS 内容。
   */
  css?: string | undefined
  /**
   * Tailwind 配置文件路径。
   */
  config?: string | undefined
  /**
   * Tailwind 包名。使用分支包时可自定义。
   */
  packageName?: string | undefined
  /**
   * Tailwind PostCSS 插件名称。
   */
  postcssPlugin?: string | undefined
}

/**
 * Tailwind CSS v3 source 解析后的稳定结果。
 */
export interface TailwindV3ResolvedSource {
  /**
   * Tailwind 主版本。
   */
  version: 3
  /**
   * 项目根目录。
   */
  projectRoot: string
  /**
   * 工作目录。
   */
  cwd: string
  /**
   * source 基准目录。
   */
  base: string
  /**
   * Tailwind 入口 CSS。
   */
  css: string
  /**
   * Tailwind 配置文件路径。
   */
  config?: string | undefined
  /**
   * 已加载的 Tailwind 配置对象。
   */
  configObject?: Config | undefined
  /**
   * 生成过程依赖的文件列表。
   */
  dependencies: string[]
  /**
   * Tailwind 包名。
   */
  packageName: string
  /**
   * Tailwind PostCSS 插件名称。
   */
  postcssPlugin: string
}

/**
 * Tailwind CSS v3 生成配置。
 */
export interface TailwindV3GenerateOptions {
  /**
   * 需要生成的候选 class。
   */
  candidates?: Iterable<string> | undefined
  /**
   * 额外的内联候选来源。
   */
  sources?: TailwindV3CandidateSource[] | undefined
  /**
   * 是否启用增量生成缓存。
   */
  incrementalCache?: boolean | undefined
  /**
   * 生成目标。
   */
  target?: TailwindV3GenerateTarget | undefined
  /**
   * 传给小程序 CSS 兼容转换器的额外配置。
   */
  styleOptions?: Partial<IStyleHandlerOptions> | undefined
}

/**
 * Tailwind CSS v3 生成结果。
 */
export interface TailwindV3GenerateResult {
  /**
   * 转换后的 CSS。
   */
  css: string
  /**
   * Tailwind 原始输出 CSS。
   */
  rawCss: string
  /**
   * 本次增量新增的转换后 CSS。
   */
  incrementalCss?: string | undefined
  /**
   * 本次增量新增的 Tailwind 原始 CSS。
   */
  incrementalRawCss?: string | undefined
  /**
   * 成功生成的 class 集合。
   */
  classSet: Set<string>
  /**
   * 输入侧的原始候选 class 集合。
   */
  rawCandidates: Set<string>
  /**
   * 生成依赖的文件列表。
   */
  dependencies: string[]
  /**
   * Tailwind 配置解析出的扫描规则。
   */
  sources: TailwindV3SourcePattern[]
  /**
   * v3 生成器没有编译后的 source root，固定为 `null`。
   */
  root: null
  /**
   * 实际生成目标。
   */
  target: TailwindV3GenerateTarget
  /**
   * Tailwind 主版本。
   */
  version: 3
}

/**
 * Tailwind CSS v3 生成引擎。
 */
export interface TailwindV3Engine {
  /**
   * 解析后的 Tailwind v3 source。
   */
  source: TailwindV3ResolvedSource
  /**
   * 校验候选 class，并返回 Tailwind 能识别的集合。
   */
  validateCandidates: (candidates: Iterable<string>) => Promise<Set<string>>
  /**
   * 生成 CSS。
   */
  generate: (options?: TailwindV3GenerateOptions) => Promise<TailwindV3GenerateResult>
}
