import postcss, { AcceptedPlugin } from 'postcss'
import { postcssIsPseudoClass, postcssWeappTailwindcss, postcssRem2rpx } from './plugin'
import type { IStyleHandlerOptions } from '@/types'
import { defuOverrideArray } from '@/utils'

export async function styleHandler(rawSource: string, options: IStyleHandlerOptions) {
  const plugins: AcceptedPlugin[] = [
    postcssWeappTailwindcss(options),
    postcssIsPseudoClass({
      specificityMatchingName: 'weapp-tw-ig'
    })
  ]
  if (options.rem2rpx) {
    plugins.push(
      postcssRem2rpx(
        typeof options.rem2rpx === 'object'
          ? options.rem2rpx
          : {
              rootValue: 32,
              propList: ['*'],
              transformUnit: 'rpx'
            }
      )
    )
  }
  return (await postcss(plugins).process(rawSource).async()).css
}

export function createStyleHandler(options: Partial<IStyleHandlerOptions>) {
  return (rawSource: string, opt?: Partial<IStyleHandlerOptions>) => {
    return styleHandler(rawSource, defuOverrideArray<IStyleHandlerOptions, Partial<IStyleHandlerOptions>[]>(opt as IStyleHandlerOptions, options))
  }
}
