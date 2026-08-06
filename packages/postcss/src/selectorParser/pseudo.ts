export function selectorContainsPseudoClass(selector: string, pseudoClasses: readonly string[]) {
  if (pseudoClasses.length === 0) {
    return false
  }

  let attributeDepth = 0
  let quote: string | undefined
  let escaped = false

  for (let index = 0; index < selector.length; index += 1) {
    const character = selector[index]
    if (escaped) {
      escaped = false
      continue
    }
    if (character === '\\') {
      escaped = true
      continue
    }
    if (quote) {
      if (character === quote) {
        quote = undefined
      }
      continue
    }
    if (character === '"' || character === '\'') {
      quote = character
      continue
    }
    if (character === '[') {
      attributeDepth += 1
      continue
    }
    if (character === ']') {
      attributeDepth = Math.max(0, attributeDepth - 1)
      continue
    }
    if (attributeDepth > 0 || character !== ':') {
      continue
    }

    let end = index + 1
    while (end < selector.length && /[\w-]/.test(selector[end] ?? '')) {
      end += 1
    }
    if (pseudoClasses.includes(selector.slice(index, end))) {
      return true
    }
    index = end - 1
  }

  return false
}
