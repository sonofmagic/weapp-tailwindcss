import type { AcceptedPlugin } from 'postcss'
import type { IStyleHandlerOptions } from '../../types'
// @ts-ignore
import postcssIsPseudoClass from '@csstools/postcss-is-pseudo-class'
import postcssRem2rpx from 'postcss-rem-to-responsive-pixel'
import { createContext } from './ctx'
import { postcssWeappTailwindcssPostPlugin } from './post'
import { postcssWeappTailwindcssPrePlugin } from './pre'

export function getPlugins(options: IStyleHandlerOptions) {
  const ctx = createContext()
  options.ctx = ctx
  const plugins: AcceptedPlugin[] = [
    ...(options.postcssOptions?.plugins ?? []),
    postcssWeappTailwindcssPrePlugin(options),
    postcssIsPseudoClass({
      specificityMatchingName: 'weapp-tw-ig',
    }),
  ]
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
  plugins.push(postcssWeappTailwindcssPostPlugin(options))
  return plugins
}

export { postcssWeappTailwindcssPostPlugin } from './post'
export { postcssWeappTailwindcssPrePlugin } from './pre'
// @ts-expect-error
export { default as postcssIsPseudoClass } from '@csstools/postcss-is-pseudo-class'
export { default as postcssRem2rpx } from 'postcss-rem-to-responsive-pixel'
