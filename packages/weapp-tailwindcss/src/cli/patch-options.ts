import type { TailwindcssPatchOptions } from 'tailwindcss-patch'

type ExtendLengthUnitsFeature = Exclude<
  NonNullable<NonNullable<TailwindcssPatchOptions['apply']>['extendLengthUnits']>,
  false
>

export const DEFAULT_EXTEND_LENGTH_UNITS_FEATURE: ExtendLengthUnitsFeature = {
  enabled: true,
  units: ['rpx'],
  overwrite: true,
}

export function withDefaultExtendLengthUnits(
  options: TailwindcssPatchOptions | undefined,
): TailwindcssPatchOptions {
  const normalized = options ?? {}
  const extendLengthUnits = normalized.apply?.extendLengthUnits

  if (extendLengthUnits == null) {
    return {
      ...normalized,
      apply: {
        ...(normalized.apply ?? {}),
        extendLengthUnits: DEFAULT_EXTEND_LENGTH_UNITS_FEATURE,
      },
    }
  }

  return normalized
}

export function buildExtendLengthUnitsOverride(
  options: TailwindcssPatchOptions | undefined,
): TailwindcssPatchOptions | undefined {
  const extendLengthUnits = options?.apply?.extendLengthUnits

  if (extendLengthUnits == null) {
    return {
      apply: {
        ...(options?.apply ?? {}),
        extendLengthUnits: DEFAULT_EXTEND_LENGTH_UNITS_FEATURE,
      },
    }
  }

  return undefined
}
