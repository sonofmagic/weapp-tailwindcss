import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindV4GenerateOptions, TailwindV4ResolvedSource } from '../types'
import { canonicalizeBareArbitraryValueCandidates, loadTailwindV4DesignSystem } from '@weapp-tailwindcss/engine'
import { createLocalUtilityOrderPlan } from '@weapp-tailwindcss/postcss/transform'
import { normalizeTargetRpxLengthCandidates } from './incremental-cache'

/** 在同一生成来源内排序自动局部规则，复用当前配置及候选兼容规则。 */
export async function orderLocalUtilitySource(
  source: TailwindV4ResolvedSource,
  target: 'weapp' | 'web',
  styleOptions: Partial<IStyleHandlerOptions> | undefined,
  bareArbitraryValues: TailwindV4GenerateOptions['bareArbitraryValues'],
) {
  const plan = createLocalUtilityOrderPlan(source.css)
  if (!plan) {
    return source
  }
  if (plan.candidates.length === 0) {
    return { ...source, css: plan.apply(new Map()) }
  }
  const designSystem = await loadTailwindV4DesignSystem(source)
  // 多种原始写法可映射到同一候选，分别保留正向关系，避免反向 Map 丢失别名。
  const canonicalCandidates = plan.candidates.map((candidate) => {
    const normalized = normalizeTargetRpxLengthCandidates([candidate], target, styleOptions)
    return canonicalizeBareArbitraryValueCandidates(normalized.candidates, bareArbitraryValues)[0]!
  })
  // rank 仅在一次完整查询内可比较；0n 是合法首位，缺失值不能补成 0。
  const ranks = new Map(designSystem.getClassOrder?.([...new Set(canonicalCandidates)]))
  const order = new Map<string, bigint | null | undefined>()
  for (let index = 0; index < plan.candidates.length; index++) {
    order.set(plan.candidates[index]!, ranks.get(canonicalCandidates[index]!))
  }
  return { ...source, css: plan.apply(order) }
}
