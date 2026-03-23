import type { TailwindcssPatcherLike } from '@/types'
import { statSync } from 'node:fs'
import { resolveTailwindcssOptions } from '@/tailwindcss/patcher-options'

interface RuntimeClassSetCacheEntry {
  value?: Set<string>
  promise?: Promise<Set<string>>
  signature?: string
}

const runtimeClassSetCache = new WeakMap<TailwindcssPatcherLike, RuntimeClassSetCacheEntry>()
const runtimeFileSignatureCache = new Map<string, string>()
let runtimeFileSignatureCacheClearTimer: ReturnType<typeof setTimeout> | undefined

export const runtimeSignaturePatchersSymbol = Symbol.for('weapp-tailwindcss.runtimeSignaturePatchers')

function getCacheEntry(twPatcher: TailwindcssPatcherLike) {
  let entry = runtimeClassSetCache.get(twPatcher)
  if (!entry) {
    entry = {}
    runtimeClassSetCache.set(twPatcher, entry)
  }
  return entry
}

function scheduleRuntimeConfigSignatureCacheClear() {
  if (runtimeFileSignatureCacheClearTimer) {
    return
  }

  // 仅在当前事件循环内复用文件签名，避免同一热路径重复 statSync。
  // 下一轮事件循环自动清空，以保留后续增量构建对配置变更的探测能力。
  runtimeFileSignatureCacheClearTimer = setTimeout(() => {
    runtimeFileSignatureCache.clear()
    runtimeFileSignatureCacheClearTimer = undefined
  }, 0)
  runtimeFileSignatureCacheClearTimer.unref?.()
}

function getFileSignature(filePath: string) {
  const cached = runtimeFileSignatureCache.get(filePath)
  if (cached !== undefined) {
    return cached
  }

  let signature: string
  try {
    const stats = statSync(filePath)
    signature = `${filePath}:${stats.size}:${stats.mtimeMs}`
  }
  catch {
    signature = `${filePath}:missing`
  }
  runtimeFileSignatureCache.set(filePath, signature)
  scheduleRuntimeConfigSignatureCacheClear()
  return signature
}

function getTailwindTrackedFiles(twPatcher: TailwindcssPatcherLike) {
  const tailwindOptions = resolveTailwindcssOptions(twPatcher.options)
  const tracked = new Set<string>()
  const configPath = tailwindOptions?.config
  if (typeof configPath === 'string' && configPath.length > 0) {
    tracked.add(configPath)
  }
  for (const entry of tailwindOptions?.v4?.cssEntries ?? []) {
    if (typeof entry === 'string' && entry.length > 0) {
      tracked.add(entry)
    }
  }
  return tracked
}

function normalizeSignatureValue(value: unknown): string {
  if (value == null) {
    return 'null'
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map(item => normalizeSignatureValue(item)).join(',')}]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
    return `{${entries.map(([key, item]) => `${key}:${normalizeSignatureValue(item)}`).join(',')}}`
  }
  return String(value)
}

function getTailwindOptionsSignature(twPatcher: TailwindcssPatcherLike) {
  const options = twPatcher.options
  const tailwindOptions = resolveTailwindcssOptions(options)
  return normalizeSignatureValue({
    projectRoot: options?.projectRoot,
    packageName: tailwindOptions?.packageName,
    versionHint: tailwindOptions?.versionHint,
    cwd: tailwindOptions?.cwd,
    config: tailwindOptions?.config,
    v2: tailwindOptions?.v2,
    v3: tailwindOptions?.v3,
    v4: {
      base: tailwindOptions?.v4?.base,
      configuredBase: tailwindOptions?.v4?.configuredBase,
      css: tailwindOptions?.v4?.css,
      cssEntries: tailwindOptions?.v4?.cssEntries,
      hasUserDefinedSources: tailwindOptions?.v4?.hasUserDefinedSources,
      sources: tailwindOptions?.v4?.sources,
    },
  })
}

function getPatchTargetSignature(twPatcher: TailwindcssPatcherLike) {
  const packageInfo = twPatcher.packageInfo
  return [
    packageInfo?.name ?? 'missing',
    packageInfo?.rootPath ?? 'missing',
    packageInfo?.version ?? 'unknown',
    twPatcher.majorVersion ?? 'unknown',
    getTailwindOptionsSignature(twPatcher),
  ].join(':')
}

function getNestedPatchers(twPatcher: TailwindcssPatcherLike) {
  const nested = (twPatcher as TailwindcssPatcherLike & {
    [runtimeSignaturePatchersSymbol]?: TailwindcssPatcherLike[]
  })[runtimeSignaturePatchersSymbol]
  return Array.isArray(nested) && nested.length > 0 ? nested : undefined
}

function getOwnRuntimeClassSetSignature(twPatcher: TailwindcssPatcherLike) {
  const trackedFiles = [...getTailwindTrackedFiles(twPatcher)]
    .sort((a, b) => a.localeCompare(b))
    .map(getFileSignature)
  const configSignature = trackedFiles.length > 0 ? trackedFiles.join('|') : 'files:missing'
  const patchTargetSignature = getPatchTargetSignature(twPatcher)
  return `${configSignature}|patch:${patchTargetSignature}`
}

export function invalidateRuntimeClassSet(twPatcher?: TailwindcssPatcherLike) {
  if (!twPatcher) {
    return
  }
  const nestedPatchers = getNestedPatchers(twPatcher)
  if (nestedPatchers) {
    for (const patcher of nestedPatchers) {
      invalidateRuntimeClassSet(patcher)
    }
  }
  for (const trackedFile of getTailwindTrackedFiles(twPatcher)) {
    runtimeFileSignatureCache.delete(trackedFile)
  }
  runtimeClassSetCache.delete(twPatcher)
}

export function getRuntimeClassSetCacheEntry(twPatcher: TailwindcssPatcherLike) {
  return getCacheEntry(twPatcher)
}

export function getRuntimeClassSetSignature(twPatcher: TailwindcssPatcherLike) {
  const nestedPatchers = getNestedPatchers(twPatcher)
  if (nestedPatchers) {
    return nestedPatchers
      .map(getOwnRuntimeClassSetSignature)
      .sort((a, b) => a.localeCompare(b))
      .join('||')
  }
  return getOwnRuntimeClassSetSignature(twPatcher)
}
