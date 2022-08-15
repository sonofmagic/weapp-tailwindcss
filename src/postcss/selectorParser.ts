import selectorParser from 'postcss-selector-parser'
import memoize from 'lodash.memoize'
import hash from 'object-hash'
import type { SyncProcessor } from 'postcss-selector-parser'
import type { Rule } from 'postcss'
import type { StyleHandlerOptions } from '@/types'

const createTransform = (options: StyleHandlerOptions) => {
  const replaceFlag = options.replaceUniversalSelectorWith !== false
  const transform: SyncProcessor = (selectors) => {
    selectors.walk((selector) => {
      // do something with the selector
      // node.selector.replace(/\*/g, 'view')
      if (selector.type === 'universal' && replaceFlag) {
        selector.value = options.replaceUniversalSelectorWith as string
      }
    })
    // selectors.walkClasses((node) => {
    //   node.value = cssSelectorReplacer(node.value)
    // })
  }
  return transform
}

const getTransformer = (options: StyleHandlerOptions) => {
  return selectorParser(createTransform(options))
}

const getTransformerFormCache = memoize(getTransformer, (options) => {
  return hash(options)
})

export const transformSync = (rule: Rule, options: StyleHandlerOptions) => {
  const transformer = getTransformerFormCache(options)

  return transformer.transformSync(rule, {
    lossless: false,
    updateSelector: true
  })
}
