import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { WeappTailwindcssGeneratorTarget } from './types'
import type { RuntimeBranch, RuntimeBranchContext } from '@/runtime-branch'
import type { IArbitraryValues } from '@/types/shared'
import { resolveRuntimeBranch } from '@/runtime-branch'
import { inferGeneratorTargetFromEnv } from '@/runtime-branch/generator-target-env'

export interface WeappTailwindcssGeneratorOptions {
  /**
   * 生成目标。小程序构建默认使用 `weapp`，H5/Web 与普通 uni-app App WebView 默认使用 `web`。
   *
   * @remarks
   * `target` 表示 CSS 输出形态，不是平台枚举。uni-app x Android/iOS 这类原生 App 目标继续使用 `weapp` 输出族，
   * 并通过 `uniAppX`、`platform` 与单位转换配置处理 App 差异。
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
  /**
   * 是否启用 UnoCSS 风格裸任意值。通常由顶层 `unocss` / `arbitraryValues` 配置注入。
   *
   * @internal
   */
  bareArbitraryValues?: IArbitraryValues['bareArbitraryValues'] | undefined
}

export type WeappTailwindcssGeneratorUserOptions = WeappTailwindcssGeneratorOptions

export interface NormalizedWeappTailwindcssGeneratorOptions {
  target: WeappTailwindcssGeneratorTarget
  branch: RuntimeBranch
  config?: string | undefined
  styleOptions?: Partial<IStyleHandlerOptions> | undefined
  importFallback: boolean
  tailwindcssV3Compatibility: boolean
  bareArbitraryValues?: IArbitraryValues['bareArbitraryValues'] | undefined
}

export function normalizeWeappTailwindcssGeneratorOptions(
  options: WeappTailwindcssGeneratorUserOptions | undefined,
  context: Omit<RuntimeBranchContext, 'generatorTarget'> = {},
): NormalizedWeappTailwindcssGeneratorOptions {
  const target = options?.target ?? inferGeneratorTargetFromEnv()
  const branch = resolveRuntimeBranch({
    ...context,
    generatorTarget: target,
  })

  if (options == null) {
    return {
      target,
      branch,
      importFallback: true,
      tailwindcssV3Compatibility: branch.platformFamily !== 'web' && branch.platformFamily !== 'tailwind',
      bareArbitraryValues: undefined,
    }
  }

  return {
    target,
    branch,
    config: options.config,
    styleOptions: options.styleOptions,
    importFallback: options.importFallback ?? true,
    tailwindcssV3Compatibility: options.tailwindcssV3Compatibility ?? (branch.platformFamily !== 'web' && branch.platformFamily !== 'tailwind'),
    bareArbitraryValues: options.bareArbitraryValues,
  }
}
