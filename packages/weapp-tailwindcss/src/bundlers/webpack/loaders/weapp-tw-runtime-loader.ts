// @ts-nocheck
import type webpack from 'webpack'
import loaderUtils from 'loader-utils'

const WeappTwRuntimeAopLoader: webpack.LoaderDefinitionFunction<{
  getClassSet?: () => void | Promise<void>
}> = function (this: webpack.LoaderContext<any>, source: string) {
  const opt = loaderUtils.getOptions(this) // 等同于 this.getCompilerContext()
  const maybePromise = opt?.getClassSet?.()
  if (maybePromise && typeof (maybePromise as PromiseLike<void>).then === 'function') {
    return Promise.resolve(maybePromise).then(() => source)
  }
  return source
}

export default WeappTwRuntimeAopLoader
