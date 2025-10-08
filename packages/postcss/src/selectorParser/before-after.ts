import type { Rule } from 'postcss'
import psp from 'postcss-selector-parser'

interface BeforeAfterState {
  before: boolean
  after: boolean
}

let beforeAfterStateRef: BeforeAfterState | null = null

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
