import type { ExtendLengthUnitsOptions, LengthUnitsRuntimeOptions, TailwindCssRuntimeOptions } from './runtime-types'
import { resolveBooleanObjectOption } from '@/utils/options'

type TailwindUserOptions = NonNullable<TailwindCssRuntimeOptions['tailwindcss']>
type TailwindApplyOptions = NonNullable<TailwindCssRuntimeOptions['apply']>
type TailwindExtendLengthUnitsOption = TailwindApplyOptions['extendLengthUnits']

export function resolveTailwindcssOptions(
  options?: TailwindCssRuntimeOptions,
): TailwindUserOptions | undefined {
  return options?.tailwindcss ?? (options as { tailwind?: TailwindUserOptions } | undefined)?.tailwind
}

export function normalizeExtendLengthUnits(
  value: boolean | LengthUnitsRuntimeOptions | undefined,
): TailwindExtendLengthUnitsOption | undefined {
  if (value === undefined) {
    return undefined
  }

  const resolved = resolveBooleanObjectOption<ExtendLengthUnitsOptions>(value, { enabled: true })
  return resolved && typeof resolved === 'object'
    ? { enabled: true, ...resolved }
    : resolved
}

export function normalizeTailwindcssRuntimeOptions(
  options?: TailwindCssRuntimeOptions,
): TailwindCssRuntimeOptions | undefined {
  return options
}
