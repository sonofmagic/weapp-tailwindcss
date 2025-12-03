import type { AppType } from '@/types'

const MPX_STYLE_RESOURCE_QUERY_RE = /(?:\?|&)type=styles\b/

export function getCacheKey(filename: string) {
  return filename
}

export function stripResourceQuery(resource?: string): string | undefined {
  if (typeof resource !== 'string') {
    return resource
  }
  const queryIndex = resource.indexOf('?')
  if (queryIndex !== -1) {
    return resource.slice(0, queryIndex)
  }
  const hashIndex = resource.indexOf('#')
  if (hashIndex !== -1) {
    return resource.slice(0, hashIndex)
  }
  return resource
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
