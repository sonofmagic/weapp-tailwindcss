import type { TailwindcssPatchOptions } from 'tailwindcss-patch'

type ExtendLengthUnitsFeature = Exclude<
  NonNullable<NonNullable<TailwindcssPatchOptions['features']>['extendLengthUnits']>,
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
  const extendLengthUnits = normalized.features?.extendLengthUnits

  if (extendLengthUnits == null) {
    return {
      ...normalized,
      features: {
        ...(normalized.features ?? {}),
        extendLengthUnits: DEFAULT_EXTEND_LENGTH_UNITS_FEATURE,
      },
    }
  }

  return normalized
}

export function buildExtendLengthUnitsOverride(
  options: TailwindcssPatchOptions | undefined,
): TailwindcssPatchOptions | undefined {
  const extendLengthUnits = options?.features?.extendLengthUnits

  if (extendLengthUnits == null) {
    return {
      features: {
        ...(options?.features ?? {}),
        extendLengthUnits: DEFAULT_EXTEND_LENGTH_UNITS_FEATURE,
      },
    }
  }

  return undefined
}
