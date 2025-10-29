// 统一导出入口，供外部调用端按需引用核心能力
export * from './handler'
export {
  createStylePipeline,
  type PipelineNodeContext,
  type PipelineNodeCursor,
  type PipelineStage,
  type ResolvedPipelineNode,
  type StyleProcessingPipeline,
} from './pipeline'
export { createInjectPreflight } from './preflight'
export { internalCssSelectorReplacer } from './shared'
export * from './types'
