// @ts-nocheck
import type webpack from 'webpack'

// eslint-disable-next-line ts/no-require-imports
const loaderUtils = require('loader-utils')
// import loaderUtils from 'loader-utils'

const WeappTwRuntimeAopLoader: webpack.LoaderDefinitionFunction<{
  getClassSet: () => void
}> = function (this: webpack.LoaderContext<any>, source: string) {
  const opt = loaderUtils.getCompilerContext(this) // this.getCompilerContext()
  opt?.getClassSet?.()
  return source
}

export default WeappTwRuntimeAopLoader
