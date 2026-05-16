const SOURCE_STYLE_EXT_RE = /\.(?:css|scss|sass|less|styl|stylus|pcss|postcss)$/i
const STYLE_QUERY_RE = /(?:^|&)type=styles?(?:&|$)/
const STYLE_LANG_QUERY_RE = /(?:^|&)lang(?:[.=](?:css|scss|sass|less|styl|stylus|pcss|postcss))?(?:&|$)/

function stripHash(request: string) {
  const hashIndex = request.indexOf('#')
  return hashIndex === -1 ? request : request.slice(0, hashIndex)
}

export function stripRequestQuery(request: string) {
  const normalized = stripHash(request)
  const queryIndex = normalized.indexOf('?')
  return queryIndex === -1 ? normalized : normalized.slice(0, queryIndex)
}

export function isSourceStyleRequest(request: string | undefined) {
  if (typeof request !== 'string' || request.length === 0) {
    return false
  }
  const normalized = stripHash(request)
  const queryIndex = normalized.indexOf('?')
  const pathname = queryIndex === -1 ? normalized : normalized.slice(0, queryIndex)
  if (SOURCE_STYLE_EXT_RE.test(pathname)) {
    return true
  }
  if (queryIndex === -1) {
    return false
  }
  const query = normalized.slice(queryIndex + 1)
  return STYLE_QUERY_RE.test(query) || STYLE_LANG_QUERY_RE.test(query)
}
