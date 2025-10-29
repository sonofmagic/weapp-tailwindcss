// selectorParser 相关工具的聚合导出入口
export { isOnlyBeforeAndAfterPseudoElement } from './selectorParser/before-after'

export { getFallbackRemove } from './selectorParser/fallback'

export { ruleTransformSync } from './selectorParser/rule-transformer'

export {
  composeIsPseudoAst,
  getCombinatorSelectorAst,
  mklist,
} from './selectorParser/utils'
