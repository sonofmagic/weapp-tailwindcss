import path from 'node:path'
import { tokenize, TokenType } from '@csstools/css-tokenizer'

export interface CssImportSpecifier {
  specifier: string
  raw: string
  quote: string | undefined
}

export interface CssImportSourceParam {
  none: boolean
  sourcePath: string | undefined
}

function significantTokens(params: string) {
  return tokenize({ css: params }).filter(token =>
    token[0] !== TokenType.Whitespace && token[0] !== TokenType.Comment,
  )
}

/**
 * 解析 `@import` / `@use` / `@forward` 参数中的请求串。
 * 必须走 CSS tokenizer，才能覆盖 escape、注释、`url()` 和残缺引号。
 */
export function parseCssImportSpecifier(params: string): CssImportSpecifier | undefined {
  const tokens = significantTokens(params)
  const first = tokens[0]
  if (!first || first[0] === TokenType.EOF) {
    return undefined
  }
  if (first[0] === TokenType.String || first[0] === TokenType.URL || first[0] === TokenType.Ident) {
    return {
      specifier: first[4].value,
      raw: first[1],
      quote: first[0] === TokenType.String ? first[1][0] : undefined,
    }
  }
  if (
    first[0] === TokenType.Function && first[4].value.toLowerCase() === 'url'
    && (tokens[1]?.[0] === TokenType.String || tokens[1]?.[0] === TokenType.Ident)
    && tokens[2]?.[0] === TokenType.CloseParen
  ) {
    return {
      specifier: tokens[1][4].value,
      raw: params.slice(first[2], tokens[2][3] + 1),
      quote: tokens[1][0] === TokenType.String ? tokens[1][1][0] : undefined,
    }
  }
  return undefined
}

/** 把文件系统路径写成 CSS 请求串；缓存和读文件仍使用原始路径。 */
export function quoteCssImportSpecifier(file: string, quote = '"') {
  const cssPath = path.sep === '\\' || /^[a-z]:[\\/]|^\\\\/i.test(file)
    ? file.replaceAll('\\', '/')
    : file
  return `${quote}${cssPath.replaceAll('\\', '\\\\').replaceAll(quote, `\\${quote}`).replaceAll('\n', '\\a ').replaceAll('\r', '\\d ')}${quote}`
}

/** 判断 import 参数是否指向 Tailwind CSS 包入口。 */
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

/** 解析 `@import "..." source(...)` 中的 source 参数。 */
export function parseImportSourceParam(params: string): CssImportSourceParam | undefined {
  const tokens = significantTokens(params)
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
