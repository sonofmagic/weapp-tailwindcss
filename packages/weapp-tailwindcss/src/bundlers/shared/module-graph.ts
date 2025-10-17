import path from 'node:path'

const QUERY_HASH_RE = /[?#].*$/u
const PROTOCOL_RE = /^[a-z][a-z+.-]*:/iu
const VIRTUAL_PREFIX = '\u0000'
const JS_EXTENSIONS = ['.js', '.mjs', '.cjs']

export function stripQueryAndHash(specifier: string): string {
  return specifier.replace(QUERY_HASH_RE, '')
}

export function isResolvableSpecifier(specifier: string): boolean {
  if (!specifier) {
    return false
  }
  const normalized = stripQueryAndHash(specifier)
  if (normalized.startsWith(VIRTUAL_PREFIX)) {
    return false
  }
  return !PROTOCOL_RE.test(normalized)
}

export function toAbsoluteOutputPath(fileName: string, outDir: string): string {
  if (path.isAbsolute(fileName)) {
    return fileName
  }
  return path.resolve(outDir, fileName)
}

function matchWithExtensions(candidate: string, hasOutput: (value: string) => boolean): string | undefined {
  if (hasOutput(candidate)) {
    return candidate
  }
  if (!path.extname(candidate)) {
    for (const ext of JS_EXTENSIONS) {
      const extended = `${candidate}${ext}`
      if (hasOutput(extended)) {
        return extended
      }
    }
  }
  return undefined
}

export function resolveOutputSpecifier(
  specifier: string,
  importer: string,
  outDir: string,
  hasOutput: (value: string) => boolean,
): string | undefined {
  if (!isResolvableSpecifier(specifier)) {
    return undefined
  }

  const normalized = stripQueryAndHash(specifier)

  let candidate: string
  if (path.isAbsolute(normalized)) {
    candidate = normalized
  }
  else if (normalized.startsWith('/')) {
    candidate = path.resolve(outDir, normalized.slice(1))
  }
  else {
    candidate = path.resolve(path.dirname(importer), normalized)
  }

  return matchWithExtensions(candidate, hasOutput)
}
