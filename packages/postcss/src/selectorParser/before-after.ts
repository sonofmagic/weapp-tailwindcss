// 检测选择器是否仅包含 ::before / ::after 伪元素
import type { Rule } from 'postcss'
import psp from 'postcss-selector-parser'

interface BeforeAfterState {
  before: boolean
  after: boolean
}

let beforeAfterStateRef: BeforeAfterState | null = null

// 复用 parser 遍历伪元素节点，记录是否存在 before/after
const beforeAfterParser = psp((selectors) => {
  const state = beforeAfterStateRef
  if (!state) {
    return
  }
  selectors.walkPseudos((s) => {
    if (s.parent?.length === 1) {
      if (/^:?:before$/.test(s.value)) {
        state.before = true
      }
      if (/^:?:after$/.test(s.value)) {
        state.after = true
      }
    }
  })
})

// isOnlyBeforeAndAfterPseudoElement 判断规则是否同时拥有 before 和 after
export function isOnlyBeforeAndAfterPseudoElement(node: Rule) {
  const state: BeforeAfterState = {
    before: false,
    after: false,
  }
  beforeAfterStateRef = state
  beforeAfterParser.astSync(node)
  beforeAfterStateRef = null
  return state.before && state.after
}
