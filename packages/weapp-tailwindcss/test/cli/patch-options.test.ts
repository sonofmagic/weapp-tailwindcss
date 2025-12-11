import { describe, expect, it } from 'vitest'
import {
  buildExtendLengthUnitsOverride,
  DEFAULT_EXTEND_LENGTH_UNITS_FEATURE,
  withDefaultExtendLengthUnits,
} from '../../src/cli/patch-options'

describe('cli patch options defaults', () => {
  it('applies extendLengthUnits defaults when missing', () => {
    const result = withDefaultExtendLengthUnits({ cwd: '/app' })

    expect(result.features?.extendLengthUnits).toEqual(DEFAULT_EXTEND_LENGTH_UNITS_FEATURE)
    expect(result.cwd).toBe('/app')
  })

  it('keeps user-specified extendLengthUnits values intact', () => {
    const result = withDefaultExtendLengthUnits({
      features: {
        extendLengthUnits: false,
      },
    })

    expect(result.features?.extendLengthUnits).toBe(false)
  })

  it('builds override when extendLengthUnits is absent', () => {
    const override = buildExtendLengthUnitsOverride(undefined)

    expect(override?.features?.extendLengthUnits).toEqual(DEFAULT_EXTEND_LENGTH_UNITS_FEATURE)
  })

  it('preserves existing feature flags when building override', () => {
    const override = buildExtendLengthUnitsOverride({
      features: {
        exposeContext: false,
      },
    })

    expect(override?.features).toMatchObject({
      exposeContext: false,
      extendLengthUnits: DEFAULT_EXTEND_LENGTH_UNITS_FEATURE,
    })
  })

  it('skips override when extendLengthUnits is provided', () => {
    const override = buildExtendLengthUnitsOverride({
      features: {
        extendLengthUnits: {
          enabled: false,
        },
      },
    })

    expect(override).toBeUndefined()
  })
})
