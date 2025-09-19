import type { AcceptedPlugin, Declaration } from 'postcss'
import type { PxtransformOptions } from 'postcss-pxtransform'
import type { UserDefinedOptions as Rem2rpxOptions } from 'postcss-rem-to-responsive-pixel'
import type { IStyleHandlerOptions } from '../types'
import postcssCalc from '@weapp-tailwindcss/postcss-calc'
import { defuOverrideArray, regExpTest } from '@weapp-tailwindcss/shared'
import { omit } from 'es-toolkit'
import postcssPresetEnv from 'postcss-preset-env'
import postcssPxtransform from 'postcss-pxtransform'
import postcssRem2rpx from 'postcss-rem-to-responsive-pixel'
import valueParser from 'postcss-value-parser'
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
    // https://preset-env.cssdb.org/
    // https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env#readme
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
        defuOverrideArray<Rem2rpxOptions, Rem2rpxOptions[]>(
          typeof options.rem2rpx === 'object'
            ? options.rem2rpx
            : {
                rootValue: 32,
                propList: ['*'],
                transformUnit: 'rpx',
              },
          {
            processorStage: 'OnceExit',
          },
        ),

      ),
    )
  }
  const includeCustomProperties = Array.isArray(options.cssCalc)
    ? options.cssCalc
    : typeof options.cssCalc === 'object'
      ? options.cssCalc.includeCustomProperties
      : []
  if (options.cssCalc) {
    plugins.push(
      // 核心在 OnceExit 的时候去执行的
      postcssCalc(
        Array.isArray(options.cssCalc)
          ? {}
          : typeof options.cssCalc === 'object'
            ? omit(options.cssCalc, ['includeCustomProperties'])
            : {},
      ),
    )
  }

  plugins.push(post(options))

  if (includeCustomProperties) {
    plugins.push({
      postcssPlugin: 'postcss-remove-include-custom-properties',
      OnceExit(root) {
        root.walkDecls((decl, idx) => {
          // not first
          if (idx > 0) {
            // decl.remove()
            const prevNode = decl.parent?.nodes[idx - 1] as Declaration | undefined
            // 前一个属性等于这一个属性
            if (prevNode && prevNode.prop === decl.prop) {
              const parsed = valueParser(decl.value)
              parsed.walk((node) => {
                if (node.type === 'function' && node.value === 'var') {
                  const item = node.nodes.find((x) => {
                    return x.type === 'word' && regExpTest(includeCustomProperties, x.value)
                  })
                  if (item) {
                    decl.remove()
                  }
                }
              })
            }
          }
        })
      },
    })
  }

  return plugins
}

export { postcssWeappTailwindcssPostPlugin } from './post'
export { postcssWeappTailwindcssPrePlugin } from './pre'

export { default as postcssRem2rpx } from 'postcss-rem-to-responsive-pixel'
