import type { ExistingRawSourceMap } from 'rollup'
import path from 'node:path'
import process from 'node:process'

export function slash(p: string): string {
  return p.replace(/\\/g, '/')
}

export const isWindows = process.platform === 'win32'

const cssLangs = `\\.(css|less|sass|scss|styl|stylus|pcss|postcss)($|\\?)`
export const cssLangRE = new RegExp(cssLangs)
export function isCSSRequest(request: string): boolean {
  return cssLangRE.test(request)
}

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id)
}

const postfixRE = /[?#].*$/
export function cleanUrl(url: string): string {
  return url.replace(postfixRE, '')
}

export async function formatPostcssSourceMap(
  rawMap: ExistingRawSourceMap,
  file: string,
): Promise<ExistingRawSourceMap> {
  const inputFileDir = path.dirname(file)

  const sources = rawMap.sources.map((source) => {
    const cleanSource = cleanUrl(decodeURIComponent(source))

    // 处理 PostCSS 虚拟文件路径
    if (cleanSource[0] === '<' && cleanSource.endsWith('>')) {
      return `\0${cleanSource}`
    }

    return normalizePath(path.resolve(inputFileDir, cleanSource))
  })

  return {
    file,
    mappings: rawMap.mappings,
    names: rawMap.names,
    sources,
    sourcesContent: rawMap.sourcesContent,
    version: rawMap.version,
  }
}
