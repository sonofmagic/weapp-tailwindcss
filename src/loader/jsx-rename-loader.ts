import type * as webpack from 'webpack'
import { getOptions } from 'loader-utils'
import type { JsxRenameLoaderOptions } from '@/types'
import { jsxHandler } from '@/jsx'
import { mkfileSync } from './util'
import path from 'path'
// "jsx", "flow", "typescript"

export default function loader (this: webpack.LoaderContext<JsxRenameLoaderOptions>, content: string) {
  this.cacheable && this.cacheable()

  // @ts-ignore
  const config: JsxRenameLoaderOptions = getOptions(this)
  if (config.write) {
    const t = path.resolve(config.write.dir!, '.' + this.resource.replace(this.context, '') + '.tmp')
    mkfileSync(t, content)
  }
  const { code } = jsxHandler(content, config.framework)
  return code
}
