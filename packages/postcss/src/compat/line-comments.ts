/**
 * 将常见预处理器风格的行注释转换为 PostCSS 可解析的块注释。
 * 避免改写字符串、块注释和未加引号的 URL。
 */
export function normalizeCssLineComments(source: string) {
  if (!source.includes('//')) {
    return source
  }

  const parts: string[] = []
  let lastWriteIndex = 0
  let quote: '"' | '\'' | undefined
  let blockComment = false
  let unquotedUrl = false

  for (let index = 0; index < source.length; index++) {
    const char = source[index]
    const next = source[index + 1]

    if (blockComment) {
      if (char === '*' && next === '/') {
        index++
        blockComment = false
      }
      continue
    }

    if (quote) {
      if (char === '\\' && next !== undefined) {
        index++
      }
      else if (char === quote) {
        quote = undefined
      }
      continue
    }

    if (unquotedUrl) {
      if (char === '\\' && next !== undefined) {
        index++
      }
      else if (char === ')') {
        unquotedUrl = false
      }
      continue
    }

    if (char === '/' && next === '*' && !isEscaped(source, index)) {
      index++
      blockComment = true
      continue
    }
    if ((char === '"' || char === '\'') && !isEscaped(source, index)) {
      quote = char
      continue
    }
    if (char === '(' && isUrlFunctionStart(source, index)) {
      let valueStart = index + 1
      while (valueStart < source.length && /\s/.test(source[valueStart] ?? '')) {
        valueStart++
      }
      const valueStartChar = source[valueStart]
      unquotedUrl = valueStartChar !== '"' && valueStartChar !== '\''
      continue
    }

    if (char === '/' && next === '/' && !isEscaped(source, index)) {
      let lineStart = index - 1
      while (lineStart >= 0 && source[lineStart] !== '\n' && source[lineStart] !== '\r') {
        lineStart--
      }
      const linePrefix = source.slice(lineStart + 1, index)
      const trimmedLinePrefix = linePrefix.trimEnd()
      const needsSemicolon = trimmedLinePrefix.length > 0 && !/[;{}]$/.test(trimmedLinePrefix)
      let unchangedPrefix = source.slice(lastWriteIndex, index)
      if (needsSemicolon) {
        const trailingWhitespaceLength = linePrefix.length - trimmedLinePrefix.length
        const insertionIndex = unchangedPrefix.length - trailingWhitespaceLength
        unchangedPrefix = `${unchangedPrefix.slice(0, insertionIndex)};${unchangedPrefix.slice(insertionIndex)}`
      }
      let lineEnd = index + 2
      while (lineEnd < source.length && source[lineEnd] !== '\n' && source[lineEnd] !== '\r') {
        lineEnd++
      }
      parts.push(unchangedPrefix, '/*', source.slice(index + 2, lineEnd), '*/')
      lastWriteIndex = lineEnd
      index = lineEnd - 1
      continue
    }
  }

  if (parts.length === 0) {
    return source
  }
  parts.push(source.slice(lastWriteIndex))
  return parts.join('')
}

function isEscaped(source: string, index: number) {
  let backslashCount = 0
  for (let cursor = index - 1; cursor >= 0 && source[cursor] === '\\'; cursor--) {
    backslashCount++
  }
  return backslashCount % 2 === 1
}

function isUrlFunctionStart(source: string, index: number) {
  if (isEscaped(source, index) || index < 3) {
    return false
  }
  const prefix = source.slice(index - 3, index)
  const beforePrefix = source[index - 4]
  return prefix.toLowerCase() === 'url'
    && (beforePrefix === undefined || !/\w/.test(beforePrefix))
}
