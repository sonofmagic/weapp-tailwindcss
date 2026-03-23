import fs from 'node:fs/promises'
import path from 'pathe'
import prettier from 'prettier'

export interface CssSnapshotEntry {
  fileName: string
  content: string
}

async function exists(target: string) {
  try {
    await fs.access(target)
    return true
  }
  catch {
    return false
  }
}

export function sanitizeImportRequest(request: string): string {
  const withoutQuery = request.split('?')[0] ?? ''
  const withoutHash = withoutQuery.split('#')[0] ?? ''
  return withoutHash.trim()
}

const PATH_SEPARATOR_RE = /[/\\]+/
const HASH_IN_FILENAME_RE = /[.-]?[a-f0-9]{8}(?=\.[^.]+$)/i

export function stripHashFromFilename(name: string): string {
  const segments = name.split(PATH_SEPARATOR_RE)
  const normalizedSegments = segments.map((segment, index) => {
    if (index !== segments.length - 1) {
      return segment
    }
    return segment.replace(HASH_IN_FILENAME_RE, '')
  })
  return normalizedSegments.join(path.sep)
}

export function normalizeSnapshotName(name: string): string | undefined {
  const segments = name.split(PATH_SEPARATOR_RE).filter(segment => segment.length > 0 && segment !== '.')
  if (segments.length === 0) {
    return undefined
  }
  const normalizedSegments = segments.map(stripHashFromFilename)
  return normalizedSegments.join(path.sep)
}

export function safeRelative(from: string, to: string): string | undefined {
  const relativePath = path.relative(from, to)
  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return undefined
  }
  return relativePath
}

const PROTOCOL_RE = /^(?:https?:)?\/\//i
const BACKSLASH_RE = /\\/g

export function resolveCssImport(projectRoot: string, fromFile: string, request: string): string | undefined {
  const cleaned = sanitizeImportRequest(request)
  if (!cleaned || cleaned.startsWith('~')) {
    return undefined
  }
  if (PROTOCOL_RE.test(cleaned) || cleaned.startsWith('data:')) {
    return undefined
  }

  const fromDir = path.dirname(fromFile)
  const normalizedRequest = cleaned.replace(BACKSLASH_RE, '/')

  const target = normalizedRequest.startsWith('/')
    ? path.resolve(projectRoot, `.${normalizedRequest}`)
    : path.resolve(fromDir, normalizedRequest)

  return target
}

export function computeSnapshotName(projectRoot: string, fromFile: string, targetFile: string): string | undefined {
  const fromDir = path.dirname(fromFile)

  const relativeFromCurrent = safeRelative(fromDir, targetFile)
  if (relativeFromCurrent) {
    const normalized = normalizeSnapshotName(relativeFromCurrent)
    if (normalized) {
      return normalized
    }
  }

  const relativeFromProject = safeRelative(projectRoot, targetFile)
  if (relativeFromProject) {
    const normalized = normalizeSnapshotName(relativeFromProject)
    if (normalized) {
      return normalized
    }
  }

  return stripHashFromFilename(path.basename(targetFile))
}

const CSS_IMPORT_EXTRACT_RE = /@import\s+(?:url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^"'()\s]+))\s*\)?/gi

export function extractCssImports(source: string): string[] {
  const pattern = new RegExp(CSS_IMPORT_EXTRACT_RE.source, CSS_IMPORT_EXTRACT_RE.flags)
  const imports: string[] = []
  while (true) {
    const match = pattern.exec(source)
    if (!match) {
      break
    }
    const request = (match[1] ?? match[2] ?? match[3] ?? '').trim()
    if (request.length === 0) {
      continue
    }
    imports.push(request)
  }
  return imports
}

export const TAILWIND_BANNER = /^\s*\/\*! tailwindcss v[\d.]+ \| MIT License \| https:\/\/tailwindcss\.com \*\/\s*/i

export function stripTailwindBanner(source: string) {
  return source.replace(TAILWIND_BANNER, '')
}

const CSS_IMPORT_NORMALIZE_RE = /@import\s+(url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^"'()\s]+))(\s*\))?/gi

export function normalizeCssImports(source: string) {
  const pattern = new RegExp(CSS_IMPORT_NORMALIZE_RE.source, CSS_IMPORT_NORMALIZE_RE.flags)
  return source.replace(pattern, (match, urlPrefix, d1, d2, d3, urlSuffix = '') => {
    const request = (d1 ?? d2 ?? d3 ?? '').trim()
    if (request.length === 0) {
      return match
    }
    const cleaned = sanitizeImportRequest(request)
    const normalizedRequest = stripHashFromFilename(cleaned)
    if (normalizedRequest === request) {
      return match
    }
    const quote = d1 !== undefined ? '"' : d2 !== undefined ? '\'' : ''
    const prefix = urlPrefix ?? ''
    const suffix = urlSuffix ?? ''
    return `@import ${prefix}${quote}${normalizedRequest}${quote}${suffix}`
  })
}

export async function formatCss(css: string) {
  return prettier.format(css, {
    parser: 'css',
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    endOfLine: 'lf',
    trailingComma: 'none',
    printWidth: 180,
    bracketSameLine: true,
    htmlWhitespaceSensitivity: 'ignore',
  })
}

export async function collectCssSnapshots(projectRoot: string, cssRelativePath: string): Promise<CssSnapshotEntry[]> {
  const rootCssPath = path.resolve(projectRoot, cssRelativePath)
  const visited = new Set<string>()
  const snapshots: CssSnapshotEntry[] = []

  async function visit(targetPath: string, snapshotName: string) {
    const normalizedPath = path.normalize(targetPath)
    if (visited.has(normalizedPath)) {
      return
    }

    if (!(await exists(normalizedPath))) {
      return
    }

    visited.add(normalizedPath)

    const source = await fs.readFile(normalizedPath, 'utf8')
    const withoutBanner = stripTailwindBanner(source)
    const normalizedImports = normalizeCssImports(withoutBanner)
    const formatted = await formatCss(normalizedImports)

    snapshots.push({
      fileName: snapshotName,
      content: formatted,
    })

    const imports = extractCssImports(withoutBanner)
    for (const request of imports) {
      const resolved = resolveCssImport(projectRoot, normalizedPath, request)
      if (!resolved) {
        continue
      }
      const nextSnapshotName = computeSnapshotName(projectRoot, normalizedPath, resolved)
      if (!nextSnapshotName) {
        continue
      }
      await visit(resolved, nextSnapshotName)
    }
  }

  await visit(rootCssPath, path.basename(cssRelativePath))
  return snapshots
}
