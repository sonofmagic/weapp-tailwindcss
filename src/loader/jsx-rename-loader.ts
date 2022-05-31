import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'

import type * as webpack from 'webpack'
import * as loaderUtils from 'loader-utils'
import type { Replacer } from '@/jsx/replacer'
// "jsx", "flow", "typescript"
interface LoaderOptions {
  replacer: Replacer
}

export function esmJsxHandler (rawSource: string, replacer: Replacer) {
  const ast = parse(rawSource, {
    sourceType: 'module'
  })

  traverse(ast, {
    enter (path) {
      replacer(path)
    },
    noScope: true
  })

  return generate(ast)
}

function getLegacyLoaderConfig (loaderContext: webpack.LoaderContext<LoaderOptions>, defaultConfigKey: string): LoaderOptions {
  // @ts-ignore
  const options = loaderUtils.getOptions(loaderContext) as unknown as LoaderOptions
  // @ts-ignore
  const configKey = options ? options.config : defaultConfigKey
  if (configKey) {
    // @ts-ignore
    return Object.assign({}, options, loaderContext.options[configKey])
  }
  return options
}

export default function loader (this: webpack.LoaderContext<LoaderOptions>, content: string) {
  this.cacheable && this.cacheable()
  // @ts-ignore
  const config: LoaderOptions = this.version === 2 ? loaderUtils.getOptions(this) : getLegacyLoaderConfig(this, 'simpleLodashTemplateLoader')
  const { code } = esmJsxHandler(content, config.replacer)
  return code
}
