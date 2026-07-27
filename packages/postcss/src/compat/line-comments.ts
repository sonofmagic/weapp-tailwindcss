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
  const syntaxCharacter = /[/"'(]/g

  for (let match = syntaxCharacter.exec(source); match; match = syntaxCharacter.exec(source)) {
    const index = match.index
    const char = match[0]
    const next = source[index + 1]

    if (char === '/' && next === '*' && !isEscaped(source, index)) {
      const commentEnd = source.indexOf('*/', index + 2)
      syntaxCharacter.lastIndex = commentEnd === -1 ? source.length : commentEnd + 2
      continue
    }
    if ((char === '"' || char === '\'') && !isEscaped(source, index)) {
      const quoteEnd = findUnescapedCharacter(source, char, index + 1)
      syntaxCharacter.lastIndex = quoteEnd === -1 ? source.length : quoteEnd + 1
      continue
    }
    if (char === '(' && isUrlFunctionStart(source, index)) {
      let valueStart = index + 1
      while (valueStart < source.length && /\s/.test(source[valueStart] ?? '')) {
        valueStart++
      }
      const valueStartChar = source[valueStart]
      if (valueStartChar !== '"' && valueStartChar !== '\'') {
        const urlEnd = findUnescapedCharacter(source, ')', valueStart)
        syntaxCharacter.lastIndex = urlEnd === -1 ? source.length : urlEnd + 1
      }
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
      syntaxCharacter.lastIndex = lineEnd
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

function findUnescapedCharacter(source: string, character: string, fromIndex: number) {
  let index = source.indexOf(character, fromIndex)
  while (index !== -1 && isEscaped(source, index)) {
    index = source.indexOf(character, index + 1)
  }
  return index
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
