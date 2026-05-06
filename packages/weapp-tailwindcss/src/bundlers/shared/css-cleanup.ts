import postcss from 'postcss'

function removeAtSupportsByScan(css: string) {
  let index = 0
  let result = ''

  while (index < css.length) {
    const start = css.indexOf('@supports', index)
    if (start === -1) {
      result += css.slice(index)
      break
    }

    result += css.slice(index, start)
    const blockStart = css.indexOf('{', start)
    if (blockStart === -1) {
      result += css.slice(start)
      break
    }

    let depth = 0
    let cursor = blockStart
    for (; cursor < css.length; cursor++) {
      const char = css[cursor]
      if (char === '{') {
        depth++
      }
      else if (char === '}') {
        depth--
        if (depth === 0) {
          cursor++
          break
        }
      }
    }

    index = cursor
  }

  return result
}

export function removeUnsupportedAtSupports(css: string) {
  try {
    const root = postcss.parse(css)
    root.walkAtRules('supports', (atRule) => {
      atRule.remove()
    })
    root.walkAtRules((atRule) => {
      if (!atRule.nodes || atRule.nodes.length === 0) {
        atRule.remove()
      }
    })
    return root.toString()
  }
  catch {
    return removeAtSupportsByScan(css)
  }
}
