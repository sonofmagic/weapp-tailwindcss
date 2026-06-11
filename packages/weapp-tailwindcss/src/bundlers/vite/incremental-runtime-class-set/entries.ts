import type { BundleSnapshot, BundleStateEntry } from '../bundle-state'

const EXTENSION_DOT_PREFIX_RE = /^\./
const VENDOR_CHUNK_BASENAME_RE = /^(?:vendor|vendors|chunk-vendors|common_vendor)(?:[.-]|$)/i
const COMMON_VENDOR_CHUNK_RE = /^(?:common|static|assets|chunks?)\/(?:vendor|vendors|chunk-vendors|common_vendor|runtime)(?:[.-]|$)/i

function toPosixPath(value: string) {
  return value.split('\\').join('/')
}

function isDependencyModuleId(id: string) {
  const normalized = toPosixPath(id)
  return normalized.includes('/node_modules/')
    || normalized.includes('/.pnpm/')
    || normalized.includes('/node_modules_')
}

function collectChunkModuleIds(entry: BundleStateEntry) {
  if (entry.output.type !== 'chunk') {
    return []
  }
  return [
    ...entry.output.moduleIds,
    ...Object.keys(entry.output.modules ?? {}),
  ].filter((id, index, ids) => ids.indexOf(id) === index)
}

function isKnownVendorChunkFile(file: string) {
  const normalized = toPosixPath(file).replace(/^\.\//, '')
  const basename = normalized.slice(normalized.lastIndexOf('/') + 1)
  return VENDOR_CHUNK_BASENAME_RE.test(basename)
    || COMMON_VENDOR_CHUNK_RE.test(normalized)
    || normalized.includes('/node_modules/')
    || normalized.includes('/node_modules_')
}

function isDependencyOnlyChunk(entry: BundleStateEntry) {
  if (entry.output.type !== 'chunk') {
    return false
  }
  if (entry.output.isEntry || entry.output.isDynamicEntry || entry.output.isImplicitEntry) {
    return false
  }
  const moduleIds = collectChunkModuleIds(entry)
  return moduleIds.length > 0 && moduleIds.every(isDependencyModuleId)
}

function isRuntimeCandidateEntry(entry: BundleStateEntry) {
  if (entry.type === 'html') {
    return true
  }
  if (entry.type !== 'js') {
    return false
  }
  if (isDependencyOnlyChunk(entry)) {
    return false
  }
  if (!isKnownVendorChunkFile(entry.file)) {
    return true
  }
  if (entry.output.type !== 'chunk') {
    return false
  }
  if (entry.output.facadeModuleId && !isDependencyModuleId(entry.output.facadeModuleId)) {
    return true
  }
  return collectChunkModuleIds(entry).some(id => !isDependencyModuleId(id))
}

export function createRuntimeEntries(snapshot: BundleSnapshot) {
  return snapshot.entries.filter(isRuntimeCandidateEntry)
}

export function collectChangedRuntimeFiles(snapshot: BundleSnapshot) {
  return new Set<string>([
    ...snapshot.runtimeAffectingChangedByType.html,
    ...snapshot.runtimeAffectingChangedByType.js,
  ])
}

export function resolveEntryExtension(entry: BundleStateEntry) {
  if (entry.type === 'html') {
    return 'html'
  }
  const ext = entry.file.split(/[?#]/, 1)[0]?.split('.').pop()?.replace(EXTENSION_DOT_PREFIX_RE, '') ?? ''
  if (ext.length > 0) {
    return ext
  }
  return 'js'
}
