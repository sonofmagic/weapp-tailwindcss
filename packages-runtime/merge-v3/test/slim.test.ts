import { describe, expect, it } from 'vitest'
import * as slim from '@/slim'
import {
  create,
  createTailwindMerge,
  extendTailwindMerge,
  getSlimConfig,
  tailwindMergeVersion,
  twJoin,
  twMerge,
  weappTwIgnore,
} from '@/slim'

describe('slim entry (merge-v3)', () => {
  /** 导出符号完整性 */
  it('应导出所有预期符号', () => {
    expect(create).toBeTypeOf('function')
    expect(createTailwindMerge).toBeTypeOf('function')
    expect(extendTailwindMerge).toBeTypeOf('function')
    expect(twMerge).toBeTypeOf('function')
    expect(twJoin).toBeTypeOf('function')
    expect(getSlimConfig).toBeTypeOf('function')
    expect(weappTwIgnore).toBeTypeOf('function')
    expect(tailwindMergeVersion).toBeDefined()
  })

  /** 排除符号 */
  it('不应导出 getDefaultConfig', () => {
    expect('getDefaultConfig' in slim).toBe(false)
  })

  /** tailwindMergeVersion */
  it('tailwindMergeVersion 应为 2', () => {
    expect(tailwindMergeVersion).toBe(2)
  })

  /** twMerge 基础冲突解析 */
  describe('twMerge 冲突解析', () => {
    it('spacing 冲突', () => {
      expect(twMerge('p-1 p-2 p-0.5')).toBe('p-0_d5')
    })

    it('display 冲突', () => {
      expect(twMerge('flex block')).toBe('block')
    })

    it('text color 冲突', () => {
      expect(twMerge('text-red text-blue')).toBe('text-blue')
    })

    it('width 冲突', () => {
      expect(twMerge('w-full w-1/2')).toBe('w-1_f2')
    })

    it('border radius 冲突', () => {
      expect(twMerge('rounded-lg rounded-md')).toBe('rounded-md')
    })

    it('font weight 冲突', () => {
      expect(twMerge('font-bold font-light')).toBe('font-light')
    })
  })

  /** 排除类别不解析冲突 */
  it('排除类别（如 fill）不应解析冲突', () => {
    expect(twMerge('fill-red fill-blue')).toBe('fill-red fill-blue')
  })

  /** twJoin */
  it('twJoin 应正确拼接类名', () => {
    expect(twJoin('p-1', 'p-2')).toBe('p-1 p-2')
  })

  /** extendTailwindMerge 扩展性 */
  it('extendTailwindMerge 应支持扩展 slim 配置', () => {
    const customMerge = extendTailwindMerge({
      extend: {
        classGroups: {
          'custom-group': ['custom-a', 'custom-b'],
        },
      },
    })
    expect(customMerge('custom-a custom-b')).toBe('custom-b')
  })

  /** getSlimConfig */
  it('getSlimConfig 应返回包含 cacheSize、classGroups、conflictingClassGroups 的对象', () => {
    const config = getSlimConfig()
    expect(config).toHaveProperty('cacheSize')
    expect(config).toHaveProperty('classGroups')
    expect(config).toHaveProperty('conflictingClassGroups')
  })

  /** create({ escape: false }) */
  it('create({ escape: false }) 应禁用 escape', () => {
    const { twMerge: rawMerge } = create({ escape: false })
    expect(rawMerge('text-[#ececec]')).toBe('text-[#ececec]')
  })

  /** rpx 转换 */
  it('rpx arbitrary value 应被正确处理', () => {
    expect(twMerge('text-[28rpx] text-surface-700')).toBe('text-_b28rpx_B text-surface-700')
  })
})
