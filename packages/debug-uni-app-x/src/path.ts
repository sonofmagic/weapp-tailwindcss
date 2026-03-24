import path from 'pathe'

const HASH_RE = /#.*$/u
const INVALID_FS_CHARS_RE = /[<>:"|?*\0]/g
const BACKSLASH_RE = /\\/g
const VIRTUAL_MODULE_PREFIX = '\u0000'
const QUERY_SPLIT_RE = /\?/u
const NON_WORD_RE = /[^\w.-]+/g
const DUPLICATE_UNDERSCORE_RE = /_+/g
const TRIM_UNDERSCORE_RE = /^_+|_+$/g

function splitId(id: string) {
  const withoutHash = id.replace(HASH_RE, '')
  const [filename, query = ''] = withoutHash.split(QUERY_SPLIT_RE)
  return { filename, query }
}

function replaceVirtualPrefix(id: string) {
  return id.split(VIRTUAL_MODULE_PREFIX).join('virtual/')
}

/**
 * 将模块 id 转换为可落盘的相对路径，并保留 query 信息避免覆盖。
 */
export function toSafeRelativePath(id: string, cwd: string) {
  const { filename, query } = splitId(id)
  const devirtualized = replaceVirtualPrefix(filename)
  const normalized = path.normalize(devirtualized)
  const nodeModulesIndex = normalized.indexOf('node_modules')
  let candidate: string
  if (nodeModulesIndex > -1) {
    candidate = normalized.slice(nodeModulesIndex)
  }
  else if (path.isAbsolute(normalized)) {
    candidate = path.relative(cwd, normalized)
  }
  else {
    candidate = normalized
  }

  const sanitized = candidate
    .replace(BACKSLASH_RE, '/')
    .replace(INVALID_FS_CHARS_RE, '_')
  const segments = sanitized
    .split('/')
    .filter(segment => segment && segment !== '.' && segment !== '..')
  const basePath = segments.join('/') || 'virtual-module'
  if (!query) {
    return basePath
  }

  const querySuffix = query
    .replace(NON_WORD_RE, '_')
    .replace(DUPLICATE_UNDERSCORE_RE, '_')
    .replace(TRIM_UNDERSCORE_RE, '')

  return querySuffix ? `${basePath}__${querySuffix}` : basePath
}
