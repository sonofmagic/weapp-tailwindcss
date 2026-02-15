import { describe, expect, it } from 'vitest'
import {
  buildExtendLengthUnitsOverride,
  DEFAULT_EXTEND_LENGTH_UNITS_FEATURE,
  withDefaultExtendLengthUnits,
} from '../../src/cli/patch-options'

describe('cli patch options defaults', () => {
  it('applies extendLengthUnits defaults when missing', () => {
    const result = withDefaultExtendLengthUnits({ projectRoot: '/app' })

    expect(result.apply?.extendLengthUnits).toEqual(DEFAULT_EXTEND_LENGTH_UNITS_FEATURE)
    expect(result.projectRoot).toBe('/app')
  })

  it('keeps user-specified extendLengthUnits values intact', () => {
    const result = withDefaultExtendLengthUnits({
      apply: {
        extendLengthUnits: false,
      },
    })

    expect(result.apply?.extendLengthUnits).toBe(false)
  })

  it('builds override when extendLengthUnits is absent', () => {
    const override = buildExtendLengthUnitsOverride(undefined)

    expect(override?.apply?.extendLengthUnits).toEqual(DEFAULT_EXTEND_LENGTH_UNITS_FEATURE)
  })

  it('preserves existing feature flags when building override', () => {
    const override = buildExtendLengthUnitsOverride({
      apply: {
        exposeContext: false,
      },
    })

    expect(override?.apply).toMatchObject({
      exposeContext: false,
      extendLengthUnits: DEFAULT_EXTEND_LENGTH_UNITS_FEATURE,
    })
  })

  it('skips override when extendLengthUnits is provided', () => {
    const override = buildExtendLengthUnitsOverride({
      apply: {
        extendLengthUnits: {
          enabled: false,
        },
      },
    })

    expect(override).toBeUndefined()
  })
})
