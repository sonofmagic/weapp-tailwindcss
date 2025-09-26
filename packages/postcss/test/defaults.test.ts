import { getDefaultOptions } from '@/defaults'

describe('getDefaultOptions', () => {
  it('provides the expected defaults when no overrides are given', () => {
    const defaults = getDefaultOptions()

    expect(defaults.cssPresetEnv?.features?.['cascade-layers']).toBe(true)
    expect(defaults.cssPresetEnv?.features?.['is-pseudo-class']).toEqual({ specificityMatchingName: 'weapp-tw-ig' })
    expect(defaults.cssPresetEnv?.features?.['custom-properties']).toBe(false)
    expect(defaults.cssPresetEnv?.features?.['color-mix']).toBe(true)
    expect(defaults.cssPresetEnv?.features?.['oklab-function']).toBe(true)
    expect(defaults.cssPresetEnv?.autoprefixer?.add).toBe(false)
    expect(defaults.cssSelectorReplacement).toEqual({ root: 'page', universal: ['view', 'text'] })
    expect(defaults.cssRemoveProperty).toBe(true)
  })

  it('enables custom-properties preservation when cssCalc is truthy', () => {
    const defaults = getDefaultOptions({ cssCalc: true })

    expect(defaults.cssPresetEnv?.features?.['custom-properties']).toEqual({ preserve: true })
  })

  it('respects falsy custom-properties overrides', () => {
    const defaults = getDefaultOptions({
      cssPresetEnv: {
        features: {
          'custom-properties': false,
        },
      },
    })

    expect(defaults.cssPresetEnv?.features?.['custom-properties']).toBe(false)
  })
})
