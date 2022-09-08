import type * as webpack from 'webpack'
// import { getOptions } from 'loader-utils'
// import { parse } from '@vue/compiler-sfc'
// import { baseParse } from '@vue/compiler-core'
interface LoaderOptions {}

export default function loader (this: webpack.LoaderContext<LoaderOptions>, content: string) {
  this.cacheable && this.cacheable()
  console.log(content, this.resource)

  return content
}
