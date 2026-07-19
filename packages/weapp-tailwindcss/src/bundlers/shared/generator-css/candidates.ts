import { splitCandidateTokens } from '@tailwindcss-mangle/engine'
import { postcss } from '@weapp-tailwindcss/postcss'
import { collectCssInlineSourceCandidates } from '@/tailwindcss/source-scan'

function parseGeneratorCss(css: string) {
  let root: postcss.Root
  try {
    root = postcss.parse(css)
  }
  catch {
    return undefined
  }

  return root
}

function collectApplyCandidates(root: postcss.Root) {
  const candidates = new Set<string>()
  root.walkAtRules('apply', (rule) => {
    for (const candidate of splitCandidateTokens(rule.params)) {
      candidates.add(candidate)
    }
  })
  return candidates
}

export function collectCssApplyCandidates(css: string) {
  const root = parseGeneratorCss(css)
  return root ? [...collectApplyCandidates(root)].sort() : []
}

export function collectGeneratorCssCandidates(css: string) {
  const root = parseGeneratorCss(css)
  if (!root) {
    return []
  }

  const candidates = collectApplyCandidates(root)

  const inlineCandidates = collectCssInlineSourceCandidates(root)
  for (const candidate of inlineCandidates.included) {
    candidates.add(candidate)
  }
  for (const candidate of inlineCandidates.excluded) {
    candidates.delete(candidate)
  }

  return [...candidates].sort()
}
