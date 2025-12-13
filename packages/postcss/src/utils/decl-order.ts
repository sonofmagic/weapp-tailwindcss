import type { Declaration, Rule } from 'postcss'

/**
 * 将同一规则内的声明重排，使字面量优先，带变量的声明靠后，保持各自相对顺序。
 */
export function reorderLiteralFirst(
  rule: Rule,
  declarations: Declaration[],
  isVariable: (decl: Declaration) => boolean,
) {
  if (declarations.length <= 1) {
    return
  }

  const literals: Declaration[] = []
  const variables: Declaration[] = []

  for (const decl of declarations) {
    if (isVariable(decl)) {
      variables.push(decl)
    }
    else {
      literals.push(decl)
    }
  }

  if (literals.length === 0 || variables.length === 0) {
    return
  }

  const desired = [...literals, ...variables]
  let alreadyOrdered = true

  for (let index = 0; index < desired.length; index++) {
    if (desired[index] !== declarations[index]) {
      alreadyOrdered = false
      break
    }
  }

  if (alreadyOrdered) {
    return
  }

  const anchor = declarations[declarations.length - 1]?.next() ?? undefined

  for (const decl of declarations) {
    decl.remove()
  }

  for (const decl of desired) {
    if (anchor) {
      rule.insertBefore(anchor, decl)
    }
    else {
      rule.append(decl)
    }
  }
}
