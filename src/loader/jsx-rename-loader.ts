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

  // if (/src\\pages/.test(this.resource)) {
  //   console.log(this.resource)
  //   debugger
  // }
  // ignore node_modules
  // webpack 4 and 5 -> this.version === 2
  // @ts-ignore
  const config: LoaderOptions = getOptions(this)
  // if (config.isVue) {
  //   console.log(this.resource)
  //   debugger
  // }
  // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/53
  config.replacer.end()
  const { code } = jsxHandler(content, config.replacer)
  return code
}
