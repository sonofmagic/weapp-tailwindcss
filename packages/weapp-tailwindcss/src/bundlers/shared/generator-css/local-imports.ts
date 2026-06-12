import { postcss } from '@weapp-tailwindcss/postcss'
import { parseImportRequest, removeTailwindSourceDirectives } from './directives'

const REMOTE_IMPORT_RE = /^(?:https?:)?\/\//i

function createCssSourceOrderAppend(base: string, extra: string) {
  if (!base) {
    return extra
  }
  if (!extra) {
    return base
  }
  if (/\s$/.test(base) || /^\s/.test(extra)) {
    return `${base}${extra}`
  }
  return `${base}\n${extra}`
}

function isLocalImportRequest(request: string) {
  return request.length > 0
    && !request.startsWith('#')
    && !request.startsWith('tailwindcss')
    && !request.startsWith('weapp-tailwindcss')
    && !request.startsWith('data:')
    && !REMOTE_IMPORT_RE.test(request)
}

export function isPureLocalCssImportWrapper(css: string) {
  let hasImport = false
  try {
    const root = postcss.parse(css)
    for (const node of root.nodes) {
      if (node.type === 'comment') {
        continue
      }
      if (node.type !== 'atrule' || node.name !== 'import') {
        return false
      }
      const request = parseImportRequest(node.params)
      if (!request || !isLocalImportRequest(request)) {
        return false
      }
      hasImport = true
    }
  }
  catch {
    return false
  }
  return hasImport
}

export function cleanLocalCssImportWrapperTailwindDirectives(css: string) {
  let hasLocalImport = false
  let hasTailwindDirective = false
  try {
    const root = postcss.parse(css)
    for (const node of root.nodes) {
      if (node.type === 'comment') {
        continue
      }
      if (node.type === 'atrule' && node.name === 'import') {
        const request = parseImportRequest(node.params)
        if (!request || !isLocalImportRequest(request)) {
          return undefined
        }
        hasLocalImport = true
        continue
      }
      if (node.type === 'atrule' && node.name === 'source') {
        hasTailwindDirective = true
        continue
      }
      return undefined
    }
  }
  catch {
    return undefined
  }
  return hasLocalImport && hasTailwindDirective
    ? prefixLocalCssImportsWithWebpackIgnore(removeTailwindSourceDirectives(css))
    : undefined
}

function prefixLocalCssImportsWithWebpackIgnore(css: string) {
  try {
    const root = postcss.parse(css)
    root.walkAtRules('import', (atRule) => {
      const request = parseImportRequest(atRule.params)
      if (request && isLocalImportRequest(request)) {
        atRule.raws.before = `${atRule.raws.before ?? ''}/* webpackIgnore: true */\n`
      }
    })
    return root.toString()
  }
  catch {
    return css
  }
}

export function splitLocalCssImports(source: string) {
  try {
    const root = postcss.parse(source)
    const importRoot = postcss.root()
    let changed = false
    for (const node of [...root.nodes]) {
      if (node.type !== 'atrule' || node.name !== 'import') {
        continue
      }
      const request = parseImportRequest(node.params)
      if (!request || !isLocalImportRequest(request)) {
        continue
      }
      importRoot.append(node.clone())
      node.remove()
      changed = true
    }
    const imports = importRoot.nodes
      .filter((node): node is postcss.AtRule => node.type === 'atrule' && node.name === 'import')
      .map(node => `@import ${node.params};`)
      .join('\n')
    return changed
      ? {
          imports,
          source: root.toString(),
        }
      : undefined
  }
  catch {
    return undefined
  }
}

export function restoreLocalCssImports(css: string, imports: string | undefined) {
  if (!imports?.trim()) {
    return css
  }
  return createCssSourceOrderAppend(imports, css)
}
