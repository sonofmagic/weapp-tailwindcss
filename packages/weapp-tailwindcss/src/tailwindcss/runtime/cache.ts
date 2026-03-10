import type { TailwindcssPatcherLike } from '@/types'
import { statSync } from 'node:fs'

interface RuntimeClassSetCacheEntry {
  value?: Set<string>
  promise?: Promise<Set<string>>
  signature?: string
}

const runtimeClassSetCache = new WeakMap<TailwindcssPatcherLike, RuntimeClassSetCacheEntry>()
const runtimeConfigSignatureCache = new Map<string, string>()
let runtimeConfigSignatureCacheClearTimer: ReturnType<typeof setTimeout> | undefined

function getCacheEntry(twPatcher: TailwindcssPatcherLike) {
  let entry = runtimeClassSetCache.get(twPatcher)
  if (!entry) {
    entry = {}
    runtimeClassSetCache.set(twPatcher, entry)
  }
  return entry
}

function scheduleRuntimeConfigSignatureCacheClear() {
  if (runtimeConfigSignatureCacheClearTimer) {
    return
  }

  // 仅在当前事件循环内复用 config 签名，避免同一热路径重复 statSync。
  // 下一轮事件循环自动清空，以保留后续增量构建对配置变更的探测能力。
  runtimeConfigSignatureCacheClearTimer = setTimeout(() => {
    runtimeConfigSignatureCache.clear()
    runtimeConfigSignatureCacheClearTimer = undefined
  }, 0)
  runtimeConfigSignatureCacheClearTimer.unref?.()
}

function getTailwindConfigSignature(twPatcher: TailwindcssPatcherLike): string | undefined {
  const configPath = twPatcher.options?.tailwind?.config
  if (typeof configPath !== 'string' || configPath.length === 0) {
    return undefined
  }

  const cached = runtimeConfigSignatureCache.get(configPath)
  if (cached !== undefined) {
    return cached
  }

  let signature: string
  try {
    const stats = statSync(configPath)
    signature = `${configPath}:${stats.size}:${stats.mtimeMs}`
  }
  catch {
    signature = `${configPath}:missing`
  }
  runtimeConfigSignatureCache.set(configPath, signature)
  scheduleRuntimeConfigSignatureCacheClear()
  return signature
}

function getPatchTargetSignature(twPatcher: TailwindcssPatcherLike) {
  const packageInfo = twPatcher.packageInfo
  return `${packageInfo?.rootPath ?? 'missing'}:${packageInfo?.version ?? 'unknown'}:${twPatcher.majorVersion ?? 'unknown'}`
}

export function invalidateRuntimeClassSet(twPatcher?: TailwindcssPatcherLike) {
  if (!twPatcher) {
    return
  }
  const configPath = twPatcher.options?.tailwind?.config
  if (typeof configPath === 'string' && configPath.length > 0) {
    runtimeConfigSignatureCache.delete(configPath)
  }
  runtimeClassSetCache.delete(twPatcher)
}

export function getRuntimeClassSetCacheEntry(twPatcher: TailwindcssPatcherLike) {
  return getCacheEntry(twPatcher)
}

export function getRuntimeClassSetSignature(twPatcher: TailwindcssPatcherLike) {
  const configSignature = getTailwindConfigSignature(twPatcher) ?? 'config:missing'
  const patchTargetSignature = getPatchTargetSignature(twPatcher)
  return `${configSignature}|patch:${patchTargetSignature}`
}
