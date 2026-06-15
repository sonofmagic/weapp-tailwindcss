import type { Root } from 'postcss'
import { postcss } from '@weapp-tailwindcss/postcss'
import { splitCandidateTokens } from 'tailwindcss-patch'
import { hasTailwindApplyDirective, hasTailwindRootDirectives } from '../directives'

export function createTailwindV4ApplyReferenceSource(css: string, sourceOptions: { packageName?: string }) {
  if (!hasTailwindApplyDirective(css) || hasTailwindRootDirectives(css)) {
    return css
  }
  const utilities = collectTailwindApplyUtilities(css)
  return [
    `@import "${sourceOptions.packageName ?? 'tailwindcss'}" source(none);`,
    utilities.length > 0 ? `@source inline(${JSON.stringify(utilities.join(' '))});` : undefined,
    css,
  ].filter(Boolean).join('\n')
}

function collectTailwindApplyUtilities(css: string) {
  let root: Root
  try {
    root = postcss.parse(css)
  }
  catch {
    return []
  }
  const utilities = new Set<string>()
  root.walkAtRules('apply', (rule) => {
    for (const utility of splitCandidateTokens(rule.params)) {
      utilities.add(utility)
    }
  })
  return [...utilities].sort()
}
