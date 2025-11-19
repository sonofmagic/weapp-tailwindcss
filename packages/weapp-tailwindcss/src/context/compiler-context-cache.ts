import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { Buffer } from 'node:buffer'
import { logger } from '@weapp-tailwindcss/logger'
import { md5Hash } from '@/cache/md5'

type NormalizedOptionsPrimitive = string | number | boolean | null
interface NormalizedOptionsArray extends Array<NormalizedOptionsValue> {}
interface NormalizedOptionsRecord {
  [key: string]: NormalizedOptionsValue
}
type NormalizedOptionsValue
  = | NormalizedOptionsPrimitive
    | NormalizedOptionsArray
    | NormalizedOptionsRecord

interface GlobalCompilerContextCacheHolder {
  __WEAPP_TW_COMPILER_CONTEXT_CACHE__?: Map<string, InternalUserDefinedOptions>
}

const globalCacheHolder = globalThis as GlobalCompilerContextCacheHolder
const compilerContextCache: Map<string, InternalUserDefinedOptions> = globalCacheHolder.__WEAPP_TW_COMPILER_CONTEXT_CACHE__
  ?? (globalCacheHolder.__WEAPP_TW_COMPILER_CONTEXT_CACHE__ = new Map())

function compareNormalizedValues(a: NormalizedOptionsValue, b: NormalizedOptionsValue) {
  const aStr = JSON.stringify(a)
  const bStr = JSON.stringify(b)
  return aStr.localeCompare(bStr)
}

function withCircularGuard<T extends object>(
  value: T,
  stack: WeakSet<object>,
  factory: () => NormalizedOptionsValue,
): NormalizedOptionsValue {
  if (stack.has(value)) {
    throw new TypeError('Cannot serialize circular structure in compiler context options')
  }
  stack.add(value)
  try {
    return factory()
  }
  finally {
    stack.delete(value)
  }
}

function encodeTaggedValue(type: string, value?: NormalizedOptionsValue): Record<string, NormalizedOptionsValue> {
  const record: Record<string, NormalizedOptionsValue> = { __type: type }
  if (value !== undefined) {
    record.value = value
  }
  return record
}

function normalizeOptionsValue(
  rawValue: unknown,
  stack: WeakSet<object> = new WeakSet<object>(),
): NormalizedOptionsValue {
  if (rawValue === null) {
    return null
  }
  if (rawValue === undefined) {
    return encodeTaggedValue('Undefined')
  }

  const type = typeof rawValue
  if (type === 'string') {
    return rawValue as string
  }
  if (type === 'boolean') {
    return rawValue as boolean
  }
  if (type === 'number') {
    const numericValue = rawValue as number
    if (Number.isNaN(numericValue)) {
      return encodeTaggedValue('Number', 'NaN')
    }
    if (!Number.isFinite(numericValue)) {
      return encodeTaggedValue('Number', numericValue > 0 ? 'Infinity' : '-Infinity')
    }
    if (Object.is(numericValue, -0)) {
      return encodeTaggedValue('Number', '-0')
    }
    return numericValue
  }
  if (type === 'bigint') {
    return encodeTaggedValue('BigInt', (rawValue as bigint).toString())
  }
  if (type === 'symbol') {
    const symbolValue = rawValue as symbol
    return encodeTaggedValue('Symbol', symbolValue.description ?? String(symbolValue))
  }
  if (type === 'function') {
    return encodeTaggedValue('Function', (rawValue as (...args: unknown[]) => unknown).toString())
  }

  if (Array.isArray(rawValue)) {
    return withCircularGuard(rawValue, stack, () => rawValue.map(item => normalizeOptionsValue(item, stack)))
  }
  if (rawValue instanceof Date) {
    return encodeTaggedValue('Date', rawValue.toISOString())
  }
  if (rawValue instanceof RegExp) {
    return {
      __type: 'RegExp',
      source: rawValue.source,
      flags: rawValue.flags,
    } as Record<string, NormalizedOptionsValue>
  }
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(rawValue)) {
    return encodeTaggedValue('Buffer', (rawValue as Buffer).toString('base64'))
  }
  if (ArrayBuffer.isView(rawValue)) {
    const view = rawValue as ArrayBufferView
    const buffer = Buffer.from(view.buffer, view.byteOffset, view.byteLength)
    return encodeTaggedValue(view.constructor?.name ?? 'ArrayBufferView', buffer.toString('base64'))
  }
  if (rawValue instanceof ArrayBuffer) {
    return encodeTaggedValue('ArrayBuffer', Buffer.from(rawValue).toString('base64'))
  }
  if (rawValue instanceof Set) {
    return withCircularGuard(rawValue, stack, () => {
      const normalizedEntries = Array.from(rawValue, element => normalizeOptionsValue(element, stack))
      normalizedEntries.sort(compareNormalizedValues)
      return {
        __type: 'Set',
        value: normalizedEntries,
      }
    }) as Record<string, NormalizedOptionsValue>
  }
  if (rawValue instanceof Map) {
    return withCircularGuard(rawValue, stack, () => {
      const normalizedEntries = Array.from(rawValue.entries()).map(([key, entryValue]) => ({
        key: normalizeOptionsValue(key, stack),
        value: normalizeOptionsValue(entryValue, stack),
      }))
      normalizedEntries.sort((a, b) => compareNormalizedValues(a.key, b.key))
      return {
        __type: 'Map',
        value: normalizedEntries.map(entry => [entry.key, entry.value]),
      }
    }) as Record<string, NormalizedOptionsValue>
  }
  if (typeof URL !== 'undefined' && rawValue instanceof URL) {
    return encodeTaggedValue('URL', rawValue.toString())
  }
  if (rawValue instanceof Error) {
    const errorValue = rawValue as Error
    return {
      __type: 'Error',
      name: errorValue.name,
      message: errorValue.message,
      stack: errorValue.stack ?? '',
    } as Record<string, NormalizedOptionsValue>
  }
  if (rawValue instanceof Promise) {
    return encodeTaggedValue('Promise')
  }
  if (rawValue instanceof WeakMap) {
    return encodeTaggedValue('WeakMap')
  }
  if (rawValue instanceof WeakSet) {
    return encodeTaggedValue('WeakSet')
  }
  if (rawValue && typeof rawValue === 'object') {
    return withCircularGuard(rawValue as Record<string, unknown>, stack, () => {
      const result: Record<string, NormalizedOptionsValue> = {}
      const entries = Object.entries(rawValue as Record<string, unknown>)
      entries.sort(([a], [b]) => a.localeCompare(b))
      for (const [key, entryValue] of entries) {
        result[key] = normalizeOptionsValue(entryValue, stack)
      }
      return result
    })
  }
  return encodeTaggedValue(typeof rawValue, String(rawValue))
}

export function createCompilerContextCacheKey(opts?: UserDefinedOptions): string | undefined {
  try {
    const normalized = normalizeOptionsValue(opts ?? {})
    const serialized = JSON.stringify(normalized)
    return md5Hash(serialized)
  }
  catch (error) {
    logger.debug('skip compiler context cache: %O', error)
    return undefined
  }
}

export function withCompilerContextCache(
  opts: UserDefinedOptions | undefined,
  factory: () => InternalUserDefinedOptions,
): InternalUserDefinedOptions {
  const cacheKey = createCompilerContextCacheKey(opts)
  if (cacheKey) {
    const cached = compilerContextCache.get(cacheKey)
    if (cached) {
      return cached
    }
  }

  const ctx = factory()
  if (cacheKey) {
    compilerContextCache.set(cacheKey, ctx)
  }
  return ctx
}
