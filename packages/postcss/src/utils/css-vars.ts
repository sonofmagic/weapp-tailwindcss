import { Declaration } from 'postcss'

export interface CssVarDefinition {
  prop: string
  value: string
}

/**
 * 将 CSS 变量定义转换为可直接插入的 Declaration 节点列表。
 */
export function createCssVarNodes(definitions: CssVarDefinition[]) {
  return definitions.map(def => new Declaration({
    prop: def.prop,
    value: def.value,
  }))
}
