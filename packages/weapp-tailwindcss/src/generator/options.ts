import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { WeappTailwindcssGeneratorTarget } from './types'

export interface WeappTailwindcssGeneratorOptions {
  /**
   * 生成目标。小程序构建默认使用 `weapp`，保留 `web` 与 `tailwind` 便于多端/调试复用。
   */
  target?: WeappTailwindcssGeneratorTarget
  /**
   * Tailwind 配置文件路径，兼容原 Tailwind PostCSS 插件的 `config` 选项。
   */
  config?: string
  /**
   * 传给小程序 CSS 兼容转换器的额外配置。
   */
  styleOptions?: Partial<IStyleHandlerOptions>
  /**
   * Tailwind CSS v4 小程序生成模式默认注入 v3 默认值兼容层，保持升级前的视觉行为。
   *
   * 设为 `false` 时，完全使用 Tailwind CSS v4 原生默认值。
   */
  tailwindcssV3Compatibility?: boolean
}

export type WeappTailwindcssGeneratorUserOptions = WeappTailwindcssGeneratorOptions

export interface NormalizedWeappTailwindcssGeneratorOptions {
  target: WeappTailwindcssGeneratorTarget
  config?: string
  styleOptions?: Partial<IStyleHandlerOptions>
  tailwindcssV3Compatibility: boolean
}

export function normalizeWeappTailwindcssGeneratorOptions(
  options: WeappTailwindcssGeneratorUserOptions | undefined,
): NormalizedWeappTailwindcssGeneratorOptions {
  if (options == null) {
    return {
      target: 'weapp',
      tailwindcssV3Compatibility: true,
    }
  }

  return {
    target: options.target ?? 'weapp',
    config: options.config,
    styleOptions: options.styleOptions,
    tailwindcssV3Compatibility: options.tailwindcssV3Compatibility ?? (options.target ?? 'weapp') === 'weapp',
  }
}
