import type { InternalUserDefinedOptions } from '@/types'
import { DEFAULT_RUNTIME_PACKAGE_REPLACEMENTS } from '@/constants'
import { resolveBooleanObjectOption } from '@/utils/options'

export function resolveRuntimePackageReplacements(
  option: InternalUserDefinedOptions['replaceRuntimePackages'],
) {
  const mapping = resolveBooleanObjectOption(option, DEFAULT_RUNTIME_PACKAGE_REPLACEMENTS)
  if (!mapping) {
    return undefined
  }

  const normalized: Record<string, string> = {}
  for (const [from, to] of Object.entries(mapping)) {
    if (!from || typeof to !== 'string' || to.length === 0) {
      continue
    }
    normalized[from] = to
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined
}
