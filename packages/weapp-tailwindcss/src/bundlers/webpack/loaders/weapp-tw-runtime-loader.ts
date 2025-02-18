// @ts-nocheck
import type webpack from 'webpack'
import loaderUtils from 'loader-utils'

const WeappTwRuntimeAopLoader: webpack.LoaderDefinitionFunction<{
  getClassSet: () => void
}> = async function (this: webpack.LoaderContext<any>, source: string) {
  const opt = loaderUtils.getOptions(this) // this.getCompilerContext()
  await opt?.getClassSet?.()
  return source
}

export default WeappTwRuntimeAopLoader
