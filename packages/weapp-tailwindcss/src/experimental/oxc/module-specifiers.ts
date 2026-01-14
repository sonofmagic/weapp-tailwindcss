import { createToken } from '../shared'
import { getImportSourceLiteral, isStringLiteral, sliceStringLiteralText } from './ast-utils'

export function maybePushModuleSpecifierReplacement(
  tokens: ReturnType<typeof createToken>[],
  code: string,
  nodeWithSource: any,
  replacements: Record<string, string> | undefined,
) {
  if (!replacements) {
    return
  }
  const src = getImportSourceLiteral(nodeWithSource)
  if (!src || !isStringLiteral(src)) {
    return
  }
  const slice = sliceStringLiteralText(code, src)
  if (!slice) {
    return
  }
  const replacement = replacements[src.value]
  if (!replacement || replacement === src.value) {
    return
  }
  tokens.push(createToken(slice.start, slice.end, replacement))
}
