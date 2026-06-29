import type { PerFileImportResolver } from './core'
import { toArray } from '@weapp-tailwindcss/shared'

export { ensurePosix, normalizeRelativeImport, normalizeRoot, toArray } from '@weapp-tailwindcss/shared'

export function mergePerFileResolvers(
  resolvers: Array<PerFileImportResolver | null | undefined>,
): PerFileImportResolver | undefined {
  const activeResolvers = resolvers.filter((resolver): resolver is PerFileImportResolver => typeof resolver === 'function')

  if (activeResolvers.length === 0) {
    return undefined
  }

  return (fileName: string) => activeResolvers.flatMap(resolver => toArray(resolver(fileName)))
}
