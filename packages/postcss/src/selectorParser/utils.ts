import type { Node } from 'postcss-selector-parser'
import type { IStyleHandlerOptions } from '../types'
import psp from 'postcss-selector-parser'

export type ParserTransformOptions = Partial<{
  lossless: boolean
  updateSelector: boolean
}>

export function normalizeTransformOptions(options?: ParserTransformOptions): ParserTransformOptions {
  return {
    lossless: false,
    updateSelector: true,
    ...options,
  }
}

export function mklist(node: Node): Node[] {
  return [
    node,
    psp.combinator({
      value: '+',
    }),
    node.clone(),
  ]
}

export function composeIsPseudoAst(strs: string | string[]): Node[] {
  if (typeof strs === 'string') {
    return mklist(psp.tag({
      value: strs,
    }))
  }
  if (strs.length > 1) {
    return mklist(psp.pseudo({
      value: ':is',
      nodes: strs.map(str =>
        psp.tag({
          value: str,
        }),
      ),
    }))
  }
  return mklist(psp.tag({
    value: strs[0],
  }))
}

export function getCombinatorSelectorAst(options: IStyleHandlerOptions) {
  let childCombinatorReplaceValue: Node[] = mklist(psp.tag({ value: 'view' }))
  const { cssChildCombinatorReplaceValue } = options
  if (
    typeof cssChildCombinatorReplaceValue === 'string'
    || (Array.isArray(cssChildCombinatorReplaceValue) && cssChildCombinatorReplaceValue.length > 0)) {
    childCombinatorReplaceValue = composeIsPseudoAst(cssChildCombinatorReplaceValue)
  }
  return childCombinatorReplaceValue
}
