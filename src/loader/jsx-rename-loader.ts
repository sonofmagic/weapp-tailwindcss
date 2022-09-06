import type * as webpack from 'webpack'
import { getOptions } from 'loader-utils'
import type { Replacer } from '@/jsx/replacer'
import { jsxHandler } from '@/jsx/index'
// "jsx", "flow", "typescript"
export interface LoaderOptions {
  replacer: Replacer
  framework?: string
  isVue?: boolean
}

export default function loader (this: webpack.LoaderContext<LoaderOptions>, content: string) {
  this.cacheable && this.cacheable()

  // @ts-ignore
  const config: LoaderOptions = getOptions(this)

  const { code } = jsxHandler(content, config.replacer)
  return code
}
