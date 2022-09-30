import type * as webpack from 'webpack'
import { getOptions } from 'loader-utils'
import type { JsxRenameLoaderOptions } from '@/types'
import { jsxHandler } from '@/jsx/index'
// "jsx", "flow", "typescript"

export default function loader (this: webpack.LoaderContext<JsxRenameLoaderOptions>, content: string) {
  this.cacheable && this.cacheable()

  // @ts-ignore
  const config: JsxRenameLoaderOptions = getOptions(this)

  const { code } = jsxHandler(content, config.replacer)
  return code
}
