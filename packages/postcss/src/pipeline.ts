// 按阶段构建 PostCSS 插件流水线，并提供状态机式上下文信息
import type { AcceptedPlugin } from 'postcss'
import type { IStyleHandlerOptions } from './types'
import postcssPresetEnv from 'postcss-preset-env'
import { createColorFunctionalFallback } from './plugins/colorFunctionalFallback'
import { createContext } from './plugins/ctx'
import { getCalcDuplicateCleaner } from './plugins/getCalcDuplicateCleaner'
import { getCalcPlugin } from './plugins/getCalcPlugin'
import { getCustomPropertyCleaner } from './plugins/getCustomPropertyCleaner'
import { getPxTransformPlugin } from './plugins/getPxTransformPlugin'
import { getRemTransformPlugin } from './plugins/getRemTransformPlugin'
import { getUnitsToPxPlugin } from './plugins/getUnitsToPxPlugin'
import { postcssWeappTailwindcssPostPlugin } from './plugins/post'
import { postcssWeappTailwindcssPrePlugin } from './plugins/pre'

export type PipelineStage = 'pre' | 'normal' | 'post'

export interface PipelineNodeCursor {
  id: string
  stage: PipelineStage
}

export interface PipelineNodeContext {
  stage: PipelineStage
  /**
   * 整个流水线内的顺序索引（从 0 开始）
   */
  index: number
  /**
   * 当前流水线包含的节点总数
   */
  size: number
  /**
   * 所在阶段内的顺序索引（从 0 开始）
   */
  stageIndex: number
  /**
   * 所在阶段的节点数量
   */
  stageSize: number
  /**
   * 指向前一个节点的游标（若存在）
   */
  previous?: PipelineNodeCursor
  /**
   * 指向后一个节点的游标（若存在）
   */
  next?: PipelineNodeCursor
}

interface PipelinePreparedNode extends PipelineNodeCursor {
  createPlugin: (context: PipelineNodeContext) => AcceptedPlugin
}

export interface ResolvedPipelineNode extends PipelineNodeCursor {
  plugin: AcceptedPlugin
  context: PipelineNodeContext
}

export interface StyleProcessingPipeline {
  nodes: ResolvedPipelineNode[]
  plugins: AcceptedPlugin[]
}

// normalizeUserPlugins 统一用户自定义插件的写法，确保最终拿到数组形式
function normalizeUserPlugins(plugins: unknown): AcceptedPlugin[] {
  if (!plugins) {
    return []
  }

  if (Array.isArray(plugins)) {
    return plugins.filter(Boolean) as AcceptedPlugin[]
  }

  if (typeof plugins === 'object') {
    return Object.values(plugins as Record<string, unknown>).filter(Boolean) as AcceptedPlugin[]
  }

  return []
}

function createPreparedNode(
  id: string,
  stage: PipelineStage,
  createPlugin: PipelinePreparedNode['createPlugin'],
): PipelinePreparedNode {
  return {
    id,
    stage,
    createPlugin,
  }
}

// createPreparedNodes 直接按最终顺序生成可实例化节点，避免 definition 二次中转
function createPreparedNodes(options: IStyleHandlerOptions): PipelinePreparedNode[] {
  const preparedNodes: PipelinePreparedNode[] = []
  const userPlugins = normalizeUserPlugins(options.postcssOptions?.plugins)
  userPlugins.forEach((plugin, index) => {
    preparedNodes.push(createPreparedNode(`pre:user-${index}`, 'pre', () => plugin))
  })

  preparedNodes.push(createPreparedNode('pre:core', 'pre', () => postcssWeappTailwindcssPrePlugin(options)))
  preparedNodes.push(createPreparedNode('normal:preset-env', 'normal', () => postcssPresetEnv(options.cssPresetEnv)))
  preparedNodes.push(createPreparedNode('normal:color-functional-fallback', 'normal', () => createColorFunctionalFallback()))

  const unitsToPxPlugin = getUnitsToPxPlugin(options)
  if (unitsToPxPlugin) {
    preparedNodes.push(createPreparedNode('normal:units-to-px', 'normal', () => unitsToPxPlugin))
  }

  const pxTransformPlugin = getPxTransformPlugin(options)
  if (pxTransformPlugin) {
    preparedNodes.push(createPreparedNode('normal:px-transform', 'normal', () => pxTransformPlugin))
  }

  const remTransformPlugin = getRemTransformPlugin(options)
  if (remTransformPlugin) {
    preparedNodes.push(createPreparedNode('normal:rem-transform', 'normal', () => remTransformPlugin))
  }

  const calcPlugin = getCalcPlugin(options)
  if (calcPlugin) {
    preparedNodes.push(createPreparedNode('normal:calc', 'normal', () => calcPlugin))
  }

  const calcDuplicateCleaner = getCalcDuplicateCleaner(options)
  if (calcDuplicateCleaner) {
    preparedNodes.push(createPreparedNode('normal:calc-duplicate-cleaner', 'normal', () => calcDuplicateCleaner))
  }

  const customPropertyCleaner = getCustomPropertyCleaner(options)
  if (customPropertyCleaner) {
    preparedNodes.push(createPreparedNode('normal:custom-property-cleaner', 'normal', () => customPropertyCleaner))
  }

  preparedNodes.push(createPreparedNode('post:core', 'post', () => postcssWeappTailwindcssPostPlugin(options)))

  return preparedNodes
}

// createStylePipeline 会实例化上下文、串联各个节点并提供邻接信息
export function createStylePipeline(options: IStyleHandlerOptions): StyleProcessingPipeline {
  // 管线创建前先初始化上下文，以便各插件共享状态
  options.ctx = createContext()

  const preparedNodes = createPreparedNodes(options)

  if (preparedNodes.length === 0) {
    return {
      nodes: [],
      plugins: [],
    }
  }

  const stageSizes = new Map<PipelineStage, number>()
  // 预先统计各阶段节点数量，便于生成上下文
  preparedNodes.forEach((node) => {
    stageSizes.set(node.stage, (stageSizes.get(node.stage) ?? 0) + 1)
  })

  const stageIndices = new Map<PipelineStage, number>()
  const nodes: ResolvedPipelineNode[] = []
  const size = preparedNodes.length

  preparedNodes.forEach((node, index) => {
    const stageIndex = stageIndices.get(node.stage) ?? 0
    const context: PipelineNodeContext = {
      stage: node.stage,
      index,
      size,
      stageIndex,
      stageSize: stageSizes.get(node.stage) ?? 0,
    }

    if (index > 0) {
      const prevNode = preparedNodes[index - 1]
      if (prevNode) {
        context.previous = {
          id: prevNode.id,
          stage: prevNode.stage,
        }
      }
    }

    if (index < size - 1) {
      const nextNode = preparedNodes[index + 1]
      if (nextNode) {
        context.next = {
          id: nextNode.id,
          stage: nextNode.stage,
        }
      }
    }

    stageIndices.set(node.stage, stageIndex + 1)

    nodes.push({
      id: node.id,
      stage: node.stage,
      plugin: node.createPlugin(context),
      context,
    })
  })

  return {
    nodes,
    plugins: nodes.map(node => node.plugin),
  }
}
