import type { IJsHandlerOptions } from '../../types'
import type { SourceAnalysis } from '../sourceAnalysis'
import type { JsToken } from '../types'
import MagicString from 'magic-string'
import { replaceHandleValue } from '../handlers'
import { collectModuleSpecifierReplacementTokens } from '../sourceAnalysis'

export function processUpdatedSource(
  rawSource: string,
  options: IJsHandlerOptions,
  analysis: SourceAnalysis,
) {
  const { targetPaths, jsTokenUpdater, ignoredPaths } = analysis

  // 为前面收集到的所有字符串节点生成替换 token。
  const replacementTokens: JsToken[] = []
  for (const path of targetPaths) {
    if (ignoredPaths.has(path)) {
      continue
    }

    const token = replaceHandleValue(
      path,
      {
        ...options,
        needEscaped: path.isStringLiteral() ? options.needEscaped ?? true : false,
      },
    )

    if (token) {
      replacementTokens.push(token)
    }
  }

  if (options.moduleSpecifierReplacements) {
    replacementTokens.push(
      ...collectModuleSpecifierReplacementTokens(analysis, options.moduleSpecifierReplacements),
    )
  }

  // 若没有任何待更新的 token，避免不必要的 MagicString 开销。
  if ((jsTokenUpdater.length + replacementTokens.length) === 0) {
    return new MagicString(rawSource)
  }

  const ms = new MagicString(rawSource)
  jsTokenUpdater.push(...replacementTokens).filter(token => !ignoredPaths.has(token.path)).updateMagicString(ms)
  return ms
}
