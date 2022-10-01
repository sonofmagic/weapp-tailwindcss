import type * as webpack from 'webpack'
import { getOptions } from 'loader-utils'
import type { JsxRenameLoaderOptions } from '@/types'
import { jsxHandler } from '@/jsx/index'
import fs from 'fs'
import path from 'path'
// "jsx", "flow", "typescript"

export default function loader (this: webpack.LoaderContext<JsxRenameLoaderOptions>, content: string) {
  this.cacheable && this.cacheable()

  // @ts-ignore
  const config: JsxRenameLoaderOptions = getOptions(this)
  if (config.write) {
    try {
      const t = path.resolve(config.write.dir!, '.' + this.resource.replace(this.context, '') + '.tmp')
      const dirP = path.dirname(t)
      if (!fs.existsSync(dirP)) {
        fs.mkdirSync(dirP, {
          recursive: true
        })
      }
      fs.writeFileSync(t, content, 'utf-8')
    } catch (error) {
      console.error(error)
    }
  }
  const { code } = jsxHandler(content, config.replacer)
  return code
}
