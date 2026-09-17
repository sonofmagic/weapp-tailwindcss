import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { SourceSideCssEntryOptions } from './generator-css/source-files'

/** 样式处理选项与构建器持有的来源信息；PostCSS 只消费样式选项。 */
export interface BundlerStyleHandlerOptions extends IStyleHandlerOptions {
  sourceOptions?: SourceSideCssEntryOptions & { requestFile?: string | undefined } | undefined
}
