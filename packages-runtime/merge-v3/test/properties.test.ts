import { describe, expect, it } from 'vitest'
import fc from 'fast-check'
import { createTailwindMerge as liteCreateTailwindMerge } from '@/lite'
import { createTailwindMerge as fullCreateTailwindMerge } from '@/index'
import { twJoin as fullJoin, twMerge } from '@/index'
import { twJoin as slimJoin, twMerge as slimMerge } from '@/slim'
import { twJoin as liteJoin } from '@/lite'
import { extendTailwindMerge as slimExtend } from '@/slim'
import { getDefaultConfig } from 'tailwind-merge'

/**
 * 属性测试：使用 fast-check 验证三层入口的核心行为一致性（merge-v3，tailwind-merge v2）。
 *
 * 每个属性至少运行 100 次迭代。
 */
describe('属性测试 (merge-v3)', () => {
  /**
   * Property 1: Lite 工厂函数产出与 Full Entry 行为一致
   *
   * 使用相同的 getDefaultConfig 配置创建 merge 函数，
   * 验证 Lite createTailwindMerge 与 Full createTailwindMerge 对任意类字符串产出一致。
   *
   * **Validates: Requirements 1.3, 1.5, 6.1, 6.3, 6.7, 6.9**
   */
  describe('Property 1: Lite 工厂函数产出与 Full Entry 行为一致', () => {
    const liteMerge = liteCreateTailwindMerge(getDefaultConfig)
    const fullMerge = fullCreateTailwindMerge(getDefaultConfig)

    /** 常见 Tailwind 类名集合 */
    const tailwindClasses = [
      'p-1', 'p-2', 'p-4', 'm-1', 'm-2', 'm-4',
      'flex', 'block', 'inline', 'hidden',
      'w-full', 'w-1/2', 'h-full', 'h-10',
      'text-red', 'text-blue', 'text-sm', 'text-lg',
      'bg-red', 'bg-blue', 'font-bold', 'font-light',
      'rounded', 'rounded-lg', 'rounded-md',
      'border', 'border-2', 'opacity-50', 'opacity-100',
      'z-10', 'z-20',
    ]

    const classStringArb = fc
      .array(fc.constantFrom(...tailwindClasses), { minLength: 1, maxLength: 6 })
      .map(classes => classes.join(' '))

    it('lite createTailwindMerge 与 full createTailwindMerge 产出一致', () => {
      fc.assert(
        fc.property(classStringArb, (classStr) => {
          expect(liteMerge(classStr)).toBe(fullMerge(classStr))
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * Property 2: twJoin 跨入口一致性
   *
   * 生成随机类名数组，验证所有入口的 twJoin 输出一致。
   *
   * **Validates: Requirements 1.4, 2.6**
   */
  describe('Property 2: twJoin 跨入口一致性', () => {
    const classArb = fc.constantFrom('p-1', 'p-2', 'flex', 'block', 'text-red', 'w-full', '', 'hidden')
    const classArrayArb = fc.array(classArb, { minLength: 0, maxLength: 5 })

    it('twJoin 跨入口一致', () => {
      fc.assert(
        fc.property(classArrayArb, (classes) => {
          const result = fullJoin(...classes)
          expect(slimJoin(...classes)).toBe(result)
          expect(liteJoin(...classes)).toBe(result)
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * Property 3: Slim 冲突解析覆盖已包含类别
   *
   * 从已包含类别中生成随机冲突类对，验证 Slim twMerge 与 Full twMerge 解析结果一致。
   *
   * **Validates: Requirements 2.3, 2.5, 6.2, 6.4, 6.8, 6.10**
   */
  describe('Property 3: Slim 冲突解析覆盖已包含类别', () => {
    /** 已包含类别的冲突类对 */
    const conflictPairs: [string, string][] = [
      ['p-1', 'p-2'], ['p-4', 'p-8'], ['m-1', 'm-2'], ['m-4', 'm-8'],
      ['flex', 'block'], ['flex', 'inline'], ['block', 'hidden'], ['grid', 'flex'],
      ['w-full', 'w-1/2'], ['w-10', 'w-20'], ['h-full', 'h-10'],
      ['text-red', 'text-blue'], ['text-sm', 'text-lg'],
      ['font-bold', 'font-light'], ['font-medium', 'font-semibold'],
      ['rounded', 'rounded-lg'], ['rounded-md', 'rounded-full'],
      ['border', 'border-2'], ['border-0', 'border-4'],
      ['opacity-50', 'opacity-100'], ['z-10', 'z-20'],
      ['justify-start', 'justify-center'], ['items-start', 'items-center'],
      ['gap-1', 'gap-2'], ['gap-x-1', 'gap-x-2'],
    ]

    const conflictPairArb = fc.constantFrom(...conflictPairs)

    it('slim twMerge 对已包含类别的冲突解析与 full 一致', () => {
      fc.assert(
        fc.property(conflictPairArb, ([a, b]) => {
          expect(slimMerge(`${a} ${b}`)).toBe(twMerge(`${a} ${b}`))
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * Property 4: Slim extendTailwindMerge 扩展性
   *
   * 生成随机自定义类组名和类名，扩展 slim 配置后验证冲突解析正确。
   *
   * **Validates: Requirements 2.9**
   */
  describe('Property 4: Slim extendTailwindMerge 扩展性', () => {
    const customGroupArb = fc.record({
      name: fc.constantFrom('custom-a', 'custom-b', 'custom-c'),
      classes: fc.array(fc.constantFrom('val-1', 'val-2', 'val-3'), { minLength: 2, maxLength: 3 }),
    })

    it('slim extendTailwindMerge 正确处理扩展冲突', () => {
      fc.assert(
        fc.property(customGroupArb, ({ name, classes }) => {
          const customMerge = slimExtend({
            extend: {
              classGroups: {
                [name]: classes.map(c => `${name}-${c}`),
              },
            },
          })
          /** 最后一个类应胜出 */
          const input = classes.map(c => `${name}-${c}`).join(' ')
          const lastClass = `${name}-${classes[classes.length - 1]}`
          expect(customMerge(input)).toBe(lastClass)
        }),
        { numRuns: 100 },
      )
    })
  })

  /**
   * Property 5: Full Entry 向后兼容
   *
   * 使用已知的类合并输入和预期输出，验证 Full Entry 产出不变（回归测试）。
   *
   * **Validates: Requirements 3.2, 3.3, 3.4**
   */
  describe('Property 5: Full Entry 向后兼容', () => {
    const knownMerges = [
      { input: 'p-1 p-2', expected: 'p-2' },
      { input: 'flex block', expected: 'block' },
      { input: 'text-red text-blue', expected: 'text-blue' },
      { input: 'w-full rounded-full bg-success p-1', expected: 'w-full rounded-full bg-success p-1' },
      { input: 'p-1 p-2 p-0.5', expected: 'p-0_d5' },
      { input: 'font-bold font-light', expected: 'font-light' },
      { input: 'rounded-lg rounded-md', expected: 'rounded-md' },
      { input: 'opacity-50 opacity-100', expected: 'opacity-100' },
      { input: 'z-10 z-20', expected: 'z-20' },
      { input: 'hidden block', expected: 'block' },
    ]

    const knownMergeArb = fc.constantFrom(...knownMerges)

    it('full entry 向后兼容', () => {
      fc.assert(
        fc.property(knownMergeArb, ({ input, expected }) => {
          expect(twMerge(input)).toBe(expected)
        }),
        { numRuns: 100 },
      )
    })
  })
})
