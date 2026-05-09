import type { ILengthUnitsPatchOptions, TailwindCssPatchOptions } from 'tailwindcss-patch'

type TailwindUserOptions = NonNullable<TailwindCssPatchOptions['tailwindcss']>
type TailwindApplyOptions = NonNullable<TailwindCssPatchOptions['apply']>
type TailwindExtendLengthUnitsOption = TailwindApplyOptions['extendLengthUnits']

export function resolveTailwindcssOptions(
  options?: TailwindCssPatchOptions,
): TailwindUserOptions | undefined {
  return options?.tailwindcss
}

export function normalizeExtendLengthUnits(
  value: boolean | ILengthUnitsPatchOptions | undefined,
): TailwindExtendLengthUnitsOption | undefined {
  if (value === false) {
    return false
  }
  if (value === true) {
    return { enabled: true }
  }
  if (value && typeof value === 'object') {
    return {
      enabled: true,
      ...value,
    }
  }
  return undefined
}

export function normalizeTailwindcssPatcherOptions(
  options?: TailwindCssPatchOptions,
): TailwindCssPatchOptions | undefined {
  return options
}
