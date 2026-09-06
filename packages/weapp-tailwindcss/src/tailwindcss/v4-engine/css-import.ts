import path from 'node:path'
import { tokenize, TokenType } from '@csstools/css-tokenizer'

export function parseCssImportSpecifier(params: string) {
  const tokens = tokenize({ css: params }).filter(token =>
    token[0] !== TokenType.Whitespace && token[0] !== TokenType.Comment,
  )
  const first = tokens[0]
  if (!first) {
    return undefined
  }
  if (first[0] === TokenType.String || first[0] === TokenType.URL) {
    return {
      specifier: first[4].value,
      raw: first[1],
      quote: first[0] === TokenType.String ? first[1][0] : undefined,
    }
  }
  if (
    first[0] === TokenType.Function && first[4].value.toLowerCase() === 'url'
    && tokens[1]?.[0] === TokenType.String && tokens[2]?.[0] === TokenType.CloseParen
  ) {
    return {
      specifier: tokens[1][4].value,
      raw: params.slice(first[2], tokens[2][3] + 1),
      quote: tokens[1][1][0],
    }
  }
  return undefined
}

export function quoteCssImportSpecifier(file: string, quote = '"') {
  // 文件系统路径只在写入 CSS 请求的边界转换，缓存与文件读取仍使用原始路径。
  const cssPath = path.sep === '\\' || /^[a-z]:[\\/]|^\\\\/i.test(file)
    ? file.replaceAll('\\', '/')
    : file
  return `${quote}${cssPath.replaceAll('\\', '\\\\').replaceAll(quote, `\\${quote}`).replaceAll('\n', '\\a ').replaceAll('\r', '\\d ')}${quote}`
}

export function isTailwindCssImport(params: string) {
  const specifier = parseCssImportSpecifier(params)?.specifier
  if (!specifier) {
    return false
  }
  if (specifier === 'tailwindcss' || specifier.startsWith('tailwindcss/')) {
    return true
  }
  const paths = specifier.includes('\\') ? path.win32 : path.posix
  return paths.basename(specifier) === 'index.css'
    && paths.basename(paths.dirname(specifier)) === 'tailwindcss'
}

export function parseImportSourceParam(params: string) {
  const tokens = tokenize({ css: params }).filter(token =>
    token[0] !== TokenType.Whitespace && token[0] !== TokenType.Comment,
  )
  const index = tokens.findIndex(token => token[0] === TokenType.Function && token[4].value === 'source')
  const value = tokens[index + 1]
  if (index < 0 || tokens[index + 2]?.[0] !== TokenType.CloseParen) {
    return undefined
  }
  if (value?.[0] === TokenType.Ident && value[4].value === 'none') {
    return { none: true, sourcePath: undefined }
  }
  return value?.[0] === TokenType.String ? { none: false, sourcePath: value[4].value } : undefined
}
