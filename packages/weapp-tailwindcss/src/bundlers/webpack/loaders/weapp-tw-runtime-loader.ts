import loaderUtils from 'loader-utils'
import type webpack from 'webpack'

const WeappTwRuntimeAopLoader: webpack.LoaderDefinitionFunction<{
  getClassSet: () => void
}> = function (this: webpack.LoaderContext<any>, source: string) {
  // @ts-expect-error
  const opt = loaderUtils.getOptions(this) // this.getOptions()
  // @ts-expect-error
  opt?.getClassSet?.()
  return source
}

export default WeappTwRuntimeAopLoader
