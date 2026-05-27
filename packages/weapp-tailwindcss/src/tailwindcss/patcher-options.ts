import type { ILengthUnitsPatchOptions, TailwindCssPatchOptions } from 'tailwindcss-patch'
import { resolveBooleanObjectOption } from '@/utils/options'

type TailwindUserOptions = NonNullable<TailwindCssPatchOptions['tailwindcss']>
type TailwindApplyOptions = NonNullable<TailwindCssPatchOptions['apply']>
type TailwindExtendLengthUnitsOption = TailwindApplyOptions['extendLengthUnits']

export function resolveTailwindcssOptions(
  options?: TailwindCssPatchOptions,
): TailwindUserOptions | undefined {
  return options?.tailwindcss ?? (options as { tailwind?: TailwindUserOptions } | undefined)?.tailwind
}

export function normalizeExtendLengthUnits(
  value: boolean | ILengthUnitsPatchOptions | undefined,
): TailwindExtendLengthUnitsOption | undefined {
  if (value === undefined) {
    return undefined
  }

  const resolved = resolveBooleanObjectOption(value, { enabled: true })
  return resolved && typeof resolved === 'object'
    ? { enabled: true, ...resolved }
    : resolved
}

export function normalizeTailwindcssPatcherOptions(
  options?: TailwindCssPatchOptions,
): TailwindCssPatchOptions | undefined {
  return options
}
