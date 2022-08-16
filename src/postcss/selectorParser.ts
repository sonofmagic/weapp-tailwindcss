import selectorParser from 'postcss-selector-parser'
// import memoize from 'lodash.memoize'
// import hash from 'object-hash'
import type { SyncProcessor } from 'postcss-selector-parser'
import type { Rule } from 'postcss'
import type { StyleHandlerOptions } from '@/types'

const createTransform = (rule: Rule, options: StyleHandlerOptions) => {
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
    })
    if (selectors.length === 0) {
      rule.remove()
    }
  }
  return transform
}

const getTransformer = (rule: Rule, options: StyleHandlerOptions) => {
  return selectorParser(createTransform(rule, options))
}

// const getTransformerFormCache = memoize(getTransformer, (options) => {
//   return hash(options)
// })

export const transformSync = (rule: Rule, options: StyleHandlerOptions) => {
  const transformer = getTransformer(rule, options)

  return transformer.transformSync(rule, {
    lossless: false,
    updateSelector: true
  })
}
