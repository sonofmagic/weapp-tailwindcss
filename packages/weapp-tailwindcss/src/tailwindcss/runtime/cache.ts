import type { TailwindcssPatcherLike } from '@/types'
import { statSync } from 'node:fs'

interface RuntimeClassSetCacheEntry {
  value?: Set<string>
  promise?: Promise<Set<string>>
  signature?: string
}

const runtimeClassSetCache = new WeakMap<TailwindcssPatcherLike, RuntimeClassSetCacheEntry>()

function getCacheEntry(twPatcher: TailwindcssPatcherLike) {
  let entry = runtimeClassSetCache.get(twPatcher)
  if (!entry) {
    entry = {}
    runtimeClassSetCache.set(twPatcher, entry)
  }
  return entry
}

function getTailwindConfigSignature(twPatcher: TailwindcssPatcherLike): string | undefined {
  const configPath = twPatcher.options?.tailwind?.config
  if (typeof configPath !== 'string' || configPath.length === 0) {
    return undefined
  }
  try {
    const stats = statSync(configPath)
    return `${configPath}:${stats.size}:${stats.mtimeMs}`
  }
  catch {
    return `${configPath}:missing`
  }
}

export function invalidateRuntimeClassSet(twPatcher?: TailwindcssPatcherLike) {
  if (!twPatcher) {
    return
  }
  runtimeClassSetCache.delete(twPatcher)
}

export function getRuntimeClassSetCacheEntry(twPatcher: TailwindcssPatcherLike) {
  return getCacheEntry(twPatcher)
}

export function getRuntimeClassSetSignature(twPatcher: TailwindcssPatcherLike) {
  return getTailwindConfigSignature(twPatcher)
}
