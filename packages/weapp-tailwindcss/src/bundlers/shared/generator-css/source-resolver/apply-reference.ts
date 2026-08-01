import { postcss } from '@weapp-tailwindcss/postcss'
import { collectCssApplyCandidates } from '../candidates'
import { hasTailwindApplyDirective, hasTailwindRootDirectives, hasTailwindSourceDirectives, parseImportRequest } from '../directives'

interface TailwindV4ApplyReferenceSourceOptions {
  cssEntries?: string[] | undefined
  cssSources?: Array<{
    css?: string | undefined
    file?: string | undefined
  }> | undefined
  packageName?: string | undefined
}

function resolveTailwindV4ApplyReference(options: TailwindV4ApplyReferenceSourceOptions) {
  const references = new Set<string>()
  for (const source of options.cssSources ?? []) {
    if (
      typeof source.file === 'string'
      && source.file.length > 0
      && typeof source.css === 'string'
      && hasTailwindRootDirectives(source.css, { importFallback: true })
      && hasTailwindApplyContextDirective(source.css)
    ) {
      references.add(source.file)
    }
  }
  return references.size === 1 ? references.values().next().value : undefined
}

function hasTailwindApplyContextDirective(css: string) {
  try {
    let found = false
    postcss.parse(css).walkAtRules((rule) => {
      if (rule.name === 'theme' || rule.name === 'config') {
        found = true
        return false
      }
    })
    return found
  }
  catch {
    return false
  }
}

export function createTailwindV4ApplyReferenceSource(css: string, sourceOptions: TailwindV4ApplyReferenceSourceOptions) {
  const reference = resolveTailwindV4ApplyReference(sourceOptions)
  return createTailwindV4SourceReferenceSource(
    css,
    sourceOptions,
    reference ? `@reference ${JSON.stringify(reference.replace(/\\/g, '/'))};` : undefined,
  )
}

export function createTailwindV4SourceReferenceSource(
  css: string,
  sourceOptions: { packageName?: string },
  referenceDirective?: string,
) {
  if (hasTailwindV4RootImport(css, sourceOptions)) {
    return css
  }
  const hasApplyDirective = hasTailwindApplyDirective(css)
  if (!hasApplyDirective && !hasTailwindSourceDirectives(css, { importFallback: true })) {
    return css
  }
  const utilities = hasApplyDirective ? collectCssApplyCandidates(css) : []
  return [
    referenceDirective ?? `@import "${sourceOptions.packageName ?? 'tailwindcss'}" source(none);`,
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
