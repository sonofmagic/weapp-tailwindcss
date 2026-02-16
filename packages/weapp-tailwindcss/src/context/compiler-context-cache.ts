import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import process from 'node:process'
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

function detectCallerLocation() {
  const stack = new Error('compiler-context-cache stack probe').stack
  if (!stack) {
    return undefined
  }

  const lines = stack.split('\n')
  for (const line of lines) {
    const match = line.match(/\(([^)]+)\)/u) ?? line.match(/at\s+(\S.*)$/u)
    const location = match?.[1]
    if (!location) {
      continue
    }

    const candidatePath = location.replace(/:\d+(?::\d+)?$/u, '')
    if (!candidatePath || !path.isAbsolute(candidatePath)) {
      continue
    }

    // Skip internal weapp-tailwindcss call frames to keep caller hint stable across wrappers.
    if (
      candidatePath.includes(`${path.sep}weapp-tailwindcss${path.sep}src${path.sep}`)
      || candidatePath.includes(`${path.sep}weapp-tailwindcss${path.sep}dist${path.sep}`)
      || candidatePath.includes(`${path.sep}node_modules${path.sep}weapp-tailwindcss${path.sep}`)
    ) {
      continue
    }

    return candidatePath
  }

  return undefined
}

function getRuntimeCacheScope() {
  return {
    cwd: process.cwd(),
    npm_package_json: process.env.npm_package_json,
    npm_config_local_prefix: process.env.npm_config_local_prefix,
    pnpm_package_name: process.env.PNPM_PACKAGE_NAME,
    init_cwd: process.env.INIT_CWD,
    pwd: process.env.PWD,
    weapp_tailwindcss_basedir: process.env.WEAPP_TAILWINDCSS_BASEDIR,
    weapp_tailwindcss_base_dir: process.env.WEAPP_TAILWINDCSS_BASE_DIR,
    tailwindcss_basedir: process.env.TAILWINDCSS_BASEDIR,
    tailwindcss_base_dir: process.env.TAILWINDCSS_BASE_DIR,
    uni_input_dir: process.env.UNI_INPUT_DIR,
    uni_input_root: process.env.UNI_INPUT_ROOT,
    uni_cli_root: process.env.UNI_CLI_ROOT,
    uni_app_input_dir: process.env.UNI_APP_INPUT_DIR,
    caller: detectCallerLocation(),
  }
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
    const normalized = normalizeOptionsValue({
      options: opts ?? {},
      runtime: getRuntimeCacheScope(),
    })
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
