import type { FinalizeMiniProgramCssOptions } from './finalize-options'
import postcss from 'postcss'
import { isDisplayP3Declaration } from './color-gamut'
import {
  isEmptyTwContentDeclaration,
  isMiniProgramThemeVariableRule,
  usesTwContentVariable,
} from './predicates'
import { MINI_PROGRAM_THEME_SCOPE_SELECTOR } from './selectors'

export function collectThemeVariableRule(root: postcss.Root, _options: FinalizeMiniProgramCssOptions = {}) {
  const themeRules: postcss.Rule[] = []
  const declarations = new Map<string, postcss.Declaration>()
  const shouldPreserveContentInit = usesTwContentVariable(root)

  for (const node of root.nodes ?? []) {
    if (!isMiniProgramThemeVariableRule(node)) {
      continue
    }

    themeRules.push(node)
    node.walkDecls((decl) => {
      if (isDisplayP3Declaration(decl)) {
        return
      }
      if (!shouldPreserveContentInit && isEmptyTwContentDeclaration(decl)) {
        return
      }
      declarations.set(decl.prop, decl.clone())
    })
  }

  for (const rule of themeRules) {
    rule.remove()
  }

  if (declarations.size === 0) {
    return
  }

  const rule = postcss.rule({
    selector: MINI_PROGRAM_THEME_SCOPE_SELECTOR,
  })
  for (const decl of declarations.values()) {
    rule.append(decl)
  }
  return rule
}
