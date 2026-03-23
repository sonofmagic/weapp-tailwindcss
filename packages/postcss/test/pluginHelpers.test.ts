import type { Plugin } from 'postcss'
import type { IStyleHandlerOptions } from '@/types'
import postcss from 'postcss'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

const { pxMock, remMock, calcMock, unitsMock } = vi.hoisted(() => {
  return {
    pxMock: vi.fn(),
    remMock: vi.fn(),
    calcMock: vi.fn(),
    unitsMock: vi.fn(),
  }
})

vi.mock('postcss-pxtrans', () => ({ __esModule: true, default: pxMock }))
vi.mock('postcss-rem-to-responsive-pixel', () => ({ __esModule: true, default: remMock }))
vi.mock('@weapp-tailwindcss/postcss-calc', () => ({ __esModule: true, default: calcMock }))
vi.mock('postcss-units-to-px', () => ({ __esModule: true, default: unitsMock }))

type PxModule = typeof import('@/plugins/getPxTransformPlugin')
type RemModule = typeof import('@/plugins/getRemTransformPlugin')
type CalcModule = typeof import('@/plugins/getCalcPlugin')
type UnitsModule = typeof import('@/plugins/getUnitsToPxPlugin')
type CleanerModule = typeof import('@/plugins/getCustomPropertyCleaner')

let getPxTransformPlugin: PxModule['getPxTransformPlugin']
let getRemTransformPlugin: RemModule['getRemTransformPlugin']
let getCalcPlugin: CalcModule['getCalcPlugin']
let getCalcDuplicateCleaner: typeof import('@/plugins/getCalcDuplicateCleaner').getCalcDuplicateCleaner
let getUnitsToPxPlugin: UnitsModule['getUnitsToPxPlugin']
let getCustomPropertyCleaner: CleanerModule['getCustomPropertyCleaner']

const TW_CUSTOM_PROPERTY_REGEX = /^--tw-/

beforeAll(async () => {
  const pxModule = await import('@/plugins/getPxTransformPlugin')
  getPxTransformPlugin = pxModule.getPxTransformPlugin

  const remModule = await import('@/plugins/getRemTransformPlugin')
  getRemTransformPlugin = remModule.getRemTransformPlugin

  const calcModule = await import('@/plugins/getCalcPlugin')
  getCalcPlugin = calcModule.getCalcPlugin

  const calcDuplicateCleanerModule = await import('@/plugins/getCalcDuplicateCleaner')
  getCalcDuplicateCleaner = calcDuplicateCleanerModule.getCalcDuplicateCleaner

  const unitsModule = await import('@/plugins/getUnitsToPxPlugin')
  getUnitsToPxPlugin = unitsModule.getUnitsToPxPlugin

  const cleanerModule = await import('@/plugins/getCustomPropertyCleaner')
  getCustomPropertyCleaner = cleanerModule.getCustomPropertyCleaner
})

function createOptions(partial: Partial<IStyleHandlerOptions> = {}): IStyleHandlerOptions {
  return {
    cssPresetEnv: {
      features: {},
      autoprefixer: { add: false },
    },
    ...partial,
  } as IStyleHandlerOptions
}

afterEach(() => {
  pxMock.mockReset()
  remMock.mockReset()
  calcMock.mockReset()
  unitsMock.mockReset()
})

describe('getPxTransformPlugin', () => {
  it('returns null when px2rpx disabled', () => {
    const plugin = getPxTransformPlugin(createOptions({ px2rpx: false }))
    expect(plugin).toBeNull()
    expect(pxMock).not.toHaveBeenCalled()
  })

  it('merges px2rpx options with defaults', () => {
    pxMock.mockImplementation(options => ({ postcssPlugin: 'mock-px', options }))

    const plugin = getPxTransformPlugin(createOptions({
      px2rpx: {
        designWidth: 1080,
        replace: false,
      },
    })) as Plugin | null

    expect(pxMock).toHaveBeenCalledTimes(1)
    expect(pxMock).toHaveBeenCalledWith(expect.objectContaining({
      designWidth: 1080,
      replace: false,
      platform: 'weapp',
      deviceRatio: expect.objectContaining({ 750: 1 }),
    }))
    expect(plugin?.postcssPlugin).toBe('mock-px')
  })

  it('reuses default px2rpx options when set to true', () => {
    pxMock.mockImplementation(options => ({ postcssPlugin: 'mock-px', options }))

    getPxTransformPlugin(createOptions({ px2rpx: true }))
    getPxTransformPlugin(createOptions({ px2rpx: true }))

    expect(pxMock).toHaveBeenCalledTimes(2)
    expect(pxMock.mock.calls[0]?.[0]).toBe(pxMock.mock.calls[1]?.[0])
    expect(pxMock.mock.calls[0]?.[0]).toMatchObject({
      platform: 'weapp',
      targetUnit: 'rpx',
      designWidth: 750,
    })
  })
})

