import { postcss } from '@weapp-tailwindcss/postcss'
import { parseImportRequest, removeTailwindSourceDirectives } from './directives'

const REMOTE_IMPORT_RE = /^(?:https?:)?\/\//i
const CSS_STYLE_EXTENSION_RE = /\.(?:css|wxss|acss|ttss|qss|jxss|tyss|scss|sass|less|styl|stylus|pcss|postcss)(?:$|[?#])/i
const SOURCE_STYLE_EXTENSION_RE = /\.(?:css|scss|sass|less|styl|stylus|pcss|postcss)(?:$|[?#])/i

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

function splitRequestSuffix(request: string) {
  const queryIndex = request.indexOf('?')
  const hashIndex = request.indexOf('#')
  const suffixIndexCandidates = [queryIndex, hashIndex].filter(index => index >= 0)
  const suffixIndex = suffixIndexCandidates.length > 0 ? Math.min(...suffixIndexCandidates) : -1
  if (suffixIndex < 0) {
    return {
      clean: request,
      suffix: '',
    }
  }
  return {
    clean: request.slice(0, suffixIndex),
    suffix: request.slice(suffixIndex),
  }
}

function normalizeOutputImportRequest(request: string, styleOutputExtension: string | undefined) {
  const normalizedStyleOutputExtension = styleOutputExtension?.startsWith('.')
    ? styleOutputExtension
    : styleOutputExtension
      ? `.${styleOutputExtension}`
      : undefined
  const { clean, suffix } = splitRequestSuffix(request.replace(/\\/g, '/'))
  const normalized = clean
    .replace(/^(?:\.\/)?src\//, './')
    .replace(SOURCE_STYLE_EXTENSION_RE, normalizedStyleOutputExtension ?? '.css')
  return `${normalized}${suffix}`
}

export function rewriteLocalCssImportRequestsForOutput(
  css: string,
  options: {
    styleOutputExtension?: string | undefined
  } = {},
) {
  if (!css.includes('@import')) {
    return css
  }
  try {
    const root = postcss.parse(css)
    let changed = false
    root.walkAtRules('import', (atRule) => {
      const request = parseImportRequest(atRule.params)
      if (!request || !isLocalImportRequest(request) || !CSS_STYLE_EXTENSION_RE.test(request)) {
        return
      }
      const rewritten = normalizeOutputImportRequest(request, options.styleOutputExtension)
      if (rewritten === request) {
        return
      }
      atRule.params = atRule.params.replace(request, rewritten)
      changed = true
    })
    return changed ? root.toString() : css
  }
  catch {
    return css
  }
}
