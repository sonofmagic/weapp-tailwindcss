import postcss from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import { defuOverrideArray } from '../utils'
import { getPlugins } from './plugins'

export async function styleHandler(rawSource: string, options: IStyleHandlerOptions) {
  return (
    await postcss(getPlugins(options))
      .process(
        rawSource,
        options.postcssOptions?.options ?? {
          from: undefined,
        },
      )
      .async()
  ).css
}

export function createStyleHandler(options: Partial<IStyleHandlerOptions>) {
  return (rawSource: string, opt?: Partial<IStyleHandlerOptions>) => {
    return styleHandler(
      rawSource,
      defuOverrideArray<IStyleHandlerOptions, Partial<IStyleHandlerOptions>[]>(opt as IStyleHandlerOptions, options),
    )
  }
}
