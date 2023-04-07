import postcss from 'postcss'
import type { IStyleHandlerOptions } from '@/types'
import { defu } from '@/utils'
import { postcssIsPseudoClass, postcssWeappTailwindcss } from './plugin'

export function styleHandler(rawSource: string, options: IStyleHandlerOptions) {
  return postcss([postcssWeappTailwindcss(options), postcssIsPseudoClass()]).process(rawSource).css
}

export function createStyleHandler(options: Partial<IStyleHandlerOptions>) {
  return (rawSource: string, opt: IStyleHandlerOptions) => {
    return styleHandler(rawSource, defu<IStyleHandlerOptions, Partial<IStyleHandlerOptions>[]>(opt, options))
  }
}
