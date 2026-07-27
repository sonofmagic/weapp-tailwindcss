/**
 * 将常见预处理器风格的行注释转换为 PostCSS 可解析的块注释。
 * 避免改写字符串、块注释和未加引号的 URL。
 */
export function normalizeCssLineComments(source: string) {
  let result = ''
  let quote: '"' | '\'' | undefined
  let blockComment = false
  let unquotedUrl = false

  for (let index = 0; index < source.length; index++) {
    const char = source[index]
    const next = source[index + 1]

    if (blockComment) {
      result += char
      if (char === '*' && next === '/') {
        result += next
        index++
        blockComment = false
      }
      continue
    }

    if (quote) {
      result += char
      if (char === '\\' && next !== undefined) {
        result += next
        index++
      }
      else if (char === quote) {
        quote = undefined
      }
      continue
    }

    if (unquotedUrl) {
      result += char
      if (char === '\\' && next !== undefined) {
        result += next
        index++
      }
      else if (char === ')') {
        unquotedUrl = false
      }
      continue
    }

    if (char === '/' && next === '*') {
      result += char + next
      index++
      blockComment = true
      continue
    }
    if (char === '"' || char === '\'') {
      result += char
      quote = char
      continue
    }
    if (char === '(' && /\burl$/i.test(result)) {
      let valueStart = index + 1
      while (valueStart < source.length && /\s/.test(source[valueStart] ?? '')) {
        valueStart++
      }
      const valueStartChar = source[valueStart]
      unquotedUrl = valueStartChar !== '"' && valueStartChar !== '\''
      result += char
      continue
    }

    if (char === '/' && next === '/') {
      let lineStart = result.length - 1
      while (lineStart >= 0 && result[lineStart] !== '\n' && result[lineStart] !== '\r') {
        lineStart--
      }
      const linePrefix = result.slice(lineStart + 1)
      const trimmedLinePrefix = linePrefix.trimEnd()
      const needsSemicolon = trimmedLinePrefix.length > 0 && !/[;{}]$/.test(trimmedLinePrefix)
      if (needsSemicolon) {
        const trailingWhitespace = linePrefix.slice(trimmedLinePrefix.length)
        result = `${result.slice(0, result.length - trailingWhitespace.length)};${trailingWhitespace}`
      }
      result += '/*'
      index += 2
      while (index < source.length && source[index] !== '\n' && source[index] !== '\r') {
        result += source[index]
        index++
      }
      result += '*/'
      if (index < source.length) {
        result += source[index]
      }
      continue
    }

    result += char
  }

  return result
}
