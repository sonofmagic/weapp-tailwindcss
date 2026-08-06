import selectorParser from 'postcss-selector-parser'

export function selectorContainsPseudoClass(selector: string, pseudoClasses: readonly string[]) {
  try {
    const ast = selectorParser().astSync(selector)
    let matched = false
    ast.walkPseudos((node) => {
      if (pseudoClasses.includes(node.value)) {
        matched = true
        return false
      }
    })
    return matched
  }
  catch {
    return false
  }
}
