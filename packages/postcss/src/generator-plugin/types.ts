import type { IStyleHandlerOptions } from '../types'

export type WeappTailwindcssPostcssTarget = 'weapp' | 'web' | 'tailwind'
export type WeappTailwindcssPostcssTailwindVersion = 3 | 4

export interface TailwindCandidateSource {
  content: string
  extension?: string | undefined
}

export interface WeappTailwindcssPostcssGenerateOptions {
  candidates?: Iterable<string> | undefined
  scanSources?: boolean | undefined
  sources?: TailwindCandidateSource[] | undefined
  styleOptions?: Partial<IStyleHandlerOptions> | undefined
  tailwindcssV3Compatibility?: boolean | undefined
  target?: WeappTailwindcssPostcssTarget | undefined
}

export interface WeappTailwindcssPostcssGenerateResult {
  css: string
  rawCss: string
  target: WeappTailwindcssPostcssTarget
  classSet: Set<string>
  dependencies: string[]
}

export interface WeappTailwindcssPostcssGenerator {
  generate: (options?: WeappTailwindcssPostcssGenerateOptions) => Promise<WeappTailwindcssPostcssGenerateResult>
}

export interface TailwindV3SourceOptions {
  projectRoot?: string | undefined
  cwd?: string | undefined
  base?: string | undefined
  css?: string | undefined
  config?: string | undefined
  packageName?: string | undefined
  postcssPlugin?: string | undefined
}

export interface TailwindV4SourceOptions {
  projectRoot?: string | undefined
  base?: string | undefined
  css?: string | undefined
  packageName?: string | undefined
}

export type TailwindResolvedSource = unknown

export interface WeappTailwindcssPostcssGeneratorUserOptions {
  target?: WeappTailwindcssPostcssTarget | undefined
  config?: string | undefined
  styleOptions?: Partial<IStyleHandlerOptions> | undefined
  importFallback?: boolean | undefined
  tailwindcssV3Compatibility?: boolean | undefined
  bareArbitraryValues?: unknown
}

export interface NormalizedWeappTailwindcssPostcssGeneratorOptions {
  target: WeappTailwindcssPostcssTarget
  config?: string | undefined
  styleOptions?: Partial<IStyleHandlerOptions> | undefined
  importFallback: boolean
  tailwindcssV3Compatibility: boolean
  bareArbitraryValues?: unknown
}

export interface WeappTailwindcssPostcssPluginAdapters {
  createGenerator: (source: TailwindResolvedSource) => WeappTailwindcssPostcssGenerator
  normalizeGeneratorOptions: (
    options: WeappTailwindcssPostcssGeneratorUserOptions | undefined,
  ) => NormalizedWeappTailwindcssPostcssGeneratorOptions
  resolveTailwindV3Source: (options: TailwindV3SourceOptions) => Promise<TailwindResolvedSource>
  resolveTailwindV4Source: (options: TailwindV4SourceOptions) => Promise<TailwindResolvedSource>
}

/**
 * `weapp-tailwindcss` PostCSS 插件配置。
 */
export interface WeappTailwindcssPostcssPluginOptions extends TailwindV4SourceOptions {
  /**
   * 生成器配置，用于控制目标端、Tailwind 配置路径和 v4 兼容层。
   */
  generator?: WeappTailwindcssPostcssGeneratorUserOptions | undefined
  /**
   * 显式指定 Tailwind CSS 主版本。未传入时会从 CSS 与依赖环境推断。
   */
  version?: WeappTailwindcssPostcssTailwindVersion | undefined
  /**
   * Tailwind 配置文件路径。
   */
  config?: string | undefined
  /**
   * Tailwind PostCSS 插件名称。
   */
  postcssPlugin?: string | undefined
  /**
   * 额外传入的候选类名。
   */
  candidates?: Iterable<string> | undefined
  /**
   * 是否扫描 Tailwind v4 源码入口中的候选类名。
   */
  scanSources?: WeappTailwindcssPostcssGenerateOptions['scanSources']
  /**
   * 额外传入的 Tailwind v4 内联候选来源。
   */
  sources?: TailwindCandidateSource[] | undefined
  /**
   * 传给小程序 CSS 兼容转换器的额外配置。
   */
  styleOptions?: Partial<IStyleHandlerOptions> | undefined
}
