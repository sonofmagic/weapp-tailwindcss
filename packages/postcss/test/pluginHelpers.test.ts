import type { Plugin } from 'postcss'
import type { IStyleHandlerOptions } from '@/types'
import postcss from 'postcss'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

const { pxMock, remMock, calcMock } = vi.hoisted(() => {
  return {
    pxMock: vi.fn(),
    remMock: vi.fn(),
    calcMock: vi.fn(),
  }
})

vi.mock('postcss-pxtrans', () => ({ __esModule: true, default: pxMock }))
vi.mock('postcss-rem-to-responsive-pixel', () => ({ __esModule: true, default: remMock }))
vi.mock('@weapp-tailwindcss/postcss-calc', () => ({ __esModule: true, default: calcMock }))

type PxModule = typeof import('@/plugins/getPxTransformPlugin')
type RemModule = typeof import('@/plugins/getRemTransformPlugin')
type CalcModule = typeof import('@/plugins/getCalcPlugin')
type CleanerModule = typeof import('@/plugins/getCustomPropertyCleaner')

let getPxTransformPlugin: PxModule['getPxTransformPlugin']
let getRemTransformPlugin: RemModule['getRemTransformPlugin']
let getCalcPlugin: CalcModule['getCalcPlugin']
let getCustomPropertyCleaner: CleanerModule['getCustomPropertyCleaner']

beforeAll(async () => {
  const pxModule = await import('@/plugins/getPxTransformPlugin')
  getPxTransformPlugin = pxModule.getPxTransformPlugin

  const remModule = await import('@/plugins/getRemTransformPlugin')
  getRemTransformPlugin = remModule.getRemTransformPlugin

  const calcModule = await import('@/plugins/getCalcPlugin')
  getCalcPlugin = calcModule.getCalcPlugin

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
})

describe('getCustomPropertyCleaner', () => {
  it('returns null when includeCustomProperties is not provided', () => {
    const plugin = getCustomPropertyCleaner(createOptions({ cssCalc: false }))
    expect(plugin).toBeNull()
  })

  it('removes duplicate declarations containing matched custom properties', () => {
    const plugin = getCustomPropertyCleaner(createOptions({
      cssCalc: {
        includeCustomProperties: [/^--tw-/],
      },
    })) as Plugin | null
    expect(plugin).not.toBeNull()

    const root = postcss.parse(':root{--foo:var(--other);--foo:var(--tw-color);}')
    plugin!.OnceExit?.(root, {} as any)
    expect(root.toString()).toBe(':root{--foo:var(--other);}')
  })
})
