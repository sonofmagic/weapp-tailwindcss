import type { AppType } from '@/types'
import path from 'node:path'
import { isSourceStyleRequest, stripRequestQuery } from '@/bundlers/shared/style-requests'

const MPX_STYLE_RESOURCE_QUERY_RE = /(?:\?|&)type=styles\b/

export function getCacheKey(filename: string) {
  return filename
}

export function stripResourceQuery(resource?: string): string | undefined {
  if (typeof resource !== 'string') {
    return resource
  }
  return stripRequestQuery(resource)
}

export function isCssLikeModuleResource(
  resource: string | undefined,
  cssMatcher: (file: string) => boolean,
  appType?: AppType,
) {
  if (typeof resource !== 'string') {
    return false
  }
  const normalizedResource = stripResourceQuery(resource)
  if (normalizedResource && cssMatcher(normalizedResource)) {
    return true
  }
  if (isSourceStyleRequest(resource)) {
    return true
  }
  if (appType === 'mpx') {
    return MPX_STYLE_RESOURCE_QUERY_RE.test(resource)
  }
  return false
}

export function hasLoaderEntry(
  entries: Array<{ loader?: string }>,
  target?: string,
) {
  if (!target) {
    return false
  }
  return entries.some(entry => entry.loader?.includes?.(target))
}

interface ChunkLike {
  id?: string | number | null
  name?: string
  hash?: string | null
  files?: Iterable<string> | Array<string>
}

interface WebpackWatchChangeLike {
  modifiedFiles?: Set<string>
  removedFiles?: Set<string>
}

interface RuntimeWatchDependenciesLike {
  files?: Iterable<string>
  contexts?: Iterable<string>
}

function normalizeWatchPath(file: string) {
  return path.resolve(file)
}

function isFileInContext(file: string, context: string) {
  const relative = path.relative(normalizeWatchPath(context), normalizeWatchPath(file))
  return relative.length > 0 && !relative.startsWith('..') && !path.isAbsolute(relative)
}

function toChunkFiles(files: ChunkLike['files']) {
  if (!files) {
    return []
  }
  if (Array.isArray(files)) {
    return files
  }
  return [...files]
}

export function createAssetHashByChunkMap(chunks: Iterable<ChunkLike>) {
  const partsByFile = new Map<string, string[]>()

  for (const chunk of chunks) {
    const hash = typeof chunk.hash === 'string'
      ? chunk.hash
      : undefined
    if (!hash) {
      continue
    }

    const chunkId = String(chunk.id ?? chunk.name ?? '')
    for (const file of toChunkFiles(chunk.files)) {
      if (!file) {
        continue
      }
      let parts = partsByFile.get(file)
      if (!parts) {
        parts = []
        partsByFile.set(file, parts)
      }
      parts.push(`${chunkId}:${hash}`)
    }
  }

  const hashByFile = new Map<string, string>()
  for (const [file, parts] of partsByFile.entries()) {
    hashByFile.set(file, parts.sort().join('|'))
  }
  return hashByFile
}

export function createRuntimeAwareCssHash(
  assetHash: string | undefined,
  sourceHash: string,
  runtimeSetHash: string,
) {
  return `${assetHash ?? sourceHash}:${runtimeSetHash}`
}

export function hasWatchChanges(compiler: WebpackWatchChangeLike) {
  return (compiler.modifiedFiles?.size ?? 0) > 0
    || (compiler.removedFiles?.size ?? 0) > 0
}

export function isWatchFileInRuntimeDependencies(
  file: string,
  dependencies: RuntimeWatchDependenciesLike,
) {
  const normalizedFile = normalizeWatchPath(file)
  for (const dependency of dependencies.files ?? []) {
    if (normalizeWatchPath(dependency) === normalizedFile) {
      return true
    }
  }
  for (const context of dependencies.contexts ?? []) {
    if (isFileInContext(normalizedFile, context)) {
      return true
    }
  }
  return false
}
