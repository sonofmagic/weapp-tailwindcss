// 选择器 AST 相关的通用工具，提供组合与替换的辅助函数
import type { Node } from 'postcss-selector-parser'
import type { IStyleHandlerOptions } from '../types'
import psp from 'postcss-selector-parser'

export type ParserTransformOptions = Partial<{
  lossless: boolean
  updateSelector: boolean
}>

// normalizeTransformOptions 确保 parser 在修改选择器时保持必要的副作用
export function normalizeTransformOptions(options?: ParserTransformOptions): ParserTransformOptions {
  return {
    lossless: false,
    updateSelector: true,
    ...options,
  }
}

// mklist 将节点扩展为 "节点 + combinator + 节点副本" 的结构
export function mklist(node: Node): Node[] {
  return [
    node,
    psp.combinator({
      value: '+',
    }),
    node.clone(),
  ]
}

// composeIsPseudoAst 按需把字符串数组转换为 :is(...) 结构的 AST
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

// 根据配置生成替换子代选择器的 AST，默认使用 view 标签
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
