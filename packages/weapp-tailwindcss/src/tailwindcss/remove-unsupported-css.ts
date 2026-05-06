import type postcss from 'postcss'

/**
 * 移除小程序不支持的 cascade layer 语法，同时保留 layer 内的实际规则。
 */
export function removeUnsupportedCascadeLayers(root: postcss.Root) {
  root.walkAtRules('layer', (atRule) => {
    if (!atRule.nodes || atRule.nodes.length === 0) {
      atRule.remove()
      return
    }

    atRule.replaceWith(...atRule.nodes)
  })
}