describe('getRemTransformPlugin', () => {
  it('returns null when rem2rpx disabled', () => {
    const plugin = getRemTransformPlugin(createOptions({ rem2rpx: false }))
    expect(plugin).toBeNull()
    expect(remMock).not.toHaveBeenCalled()
  })

  it('preserves user supplied processor stage', () => {
    remMock.mockImplementation(options => ({ postcssPlugin: 'mock-rem', options }))

    const plugin = getRemTransformPlugin(createOptions({
      rem2rpx: {
        rootValue: 16,
        processorStage: 'Once',
      },
    })) as Plugin | null

    expect(remMock).toHaveBeenCalledTimes(1)
    expect(remMock).toHaveBeenCalledWith(expect.objectContaining({
      rootValue: 16,
      processorStage: 'Once',
    }))
    expect(plugin?.postcssPlugin).toBe('mock-rem')
  })

  it('applies OnceExit processor stage when missing', () => {
    remMock.mockImplementation(options => ({ postcssPlugin: 'mock-rem', options }))

    const plugin = getRemTransformPlugin(createOptions({ rem2rpx: true })) as Plugin | null

    expect(remMock).toHaveBeenCalledTimes(1)
    expect(remMock).toHaveBeenCalledWith(expect.objectContaining({
      processorStage: 'OnceExit',
      transformUnit: 'rpx',
    }))
    expect(plugin?.postcssPlugin).toBe('mock-rem')
  })

  it('reuses default rem2rpx options when set to true', () => {
    remMock.mockImplementation(options => ({ postcssPlugin: 'mock-rem', options }))

    getRemTransformPlugin(createOptions({ rem2rpx: true }))
    getRemTransformPlugin(createOptions({ rem2rpx: true }))

    expect(remMock).toHaveBeenCalledTimes(2)
    expect(remMock.mock.calls[0]?.[0]).toBe(remMock.mock.calls[1]?.[0])
    expect(remMock.mock.calls[0]?.[0]).toMatchObject({
      rootValue: 32,
      transformUnit: 'rpx',
      processorStage: 'OnceExit',
    })
  })
})

describe('getUnitsToPxPlugin', () => {
  it('returns null when unitsToPx disabled', () => {
    const plugin = getUnitsToPxPlugin(createOptions({ unitsToPx: false }))
    expect(plugin).toBeNull()
    expect(unitsMock).not.toHaveBeenCalled()
  })

  it('forwards options when enabled', () => {
    unitsMock.mockImplementation(options => ({ postcssPlugin: 'mock-units', options }))

    const plugin = getUnitsToPxPlugin(createOptions({
      unitsToPx: {
        unitPrecision: 2,
        unitMap: {
          rem: 10,
        },
      },
    })) as Plugin | null

    expect(unitsMock).toHaveBeenCalledTimes(1)
    expect(unitsMock).toHaveBeenCalledWith(expect.objectContaining({
      unitPrecision: 2,
      unitMap: {
        rem: 10,
      },
    }))
    expect(plugin?.postcssPlugin).toBe('mock-units')
  })

  it('uses defaults when set to true', () => {
    unitsMock.mockImplementation(options => ({ postcssPlugin: 'mock-units', options }))

    const plugin = getUnitsToPxPlugin(createOptions({ unitsToPx: true })) as Plugin | null

    expect(unitsMock).toHaveBeenCalledTimes(1)
    expect(unitsMock).toHaveBeenCalledWith(undefined)
    expect(plugin?.postcssPlugin).toBe('mock-units')
  })
})

describe('getCalcPlugin', () => {
  it('returns null without cssCalc enabled', () => {
    const plugin = getCalcPlugin(createOptions({ cssCalc: false }))
    expect(plugin).toBeNull()
    expect(calcMock).not.toHaveBeenCalled()
  })

  it('omits includeCustomProperties when forwarding options', () => {
    calcMock.mockImplementation(options => ({ postcssPlugin: 'mock-calc', options }))

    const plugin = getCalcPlugin(createOptions({
      cssCalc: {
        includeCustomProperties: ['--keep'],
        precision: 6,
      },
    })) as Plugin | null

    expect(calcMock).toHaveBeenCalledTimes(1)
    expect(calcMock).toHaveBeenCalledWith({ precision: 6 })
    expect(plugin?.postcssPlugin).toBe('mock-calc')
  })

  it('reuses empty calc options for boolean and array modes', () => {
    calcMock.mockImplementation(options => ({ postcssPlugin: 'mock-calc', options }))

    getCalcPlugin(createOptions({ cssCalc: true }))
    getCalcPlugin(createOptions({ cssCalc: ['--keep'] }))

    expect(calcMock).toHaveBeenCalledTimes(2)
    expect(calcMock.mock.calls[0]?.[0]).toBe(calcMock.mock.calls[1]?.[0])
    expect(calcMock.mock.calls[0]?.[0]).toEqual({})
  })
})

describe('getCustomPropertyCleaner', () => {
  it('returns null when includeCustomProperties is not provided', () => {
    const plugin = getCustomPropertyCleaner(createOptions({ cssCalc: false }))
    expect(plugin).toBeNull()
  })

  it('removes duplicate declarations containing matched custom properties', () => {
    const plugin = getCustomPropertyCleaner(createOptions({
      cssCalc: {
        includeCustomProperties: [TW_CUSTOM_PROPERTY_REGEX],
      },
    })) as Plugin | null
    expect(plugin).not.toBeNull()

    const root = postcss.parse(':root{--foo:var(--other);--foo:var(--tw-color);}')
    plugin!.OnceExit?.(root, {} as any)
    expect(root.toString()).toBe(':root{--foo:var(--other);}')
  })
})

describe('getCalcDuplicateCleaner', () => {
  it('reuses the shared duplicate cleaner plugin when cssCalc enabled', () => {
    const first = getCalcDuplicateCleaner(createOptions({ cssCalc: true }))
    const second = getCalcDuplicateCleaner(createOptions({ cssCalc: ['--keep'] }))

    expect(first).toBe(second)
    expect(first?.postcssPlugin).toBe('postcss-calc-duplicate-cleaner')
  })
})
