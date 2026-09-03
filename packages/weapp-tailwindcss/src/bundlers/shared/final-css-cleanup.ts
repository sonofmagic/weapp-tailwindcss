import { postcss, removeEmptyAtRules, removeEmptyRules, repairTrailingUnclosedTailwindSourceMedia } from '@weapp-tailwindcss/postcss'

function isCssWhitespace(code: number) {
  return code === 9 || code === 10 || code === 12 || code === 13 || code === 32
}

export function hasEmptyCssBlockCandidate(css: string) {
  const blockContent: boolean[] = []
  let parenthesisDepth = 0
  let quote = 0
  let squareBracketDepth = 0
  for (let index = 0; index < css.length; index++) {
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
      if (blockContent.length > 0) {
        blockContent[blockContent.length - 1] = true
      }
      continue
    }
    if (code === 92) {
      if (blockContent.length > 0) {
        blockContent[blockContent.length - 1] = true
      }
      index++
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
      blockContent.push(false)
      continue
    }
    if (code === 125 && parenthesisDepth === 0 && squareBracketDepth === 0) {
      const hasContent = blockContent.pop()
      if (hasContent === false) {
        return true
      }
      if (blockContent.length > 0) {
        blockContent[blockContent.length - 1] = true
      }
      continue
    }
    if (!isCssWhitespace(code) && blockContent.length > 0) {
      blockContent[blockContent.length - 1] = true
    }
  }
  return false
}

/**
 * 在小程序样式进入最终产物图时递归清理无语义的空 CSS 块。
 */
export function finalizeMiniProgramCssStructure(css: string) {
  const repaired = repairTrailingUnclosedTailwindSourceMedia(css)
  if (!hasEmptyCssBlockCandidate(repaired)) {
    return repaired
  }
  try {
    const root = postcss.parse(repaired)
    let removed = 0
    let passRemoved = 0
    do {
      passRemoved = removeEmptyRules(root) + removeEmptyAtRules(root)
      removed += passRemoved
    } while (passRemoved > 0)
    return removed > 0 ? root.toString() : repaired
  }
  catch {
    return repaired
  }
}
