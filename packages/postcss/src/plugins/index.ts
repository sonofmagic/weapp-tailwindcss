import type { AcceptedPlugin } from 'postcss'
import type { PxtransformOptions } from 'postcss-pxtransform'
import type { IStyleHandlerOptions } from '../types'
import postcssCalc from '@weapp-tailwindcss/postcss-calc'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import postcssPresetEnv from 'postcss-preset-env'
import postcssPxtransform from 'postcss-pxtransform'
import postcssRem2rpx from 'postcss-rem-to-responsive-pixel'
import { createContext } from './ctx'
import { postcssWeappTailwindcssPostPlugin as post } from './post'
import { postcssWeappTailwindcssPrePlugin as pre } from './pre'

/**
 * 根据提供的选项生成一组 PostCSS 插件。
 * @param options - 样式处理器选项，包含 PostCSS 插件和其他配置。
 * @returns AcceptedPlugin[] - 生成的 PostCSS 插件数组。
 */
export function getPlugins(options: IStyleHandlerOptions): AcceptedPlugin[] {
  const ctx = createContext()
  options.ctx = ctx
  const plugins = [
    ...(options.postcssOptions?.plugins ?? []),
    pre(options),
  ].filter(x => Boolean(x)) as AcceptedPlugin[]

  plugins.push(
    postcssPresetEnv(
      options.cssPresetEnv!,
    ),
  )

  if (options.px2rpx) {
    plugins.push(
      postcssPxtransform(
        defuOverrideArray<PxtransformOptions, PxtransformOptions[]>(
          typeof options.px2rpx === 'object'
            ? options.px2rpx
            : {},
          {
            platform: 'weapp',
            unitPrecision: 5,
            propList: ['*'],
            selectorBlackList: [],
            replace: true,
            mediaQuery: false,
            minPixelValue: 0,
            designWidth: 750,
            deviceRatio: {
              375: 2,
              640: 2.34 / 2,
              750: 1,
              828: 1.81 / 2,
            },
          },
        ),

      ),
    )
  }

  if (options.rem2rpx) {
    plugins.push(
      postcssRem2rpx(
        typeof options.rem2rpx === 'object'
          ? options.rem2rpx
          : {
              rootValue: 32,
              propList: ['*'],
              transformUnit: 'rpx',
            },
      ),
    )
  }

  if (options.cssCalc) {
    plugins.push(
      // 核心在 OnceExit 的时候去执行的
      postcssCalc(
        typeof options.cssCalc === 'object' ? options.cssCalc : {},
      ),
    )
  }

  plugins.push(post(options))
  return plugins
}

export { postcssWeappTailwindcssPostPlugin } from './post'
export { postcssWeappTailwindcssPrePlugin } from './pre'

export { default as postcssIsPseudoClass } from '@csstools/postcss-is-pseudo-class'
export { default as postcssRem2rpx } from 'postcss-rem-to-responsive-pixel'
