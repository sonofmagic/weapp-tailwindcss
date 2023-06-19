import type webpack from 'webpack'
import loaderUtils from 'loader-utils'

const WeappTwRuntimeAopLoader: webpack.LoaderDefinitionFunction<{
  getClassSet: () => void
}> = function (this: webpack.LoaderContext<any>, source: string) {
  // @ts-ignore
  const opt = loaderUtils.getOptions(this) // this.getOptions()
  // @ts-ignore
  opt?.getClassSet?.()
  return source
}

export default WeappTwRuntimeAopLoader
