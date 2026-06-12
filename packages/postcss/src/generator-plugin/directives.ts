import type { Root } from 'postcss'

const TAILWIND_ROOT_DIRECTIVE_NAMES = new Set([
  'config',
  'custom-variant',
  'plugin',
  'source',
  'tailwind',
  'theme',
  'utility',
  'variant',
])

function parseImportRequest(params: string) {
  const match = /^(?:url\(\s*)?(["']?)([^"')\s]+)\1\s*\)?/.exec(params.trim())
  return match?.[2]
}

function isTailwindImportRequest(request: string | undefined, options: { importFallback?: boolean | undefined } = {}) {
  const normalized = options.importFallback && (request === 'weapp-tailwindcss' || request?.startsWith('weapp-tailwindcss/'))
    ? request.replace(/^weapp-tailwindcss/, 'tailwindcss')
    : request
  return normalized === 'tailwindcss'
    || normalized === 'tailwindcss4'
    || normalized?.startsWith('tailwindcss/') === true
    || normalized?.startsWith('tailwindcss4/') === true
}

export function hasTailwindApplyDirective(css: string) {
  return /@apply\b/.test(css)
}

export function hasTailwindRootDirectives(root: Root, options: { importFallback?: boolean | undefined } = {}) {
  let found = false
  root.walkAtRules((rule) => {
    if (rule.name === 'import' && isTailwindImportRequest(parseImportRequest(rule.params), options)) {
      found = true
      return false
    }
    if (TAILWIND_ROOT_DIRECTIVE_NAMES.has(rule.name)) {
      found = true
      return false
    }
  })
  return found
}
