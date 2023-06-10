import postcss from 'postcss'
import { postcssIsPseudoClass, postcssWeappTailwindcss } from './plugin'
import type { IStyleHandlerOptions } from '@/types'
import { defu } from '@/utils'

export function styleHandler(rawSource: string, options: IStyleHandlerOptions) {
  return postcss([postcssWeappTailwindcss(options), postcssIsPseudoClass()]).process(rawSource).css
}

export function createStyleHandler(options: Partial<IStyleHandlerOptions>) {
  return (rawSource: string, opt?: Partial<IStyleHandlerOptions>) => {
    return styleHandler(rawSource, defu<IStyleHandlerOptions, Partial<IStyleHandlerOptions>[]>(opt, options))
  }
}
