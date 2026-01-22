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

interface PipelineNodeDefinition extends PipelineNodeCursor {
  prepare: (options: IStyleHandlerOptions) => PipelinePreparedNode | undefined
}

export interface ResolvedPipelineNode extends PipelineNodeCursor {
  plugin: AcceptedPlugin
  context: PipelineNodeContext
}

export interface StyleProcessingPipeline {
  nodes: ResolvedPipelineNode[]
  plugins: AcceptedPlugin[]
}

const STAGE_ORDER: PipelineStage[] = ['pre', 'normal', 'post']

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

// createStaticDefinition 用于封装固定插件节点，避免重复描述
function createStaticDefinition(id: string, stage: PipelineStage, plugin: AcceptedPlugin): PipelineNodeDefinition {
  return {
    id,
    stage,
    prepare: () => ({
      id,
      stage,
      createPlugin: () => plugin,
    }),
  }
}

// createPipelineDefinitions 将配置拆分成 pre/normal/post 三个阶段的节点描述
function createPipelineDefinitions(options: IStyleHandlerOptions): PipelineNodeDefinition[] {
  const stages: Record<PipelineStage, PipelineNodeDefinition[]> = {
    pre: [],
    normal: [],
    post: [],
  }

  const userPlugins = normalizeUserPlugins(options.postcssOptions?.plugins)
  userPlugins.forEach((plugin, index) => {
    stages.pre.push(createStaticDefinition(`pre:user-${index}`, 'pre', plugin))
  })

  stages.pre.push({
    id: 'pre:core',
    stage: 'pre',
    prepare: () => ({
      id: 'pre:core',
      stage: 'pre',
      createPlugin: () => postcssWeappTailwindcssPrePlugin(options),
    }),
  })

  stages.normal.push({
    id: 'normal:preset-env',
    stage: 'normal',
    prepare: () => ({
      id: 'normal:preset-env',
      stage: 'normal',
      createPlugin: () => postcssPresetEnv(options.cssPresetEnv),
    }),
  })

  stages.normal.push({
    id: 'normal:color-functional-fallback',
    stage: 'normal',
    prepare: () => ({
      id: 'normal:color-functional-fallback',
      stage: 'normal',
      createPlugin: () => createColorFunctionalFallback(),
    }),
  })

  stages.normal.push({
    id: 'normal:px-transform',
    stage: 'normal',
    prepare: () => {
      const plugin = getPxTransformPlugin(options)
      return plugin
        ? {
            id: 'normal:px-transform',
            stage: 'normal',
            createPlugin: () => plugin,
          }
        : undefined
    },
  })

  stages.normal.push({
    id: 'normal:rem-transform',
    stage: 'normal',
    prepare: () => {
      const plugin = getRemTransformPlugin(options)
      return plugin
        ? {
            id: 'normal:rem-transform',
            stage: 'normal',
            createPlugin: () => plugin,
          }
        : undefined
    },
  })

  stages.normal.push({
    id: 'normal:calc',
    stage: 'normal',
    prepare: () => {
      const plugin = getCalcPlugin(options)
      return plugin
        ? {
            id: 'normal:calc',
            stage: 'normal',
            createPlugin: () => plugin,
          }
        : undefined
    },
  })

  stages.normal.push({
    id: 'normal:calc-duplicate-cleaner',
    stage: 'normal',
    prepare: () => {
      const plugin = getCalcDuplicateCleaner(options)
      return plugin
        ? {
            id: 'normal:calc-duplicate-cleaner',
            stage: 'normal',
            createPlugin: () => plugin,
          }
        : undefined
    },
  })

  stages.normal.push({
    id: 'normal:custom-property-cleaner',
    stage: 'normal',
    prepare: () => {
      const plugin = getCustomPropertyCleaner(options)
      return plugin
        ? {
            id: 'normal:custom-property-cleaner',
            stage: 'normal',
            createPlugin: () => plugin,
          }
        : undefined
    },
  })

  stages.post.push({
    id: 'post:core',
    stage: 'post',
    prepare: () => ({
      id: 'post:core',
      stage: 'post',
      createPlugin: () => postcssWeappTailwindcssPostPlugin(options),
    }),
  })

  return STAGE_ORDER.flatMap(stage => stages[stage])
}

// createStylePipeline 会实例化上下文、串联各个节点并提供邻接信息
export function createStylePipeline(options: IStyleHandlerOptions): StyleProcessingPipeline {
  // 管线创建前先初始化上下文，以便各插件共享状态
  options.ctx = createContext()

  const preparedNodes = createPipelineDefinitions(options)
    .map(definition => definition.prepare(options))
    .filter(Boolean) as PipelinePreparedNode[]

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
