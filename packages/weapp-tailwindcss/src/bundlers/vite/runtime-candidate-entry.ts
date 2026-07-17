import type { OutputAsset, OutputChunk } from 'rollup'
import type { RuntimeEntryType } from '@/compiler'

const VENDOR_CHUNK_BASENAME_RE = /^(?:vendor|vendors|chunk-vendors|common_vendor)(?:[.-]|$)/i
const COMMON_VENDOR_CHUNK_RE = /^(?:common|static|assets|chunks?)\/(?:vendor|vendors|chunk-vendors|common_vendor|runtime)(?:[.-]|$)/i

interface RuntimeCandidateBundleEntry {
  file: string
  output: OutputAsset | OutputChunk
  type: RuntimeEntryType
}

function toPosixPath(value: string) {
  return value.split('\\').join('/')
}

function isDependencyModuleId(id: string) {
  const normalized = toPosixPath(id)
  return normalized.includes('/node_modules/')
    || normalized.includes('/.pnpm/')
    || normalized.includes('/node_modules_')
}

function collectChunkModuleIds(output: OutputChunk) {
  return [
    ...output.moduleIds ?? [],
    ...Object.keys(output.modules ?? {}),
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

function isDependencyOnlyChunk(output: OutputChunk) {
  if (output.isEntry || output.isDynamicEntry || output.isImplicitEntry) {
    return false
  }
  const moduleIds = collectChunkModuleIds(output)
  return moduleIds.length > 0 && moduleIds.every(isDependencyModuleId)
}

export function isRuntimeCandidateBundleEntry(entry: RuntimeCandidateBundleEntry) {
  if (entry.type === 'html') {
    return true
  }
  if (entry.type !== 'js') {
    return false
  }
  if (entry.output.type === 'chunk' && isDependencyOnlyChunk(entry.output)) {
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
  return collectChunkModuleIds(entry.output).some(id => !isDependencyModuleId(id))
}
