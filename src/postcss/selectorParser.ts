import selectorParser from 'postcss-selector-parser'
import type { SyncProcessor } from 'postcss-selector-parser'
import type { Rule } from 'postcss'
import { internalCssSelectorReplacer } from './shared'
import type { IStyleHandlerOptions } from '@/types'

const createTransform = (rule: Rule, options: IStyleHandlerOptions) => {
  const replaceFlag = options.replaceUniversalSelectorWith !== false

  const transform: SyncProcessor = (selectors) => {
    selectors.walk((selector) => {
      // do something with the selector
      // node.selector.replace(/\*/g, 'view')
      if (selector.type === 'universal' && replaceFlag) {
        selector.value = options.replaceUniversalSelectorWith as string
      }

      if (selector.type === 'selector') {
        const node = selector.nodes.find((x) => x.type === 'pseudo' && x.value === ':hover')
        node && selector.remove()
      }

      if (selector.type === 'class') {
        selector.value = internalCssSelectorReplacer(selector.value, options.escapeMap)
      }
    })
    if (selectors.length === 0) {
      rule.remove()
    }
  }
  return transform
}

const getTransformer = (rule: Rule, options: IStyleHandlerOptions) => {
  return selectorParser(createTransform(rule, options))
}

export const transformSync = (rule: Rule, options: IStyleHandlerOptions) => {
  const transformer = getTransformer(rule, options)

  return transformer.transformSync(rule, {
    lossless: false,
    updateSelector: true
  })
}
