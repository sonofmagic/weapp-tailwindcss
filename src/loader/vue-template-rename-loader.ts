import type * as webpack from 'webpack'
// import { getOptions } from 'loader-utils'
// import { parse } from '@vue/compiler-sfc'
// import { baseParse } from '@vue/compiler-core'
interface LoaderOptions {}

export default function loader (this: webpack.LoaderContext<LoaderOptions>, content: string) {
  this.cacheable && this.cacheable()
  console.log(content, this.resource)
  // const { descriptor } = parse(content)
  // console.log(descriptor)

  // const regex = /<template(?:\s*\w*\s*)?>(.*)<\/template>/s
  // const { descriptor } = parse(content)

  // console.log(descriptor)
  // @ts-ignore
  // const config: LoaderOptions = getOptions(this)
  //  console.log(config)
  return content
}
