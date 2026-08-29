import type { TailwindV4ResolvedSource } from '@/generator'
import { md5Hash } from '@/cache/md5'

function stableSerialize(value: unknown, stack = new WeakSet<object>()): string {
  if (value == null || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
    return JSON.stringify(value)
  }
  if (typeof value === 'function') {
    return `[Function:${value.name}]`
  }
  if (typeof value !== 'object') {
    return String(value)
  }
  if (stack.has(value)) {
    return '[Circular]'
  }
  stack.add(value)
  const serialized = Array.isArray(value)
    ? `[${value.map(item => stableSerialize(item, stack)).join(',')}]`
    : `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableSerialize((value as Record<string, unknown>)[key], stack)}`).join(',')}}`
  stack.delete(value)
  return serialized
}

export function createSourceFingerprint(source: TailwindV4ResolvedSource) {
  return createCompilerValueFingerprint(source)
}

export function createCompilerValueFingerprint(value: unknown) {
  return md5Hash(stableSerialize(value))
}
