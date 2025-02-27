import type { Node } from 'postcss-selector-parser'
import type { InternalCssSelectorReplacerOptions } from './types'
import { escape, MappingChars2String } from '@weapp-core/escape'
import psp from 'postcss-selector-parser'
// css 中，要多加一个 '\' 来转义
// for raw css selector
// export function cssSelectorReplacer(selector: string, escapeEntries = MappingChars2StringEntries) {
//   return escape(selector, true, escapeEntries).replace(/\\2c /g, dic[','])
// }

export function internalCssSelectorReplacer(
  selectors: string,
  options: InternalCssSelectorReplacerOptions = {
    escapeMap: MappingChars2String,
  },
) {
  const { mangleContext, escapeMap } = options
  if (mangleContext) {
    selectors = mangleContext.cssHandler(selectors)
  }
  return escape(selectors, {
    map: escapeMap,
  })
}

export function composeIsPseudoAst(strs: string | string[]): Node[] {
  if (typeof strs === 'string') {
    return [
      psp.tag({
        value: strs,
      }),
      psp.combinator({
        value: '+',
      }),
      psp.tag({
        value: strs,
      }),
    ]
  }
  if (strs.length > 1) {
    return [
      psp.pseudo({
        value: ':is',
        nodes: strs.map(str =>
          psp.tag({
            value: str,
          }),
        ),
      }),
      psp.combinator({
        value: '+',
      }),
      psp.pseudo({
        value: ':is',
        nodes: strs.map(str =>
          psp.tag({
            value: str,
          }),
        ),
      }),
    ]
  }
  return [
    psp.tag({
      value: strs[0],
    }),
    psp.combinator({
      value: '+',
    }),
    psp.tag({
      value: strs[0],
    }),
  ]
}

export function composeIsPseudo(strs: string | string[]) {
  if (typeof strs === 'string') {
    return strs
  }
  if (strs.length > 1) {
    return `:is(${strs.join(',')})`
  }
  return strs.join('')
}
