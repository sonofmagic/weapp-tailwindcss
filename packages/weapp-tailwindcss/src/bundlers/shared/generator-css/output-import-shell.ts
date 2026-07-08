import type { Node } from 'postcss'
import { postcss } from '@weapp-tailwindcss/postcss'
import { parseImportRequest } from './directives'
import { isPureLocalCssImportWrapper } from './local-imports'

const MINI_PROGRAM_OUTPUT_IMPORT_RE = /(@import\s+(?:url\(\s*)?)(["'])([^"']+\.(?:wxss|acss|ttss|qss|jxss|tyss)(?:[?#][^"']*)?)\2([^;]*;)/gi
const MINI_PROGRAM_OUTPUT_STYLE_RE = /\.(?:wxss|acss|ttss|qss|jxss|tyss)(?:$|[?#])/i

function normalizeMiniProgramOutputImportRequest(request: string) {
  if (
    request.startsWith('.')
    || request.startsWith('/')
    || /^(?:[a-z][a-z\d+.-]*:|#)/i.test(request)
  ) {
    return request
  }
  return `./${request}`
}

export function normalizeMiniProgramImportShell(css: string) {
  return css.replace(MINI_PROGRAM_OUTPUT_IMPORT_RE, (_match, prefix: string, quote: string, request: string, suffix: string) => {
    return `${prefix}${quote}${normalizeMiniProgramOutputImportRequest(request)}${quote}${suffix}`
  })
}

function normalizeOutputPath(file: string) {
  const segments: string[] = []
  for (const segment of file.replace(/\\/g, '/').replace(/^\/+/, '').split('/')) {
    if (!segment || segment === '.') {
      continue
    }
    if (segment === '..') {
      if (segments.length > 0 && segments[segments.length - 1] !== '..') {
        segments.pop()
      }
      else {
        segments.push(segment)
      }
      continue
    }
    segments.push(segment)
  }
  return segments.join('/')
}

function splitRequestSuffix(request: string) {
  const queryIndex = request.indexOf('?')
  const hashIndex = request.indexOf('#')
  const suffixIndexCandidates = [queryIndex, hashIndex].filter(index => index >= 0)
  const suffixIndex = suffixIndexCandidates.length > 0 ? Math.min(...suffixIndexCandidates) : -1
  return suffixIndex < 0 ? request : request.slice(0, suffixIndex)
}

function resolveOutputImportRequest(file: string, request: string) {
  const cleanRequest = splitRequestSuffix(request.replace(/\\/g, '/'))
  if (cleanRequest.startsWith('/')) {
    return normalizeOutputPath(cleanRequest)
  }
  const normalizedFile = normalizeOutputPath(file)
  const baseDir = normalizedFile.includes('/')
    ? normalizedFile.slice(0, normalizedFile.lastIndexOf('/'))
    : ''
  return normalizeOutputPath(baseDir ? `${baseDir}/${cleanRequest}` : cleanRequest)
}

function isMiniProgramOutputImport(node: Node) {
  if (node.type !== 'atrule' || node.name !== 'import') {
    return false
  }
  const request = parseImportRequest(node.params)
  return request !== undefined
    && MINI_PROGRAM_OUTPUT_STYLE_RE.test(request)
}

function isSelfMiniProgramOutputImport(outputFile: string, node: Node) {
  if (!isMiniProgramOutputImport(node) || node.type !== 'atrule') {
    return false
  }
  const request = parseImportRequest(node.params)
  return request !== undefined
    && resolveOutputImportRequest(outputFile, request) === normalizeOutputPath(outputFile)
}

function removeMiniProgramOutputImportsBy(css: string, predicate: (node: Node) => boolean) {
  if (!css.includes('@import')) {
    return css
  }
  try {
    const root = postcss.parse(css)
    let changed = false
    root.walk((node) => {
      if (predicate(node)) {
        node.remove()
        changed = true
      }
    })
    return changed ? root.toString() : css
  }
  catch {
    return css
  }
}

export function removeSelfMiniProgramOutputImports(css: string, outputFile: string) {
  return removeMiniProgramOutputImportsBy(css, node => isSelfMiniProgramOutputImport(outputFile, node))
}

export function removeMiniProgramOutputImports(css: string) {
  return removeMiniProgramOutputImportsBy(css, isMiniProgramOutputImport)
}

export function normalizeMiniProgramGeneratorCssSource(css: string, outputFile?: string | undefined) {
  const normalized = normalizeMiniProgramImportShell(css)
  if (outputFile) {
    return removeSelfMiniProgramOutputImports(normalized, outputFile)
  }
  return isPureLocalCssImportWrapper(normalized)
    ? normalized
    : removeMiniProgramOutputImports(normalized)
}
