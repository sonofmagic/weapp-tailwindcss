import type { IStyleHandlerOptions } from './types'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import postcss from 'postcss'
import { getPlugins } from './plugins'

export { createInjectPreflight } from './preflight'

export { internalCssSelectorReplacer } from './shared'

export function styleHandler(rawSource: string, options: IStyleHandlerOptions) {
  return postcss(getPlugins(options))
    .process(
      rawSource,
      options.postcssOptions?.options ?? {
        from: undefined,
      },
    )
    .async()
}

export function createStyleHandler(options: Partial<IStyleHandlerOptions>) {
  return (rawSource: string, opt?: Partial<IStyleHandlerOptions>) => {
    return styleHandler(
      rawSource,
      defuOverrideArray<IStyleHandlerOptions, Partial<IStyleHandlerOptions>[]>(opt as IStyleHandlerOptions, options),
    )
  }
}
