function isAtRuleNameCharacter(code: number) {
  return code === 45
    || (code >= 65 && code <= 90)
    || (code >= 97 && code <= 122)
}

function isCssWhitespace(code: number) {
  return code === 9 || code === 10 || code === 12 || code === 13 || code === 32
}

function findAtRuleBlockStart(css: string, start: number) {
  let parenthesisDepth = 0
  let quote = 0
  let squareBracketDepth = 0
  for (let index = start; index < css.length; index++) {
    const code = css.charCodeAt(index)
    if (quote !== 0) {
      if (code === 92) {
        index++
      }
      else if (code === quote) {
        quote = 0
      }
      continue
    }
    if (code === 34 || code === 39) {
      quote = code
      continue
    }
    if (code === 92) {
      index++
      continue
    }
    if (code === 47 && css.charCodeAt(index + 1) === 42) {
      const commentEnd = css.indexOf('*/', index + 2)
      if (commentEnd < 0) {
        return -1
      }
      index = commentEnd + 1
      continue
    }
    if (code === 40) {
      parenthesisDepth++
      continue
    }
    if (code === 41 && parenthesisDepth > 0) {
      parenthesisDepth--
      continue
    }
    if (code === 91) {
      squareBracketDepth++
      continue
    }
    if (code === 93 && squareBracketDepth > 0) {
      squareBracketDepth--
      continue
    }
    if (code === 123 && parenthesisDepth === 0 && squareBracketDepth === 0) {
      return index
    }
    if ((code === 59 || code === 125) && parenthesisDepth === 0 && squareBracketDepth === 0) {
      return -1
    }
  }
  return -1
}

function isEmptyAtRuleBody(css: string, blockStart: number) {
  for (let index = blockStart + 1; index < css.length; index++) {
    const code = css.charCodeAt(index)
    if (isCssWhitespace(code)) {
      continue
    }
    if (code === 47 && css.charCodeAt(index + 1) === 42) {
      const commentEnd = css.indexOf('*/', index + 2)
      if (commentEnd < 0) {
        return false
      }
      index = commentEnd + 1
      continue
    }
    return code === 125
  }
  return false
}

export function hasEmptyAtRuleBlockCandidate(css: string) {
  let searchFrom = 0
  while (searchFrom < css.length) {
    const atRuleStart = css.indexOf('@', searchFrom)
    if (atRuleStart < 0) {
      return false
    }
    searchFrom = atRuleStart + 1
    if (!isAtRuleNameCharacter(css.charCodeAt(searchFrom))) {
      continue
    }
    const blockStart = findAtRuleBlockStart(css, searchFrom + 1)
    if (blockStart >= 0 && isEmptyAtRuleBody(css, blockStart)) {
      return true
    }
  }
  return false
}
