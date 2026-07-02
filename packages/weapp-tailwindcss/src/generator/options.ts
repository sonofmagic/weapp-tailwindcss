import type { IStyleHandlerOptions, WebCssCompatUserOptions } from '@weapp-tailwindcss/postcss/types'
import type { WeappTailwindcssGeneratorTarget } from './types'
import type { RuntimeBranch, RuntimeBranchContext } from '@/runtime-branch'
import type { IArbitraryValues } from '@/types/shared'
import { resolveRuntimeBranch } from '@/runtime-branch'
import { inferGeneratorTargetFromEnv, shouldUseUniAppViteWebViewGeneratorTarget } from '@/runtime-branch/generator-target-env'

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
   * Web 端 Tailwind CSS v4 产物兼容降级配置。
   *
   * @remarks
   * Web 目标在自动推断 `generator.target: 'web'` 时默认开启，显式配置 `target` 时保持用户配置。
   * uni-app H5、Taro H5 等 preset 也会在 Web 环境中显式开启。传入 `true` 等价于
   * `{ preset: 'legacy-web' }`，会移除或降级 `@theme`、`@layer`、`@property`、嵌套规则、
   * `oklch()`、现代颜色函数与相关 `@supports` 包裹，以适配更多 Android/iOS WebView。
   * 如果需要保持 Tailwind CSS 官方 Web 输出，可传入 `false` 或 `{ preset: 'off' }`。
   */
  webCompat?: WebCssCompatUserOptions | undefined
  /**
   * 将 `@import "weapp-tailwindcss"` 作为 Tailwind CSS v4 生成入口的兜底别名。
   *
   * 适用于旧项目仍使用 `@import "weapp-tailwindcss"` 作为入口的兼容场景，默认关闭。
   */
  importFallback?: boolean | undefined
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
  webCompat: WebCssCompatUserOptions | undefined
  importFallback: boolean
  bareArbitraryValues?: IArbitraryValues['bareArbitraryValues'] | undefined
}

export function normalizeWeappTailwindcssGeneratorOptions(
  options: WeappTailwindcssGeneratorUserOptions | undefined,
  context: Omit<RuntimeBranchContext, 'generatorTarget'> = {},
): NormalizedWeappTailwindcssGeneratorOptions {
  const target = options?.target
    ?? (shouldUseUniAppViteWebViewGeneratorTarget(context.appType, context.platform)
      ? 'web'
      : inferGeneratorTargetFromEnv())
  const branch = resolveRuntimeBranch({
    ...context,
    generatorTarget: target,
  })
  const hasExplicitTarget = options !== undefined && Object.hasOwn(options, 'target')
  const webCompat = options?.webCompat ?? (!hasExplicitTarget && branch.isWeb ? true : undefined)

  if (options == null) {
    return {
      target,
      branch,
      webCompat,
      importFallback: false,
      bareArbitraryValues: undefined,
    }
  }

  return {
    target,
    branch,
    config: options.config,
    styleOptions: options.styleOptions,
    webCompat,
    importFallback: options.importFallback ?? false,
    bareArbitraryValues: options.bareArbitraryValues,
  }
}
