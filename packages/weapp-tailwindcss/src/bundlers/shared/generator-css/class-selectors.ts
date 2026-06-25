import { postcss } from '@weapp-tailwindcss/postcss'
import { replaceWxml } from '@/wxml/shared'

function normalizeCssClassSelector(value: string) {
  return value.replace(/\\([^\da-f\r\n])/gi, '$1')
    .replace(/\\([\da-f]{1,6})\s?/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
}

export function collectRawSourceClassSelectors(rawSource: string) {
  const selectors = new Set<string>()
  try {
    const root = postcss.parse(rawSource)
    root.walkRules((rule) => {
      for (const selector of rule.selectors ?? [rule.selector]) {
        for (const match of selector.matchAll(/\.((?:\\.|[_a-z\u00A0-\uFFFF-])(?:\\.|[\w\u00A0-\uFFFF-])*)/gi)) {
          selectors.add(normalizeCssClassSelector(match[1]))
        }
      }
    })
  }
  catch {
  }
  return selectors
}

export function collectGeneratedRawSourceCandidates(
  candidates: Iterable<string>,
  rawSource: string,
  escapeMap: Record<string, string> | undefined,
) {
  const selectors = collectRawSourceClassSelectors(rawSource)
  if (selectors.size === 0) {
    return new Set<string>()
  }
  const matched = new Set<string>()
  for (const candidate of candidates) {
    const escaped = normalizeCssClassSelector(replaceWxml(candidate, { escapeMap }))
    if (selectors.has(candidate) || selectors.has(escaped)) {
      matched.add(candidate)
    }
  }
  return matched
}
