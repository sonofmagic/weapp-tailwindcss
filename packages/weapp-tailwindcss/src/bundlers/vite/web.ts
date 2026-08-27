import type { WeappTailwindcssVitePlugin } from './shared/create-framework-plugins'
import type { UserDefinedOptions } from '@/types'
import { vitePluginName } from '@/constants'
import { createGenericWebViteCapabilityProfile } from './capability-profile'
import { createGenericVitePlugins } from './frameworks/generic'

/**
 * Generic Web 专用 Vite 入口配置。
 */
export interface WeappTailwindcssWebOptions extends Omit<UserDefinedOptions, 'appType' | 'generator'> {
  /**
   * 与官方 Tailwind Vite 插件兼容的优化开关。
   *
   * Vite 负责最终 CSS 压缩；传入 false 或 `{ minify: false }` 时会显式关闭
   * Vite 的 CSS 压缩，保持可读的生成结果。
   */
  optimize?: boolean | { minify?: boolean | undefined } | undefined
}

function resolveCssMinifyOption(optimize: WeappTailwindcssWebOptions['optimize']) {
  if (optimize === false) {
    return false
  }
  if (optimize && typeof optimize === 'object' && optimize.minify === false) {
    return false
  }
  return undefined
}

/**
 * 创建固定为 Generic Web 目标的轻量 Vite 插件组。
 *
 * 该入口不读取当前工作目录来判断框架，也不依赖平台环境变量；显式的
 * Web 配置由入口本身注入，适合标准 Vite Web/SSR 项目。
 */
export function WeappTailwindcssWeb(
  options: WeappTailwindcssWebOptions = {},
): WeappTailwindcssVitePlugin[] | undefined {
  const { optimize, ...userOptions } = options
  const plugins = createGenericVitePlugins({
    ...userOptions,
    appType: 'native',
    generator: {
      target: 'web',
    },
    __internalViteCapabilityProfile: createGenericWebViteCapabilityProfile(userOptions),
  } as any)
  if (!plugins) {
    return plugins
  }

  const cssMinify = resolveCssMinifyOption(optimize)
  if (cssMinify === undefined) {
    return plugins
  }

  plugins.push({
    name: `${vitePluginName}:generic-web-optimize`,
    config() {
      return {
        build: {
          cssMinify,
        },
      }
    },
  })
  return plugins
}

/** {@link WeappTailwindcssWeb} 的小写别名。 */
export const weappTailwindcssWeb = WeappTailwindcssWeb

export default WeappTailwindcssWeb
