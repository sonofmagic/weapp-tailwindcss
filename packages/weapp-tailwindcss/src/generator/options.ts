import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { WeappTailwindcssGeneratorTarget } from './types'

export type WeappTailwindcssGeneratorMode = 'auto' | 'force' | 'off'

export interface WeappTailwindcssGeneratorOptions {
  /**
   * 控制 Tailwind CSS v4 直接生成 CSS 的启用策略。
   *
   * - `auto`：默认，仅在可安全识别 Tailwind v4 主 CSS 时启用，失败后回退到旧的 CSS 后处理链路。
   * - `force`：强制使用生成器，无法生成时直接抛错。
   * - `off`：关闭生成器，完全使用旧的 CSS 后处理链路。
   */
  mode?: WeappTailwindcssGeneratorMode
  /**
   * 生成目标。小程序构建默认使用 `weapp`，保留 `web` 与 `tailwind` 便于多端/调试复用。
   */
  target?: WeappTailwindcssGeneratorTarget
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

export type WeappTailwindcssGeneratorUserOptions = boolean | WeappTailwindcssGeneratorOptions

export interface NormalizedWeappTailwindcssGeneratorOptions {
  mode: WeappTailwindcssGeneratorMode
  target: WeappTailwindcssGeneratorTarget
  styleOptions?: Partial<IStyleHandlerOptions>
  tailwindcssV3Compatibility: boolean
}

export function normalizeWeappTailwindcssGeneratorOptions(
  options: WeappTailwindcssGeneratorUserOptions | undefined,
): NormalizedWeappTailwindcssGeneratorOptions {
  if (options === false) {
    return {
      mode: 'off',
      target: 'weapp',
      tailwindcssV3Compatibility: true,
    }
  }

  if (options === true || options == null) {
    return {
      mode: 'auto',
      target: 'weapp',
      tailwindcssV3Compatibility: true,
    }
  }

  return {
    mode: options.mode ?? 'auto',
    target: options.target ?? 'weapp',
    styleOptions: options.styleOptions,
    tailwindcssV3Compatibility: options.tailwindcssV3Compatibility ?? (options.target ?? 'weapp') === 'weapp',
  }
}
