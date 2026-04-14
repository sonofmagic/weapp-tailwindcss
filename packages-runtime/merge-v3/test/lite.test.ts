import { describe, expect, it } from 'vitest'
import * as lite from '@/lite'
import {
  create,
  createTailwindMerge,
  extendTailwindMerge,
  mergeConfigs,
  tailwindMergeVersion,
  twJoin,
  weappTwIgnore,
} from '@/lite'
import { getDefaultConfig } from 'tailwind-merge'

describe('lite entry (merge-v3)', () => {
  /** 导出符号完整性 */
  it('应导出所有预期符号', () => {
    expect(create).toBeTypeOf('function')
    expect(createTailwindMerge).toBeTypeOf('function')
    expect(extendTailwindMerge).toBeTypeOf('function')
    expect(twJoin).toBeTypeOf('function')
    expect(weappTwIgnore).toBeTypeOf('function')
    expect(tailwindMergeVersion).toBeDefined()
    expect(mergeConfigs).toBeTypeOf('function')
  })

  /** 排除符号 */
  it('不应导出 twMerge 和 getDefaultConfig', () => {
    expect('twMerge' in lite).toBe(false)
    expect('getDefaultConfig' in lite).toBe(false)
  })

  /** tailwindMergeVersion */
  it('tailwindMergeVersion 应为 2', () => {
    expect(tailwindMergeVersion).toBe(2)
  })

  /** twJoin 拼接 */
  it('twJoin 应正确拼接类名', () => {
    expect(twJoin('p-1', 'p-2')).toBe('p-1 p-2')
  })

  /** createTailwindMerge 工厂 */
  it('createTailwindMerge 应接受配置并正确解析冲突', () => {
    const customMerge = createTailwindMerge(getDefaultConfig)
    expect(customMerge('p-1 p-2 p-0.5')).toBe('p-0_d5')
  })

  /** create() 工厂 */
  it('create() 应返回包含 twMerge、twJoin、extendTailwindMerge、createTailwindMerge、version 的对象', () => {
    const runtime = create()
    expect(runtime.twMerge).toBeTypeOf('function')
    expect(runtime.twJoin).toBeTypeOf('function')
    expect(runtime.extendTailwindMerge).toBeTypeOf('function')
    expect(runtime.createTailwindMerge).toBeTypeOf('function')
    expect(runtime.version).toBe(2)
  })

  /** create({ escape: false }) */
  it('create({ escape: false }) 应禁用 escape', () => {
    const { twJoin: rawJoin } = create({ escape: false })
    expect(rawJoin('text-[#ececec]')).toBe('text-[#ececec]')
  })

  /** weappTwIgnore */
  it('weappTwIgnore 应正确处理模板字符串', () => {
    expect(weappTwIgnore`\tfoo`).toBe('\\tfoo')
  })
})
