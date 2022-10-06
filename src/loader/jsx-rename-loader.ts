import type * as webpack from 'webpack'
import { getOptions } from 'loader-utils'
import type { JsxRenameLoaderOptions } from '@/types'
import { mkfileSync } from './util'
import path from 'path'
// "jsx", "flow", "typescript"

export default function loader (this: webpack.LoaderContext<JsxRenameLoaderOptions>, content: string) {
  this.cacheable && this.cacheable()

  // @ts-ignore
  const { jsxHandler, write }: JsxRenameLoaderOptions = getOptions(this)
  if (write) {
    const t = path.resolve(write.dir!, '.' + this.resource.replace(this.context, '') + '.tmp')
    mkfileSync(t, content)
  }
  const { code } = jsxHandler(content)
  return code
}
