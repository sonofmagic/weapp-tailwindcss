import { postcss } from '@weapp-tailwindcss/postcss'
import { collectCssApplyCandidates } from '../candidates'
import { hasTailwindApplyDirective, hasTailwindSourceDirectives, parseImportRequest } from '../directives'

export function createTailwindV4ApplyReferenceSource(css: string, sourceOptions: { packageName?: string }) {
  return createTailwindV4SourceReferenceSource(css, sourceOptions)
}

export function createTailwindV4SourceReferenceSource(css: string, sourceOptions: { packageName?: string }) {
  if (hasTailwindV4RootImport(css, sourceOptions)) {
    return css
  }
  const hasApplyDirective = hasTailwindApplyDirective(css)
  if (!hasApplyDirective && !hasTailwindSourceDirectives(css, { importFallback: true })) {
    return css
  }
  const utilities = hasApplyDirective ? collectCssApplyCandidates(css) : []
  return [
    `@import "${sourceOptions.packageName ?? 'tailwindcss'}" source(none);`,
    utilities.length > 0 ? `@source inline(${JSON.stringify(utilities.join(' '))});` : undefined,
    css,
  ].filter(Boolean).join('\n')
}

function hasTailwindV4RootImport(css: string, sourceOptions: { packageName?: string }) {
  try {
    const root = postcss.parse(css)
    let found = false
    root.walkAtRules((rule) => {
      if (rule.name === 'tailwind') {
        found = true
        return false
      }
      if (rule.name !== 'import' && rule.name !== 'use' && rule.name !== 'forward') {
        return
      }
      const request = parseImportRequest(rule.params)
      if (
        request === (sourceOptions.packageName ?? 'tailwindcss')
        || request === 'tailwindcss'
        || request === 'tailwindcss4'
        || request?.startsWith('tailwindcss/')
        || request?.startsWith('tailwindcss4/')
      ) {
        found = true
        return false
      }
    })
    return found
  }
  catch {
    return /@(?:import|use|forward|tailwind)(?:[\s"'(;]|$)/.test(css)
      && (css.includes('tailwindcss') || css.includes('tailwindcss4') || css.includes('weapp-tailwindcss'))
  }
}
