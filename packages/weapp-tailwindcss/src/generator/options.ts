import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { WeappTailwindcssGeneratorTarget } from './types'

export interface WeappTailwindcssGeneratorOptions {
  /**
   * 生成目标。小程序构建默认使用 `weapp`，保留 `web` 与 `tailwind` 便于多端/调试复用。
   */
  target?: WeappTailwindcssGeneratorTarget | undefined
  /**
   * Tailwind 配置文件路径，兼容原 Tailwind PostCSS 插件的 `config` 选项。
   */
  config?: string | undefined
  /**
   * 传给小程序 CSS 兼容转换器的额外配置。
   */
  styleOptions?: Partial<IStyleHandlerOptions> | undefined
  /**
   * 将 `@import "weapp-tailwindcss"` 作为 Tailwind CSS v4 生成入口的兜底别名。
   *
   * 适用于框架无法把 `@import "tailwindcss"` 改写到 `weapp-tailwindcss` 包入口的场景，默认开启。
   */
  importFallback?: boolean | undefined
  /**
   * Tailwind CSS v4 小程序生成模式默认注入 v3 默认值兼容层，保持升级前的视觉行为。
   *
   * 设为 `false` 时，完全使用 Tailwind CSS v4 原生默认值。
   */
  tailwindcssV3Compatibility?: boolean | undefined
}

export type WeappTailwindcssGeneratorUserOptions = WeappTailwindcssGeneratorOptions

export interface NormalizedWeappTailwindcssGeneratorOptions {
  target: WeappTailwindcssGeneratorTarget
  config?: string | undefined
  styleOptions?: Partial<IStyleHandlerOptions> | undefined
  importFallback: boolean
  tailwindcssV3Compatibility: boolean
}

export function normalizeWeappTailwindcssGeneratorOptions(
  options: WeappTailwindcssGeneratorUserOptions | undefined,
): NormalizedWeappTailwindcssGeneratorOptions {
  if (options == null) {
    return {
      target: 'weapp',
      importFallback: true,
      tailwindcssV3Compatibility: true,
    }
  }

  return {
    target: options.target ?? 'weapp',
    config: options.config,
    styleOptions: options.styleOptions,
    importFallback: options.importFallback ?? true,
    tailwindcssV3Compatibility: options.tailwindcssV3Compatibility ?? (options.target ?? 'weapp') === 'weapp',
  }
}
