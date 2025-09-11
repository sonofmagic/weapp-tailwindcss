import type { IStyleHandlerOptions } from './types'
import { defu, defuOverrideArray } from '@weapp-tailwindcss/shared'
import postcss from 'postcss'
import { getDefaultOptions } from './defaults'
import { getPlugins } from './plugins'
import { createInjectPreflight } from './preflight'

function styleHandler(rawSource: string, options: IStyleHandlerOptions) {
  return postcss(
    getPlugins(options),
  )
    .process(
      rawSource,
      defu(options.postcssOptions?.options, {
        from: undefined,
      }),
    )
    .async()
}

export function createStyleHandler(options?: Partial<IStyleHandlerOptions>) {
  const cachedOptions = defuOverrideArray<
    IStyleHandlerOptions,
    Partial<IStyleHandlerOptions>[]
  >(
    options as IStyleHandlerOptions,
    getDefaultOptions(options),
  )

  cachedOptions.cssInjectPreflight = createInjectPreflight(cachedOptions.cssPreflight)

  return (rawSource: string, opt?: Partial<IStyleHandlerOptions>) => {
    return styleHandler(
      rawSource,
      defuOverrideArray<
        IStyleHandlerOptions,
        Partial<IStyleHandlerOptions>[]
      >(opt as IStyleHandlerOptions, cachedOptions),
    )
  }
}
