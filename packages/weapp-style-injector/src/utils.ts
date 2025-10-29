import type { PerFileImportResolver } from './core'

export function toArray<T>(value: T | T[] | null | undefined): Array<NonNullable<T>> {
  if (value == null) {
    return []
  }
  return (Array.isArray(value) ? value : [value]) as Array<NonNullable<T>>
}

export function mergePerFileResolvers(
  resolvers: Array<PerFileImportResolver | null | undefined>,
): PerFileImportResolver | undefined {
  const activeResolvers = resolvers.filter((resolver): resolver is PerFileImportResolver => typeof resolver === 'function')

  if (activeResolvers.length === 0) {
    return undefined
  }

  return (fileName: string) => activeResolvers.flatMap(resolver => toArray(resolver(fileName)))
}

export function ensurePosix(value: string): string {
  return value.replace(/\\/g, '/')
}

export function normalizeRoot(root: string): string {
  const trimmed = root.trim().replace(/^[./\\]+/, '').replace(/\\+/g, '/')
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

export function normalizeRelativeImport(target: string): string {
  if (target.startsWith('.') || target.startsWith('/')) {
    return target
  }
  return `./${target}`
}
