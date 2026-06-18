import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { WeappTailwindcssGeneratorTarget } from '@/runtime-branch'
import type {
  TailwindV3CandidateSource,
  TailwindV3Engine,
  TailwindV3GenerateOptions,
  TailwindV3GenerateResult,
  TailwindV3GenerateTarget,
  TailwindV3ResolvedSource,
  TailwindV3SourceOptions,
} from '@/tailwindcss/v3-engine'
import type {
  TailwindV4CandidateSource,
  TailwindV4DesignSystem,
  TailwindV4Engine,
  TailwindV4GenerateOptions,
  TailwindV4GenerateResult,
  TailwindV4GenerateTarget,
  TailwindV4ResolvedSource,
  TailwindV4SourceOptions,
} from '@/tailwindcss/v4-engine'

export type { WeappTailwindcssGeneratorTarget }
export type TailwindGeneratorVersion = 3 | 4
export type TailwindCandidateSource = TailwindV3CandidateSource | TailwindV4CandidateSource
export type TailwindResolvedSource = TailwindV3ResolvedSource | TailwindV4ResolvedSource

/**
 * weapp-tailwindcss 生成器的调用配置。
 */
export interface WeappTailwindcssGenerateOptions extends Omit<TailwindV3GenerateOptions & TailwindV4GenerateOptions, 'target'> {
  /**
   * 生成目标。`weapp` 输出小程序兼容 CSS，`web` 保留 Web 形态，`tailwind` 返回 Tailwind 原始输出。
   */
  target?: WeappTailwindcssGeneratorTarget | undefined
  /**
   * 传给小程序 CSS 兼容转换器的额外配置。
   */
  styleOptions?: Partial<IStyleHandlerOptions> | undefined
  /**
   * Tailwind CSS v4 小程序生成模式是否注入 v3 默认值兼容层。
   */
  tailwindcssV3Compatibility?: boolean | undefined
}

/**
 * weapp-tailwindcss 生成器的输出结果。
 */
export type WeappTailwindcssGenerateResult = (TailwindV3GenerateResult | TailwindV4GenerateResult) & {
  /**
   * 实际生成目标。
   */
  target: WeappTailwindcssGeneratorTarget
  /**
   * Tailwind 原始输出 CSS。
   */
  rawCss: string
}

/**
 * weapp-tailwindcss 统一生成器实例。
 */
export interface WeappTailwindcssGenerator extends Omit<TailwindV3Engine | TailwindV4Engine, 'generate'> {
  /**
   * 生成目标 CSS。
   */
  generate: (options?: WeappTailwindcssGenerateOptions) => Promise<WeappTailwindcssGenerateResult>
}

export type {
  TailwindV3CandidateSource,
  TailwindV3Engine,
  TailwindV3GenerateOptions,
  TailwindV3GenerateResult,
  TailwindV3GenerateTarget,
  TailwindV3ResolvedSource,
  TailwindV3SourceOptions,
  TailwindV4CandidateSource,
  TailwindV4DesignSystem,
  TailwindV4Engine,
  TailwindV4GenerateOptions,
  TailwindV4GenerateResult,
  TailwindV4GenerateTarget,
  TailwindV4ResolvedSource,
  TailwindV4SourceOptions,
}
