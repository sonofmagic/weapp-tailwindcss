import { describe, expect, it, vi } from 'vitest'
import { getUnitsToPxPlugin } from '@/plugins/getUnitsToPxPlugin'

const mocks = vi.hoisted(() => {
  const unitsToPx = vi.fn((options: unknown) => ({
    postcssPlugin: 'mock-unit-converter',
    options,
  }))
  const converter = vi.fn((options: unknown) => ({
    postcssPlugin: 'mock-postcss-rule-unit-converter',
    options,
  }))
  return {
    converter,
    unitsToPx,
  }
})

vi.mock('postcss-rule-unit-converter', () => ({
  default: mocks.converter,
  presets: {
    unitsToPx: mocks.unitsToPx,
  },
}))

describe('getUnitsToPxPlugin', () => {
  it('returns null when unit conversion is disabled by options', () => {
    expect(getUnitsToPxPlugin({ unitsToPx: false } as any)).toBeNull()
    expect(mocks.converter).not.toHaveBeenCalled()
  })

  it('returns disabled converter when disabled or transform false is set', () => {
    expect(getUnitsToPxPlugin({ unitsToPx: { disabled: true } } as any)).toMatchObject({
      postcssPlugin: 'mock-postcss-rule-unit-converter',
      options: { disabled: true },
    })
    expect(getUnitsToPxPlugin({ unitsToPx: { transform: false } } as any)).toMatchObject({
      postcssPlugin: 'mock-postcss-rule-unit-converter',
      options: { disabled: true },
    })
  })

  it('uses default preset options when unitsToPx is true', () => {
    const plugin = getUnitsToPxPlugin({ unitsToPx: true } as any)

    expect(mocks.unitsToPx).toHaveBeenLastCalledWith({})
    expect(plugin).toMatchObject({
      postcssPlugin: 'mock-postcss-rule-unit-converter',
      options: {
        rules: {
          postcssPlugin: 'mock-unit-converter',
          options: {},
        },
      },
    })
  })

  it('maps user options to preset and converter options', () => {
    const transform = { rem: 32 }
    const unitMap = { rpx: 0.5 }
    const exclude = /node_modules/u
    const selectorBlackList = [/^ignore/u]

    getUnitsToPxPlugin({
      unitsToPx: {
        minValue: 0.5,
        to: 'px',
        transform,
        unitMap,
        exclude,
        mediaQuery: true,
        propList: ['*', '!border'],
        replace: false,
        selectorBlackList,
        unitPrecision: 4,
      },
    } as any)

    expect(mocks.unitsToPx).toHaveBeenLastCalledWith({
      minValue: 0.5,
      to: 'px',
      transform,
      unitMap,
    })
    expect(mocks.converter).toHaveBeenLastCalledWith({
      minValue: 0.5,
      exclude,
      mediaQuery: true,
      propList: ['*', '!border'],
      replace: false,
      selectorBlackList,
      unitPrecision: 4,
      rules: {
        postcssPlugin: 'mock-unit-converter',
        options: {
          minValue: 0.5,
          to: 'px',
          transform,
          unitMap,
        },
      },
    })
  })
})
