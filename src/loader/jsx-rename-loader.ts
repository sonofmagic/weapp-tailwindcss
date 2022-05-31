import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'

import type * as webpack from 'webpack'
import { getOptions } from 'loader-utils'
import type { Replacer } from '@/jsx/replacer'
import { jsxHandler } from '@/jsx/index'
// "jsx", "flow", "typescript"
interface LoaderOptions {
  replacer: Replacer
}

// export function esmJsxHandler (rawSource: string, replacer: Replacer) {
//   const ast = parse(rawSource, {
//     sourceType: 'unambiguous'
//   })

//   traverse(ast, {
//     enter (path) {
//       replacer(path)
//     },
//     noScope: true
//   })

//   return generate(ast)
// }

export default function loader (this: webpack.LoaderContext<LoaderOptions>, content: string) {
  this.cacheable && this.cacheable()
  // @ts-ignore
  // webpack 4 and 5 -> this.version === 2
  const config: LoaderOptions = getOptions(this)
  const { code } = jsxHandler(content, config.replacer)
  return code
}
