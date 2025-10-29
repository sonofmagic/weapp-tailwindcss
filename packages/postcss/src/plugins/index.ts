// 插件入口：对外暴露管线构建结果与核心插件
import type { AcceptedPlugin } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import { createStylePipeline } from '../pipeline'

export { createStylePipeline } from '../pipeline'
export { postcssWeappTailwindcssPostPlugin } from './post'
export { postcssWeappTailwindcssPrePlugin } from './pre'
export { default as postcssRem2rpx } from 'postcss-rem-to-responsive-pixel'

// 兼容旧接口，直接返回流水线中的插件数组
export function getPlugins(options: IStyleHandlerOptions): AcceptedPlugin[] {
  return createStylePipeline(options).plugins
}
