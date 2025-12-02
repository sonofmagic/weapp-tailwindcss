// @ts-nocheck
import type { Buffer } from 'node:buffer'
import type webpack from 'webpack'
import loaderUtils from 'loader-utils'

interface RuntimeClassSetLoaderOptions {
  getClassSet?: () => void | Promise<void>
}

const WeappTwRuntimeClassSetLoader: webpack.LoaderDefinitionFunction<RuntimeClassSetLoaderOptions> = function (
  this: webpack.LoaderContext<any>,
  source: string | Buffer,
) {
  const opt = loaderUtils.getOptions(this)
  const maybePromise = opt?.getClassSet?.()
  if (maybePromise && typeof (maybePromise as PromiseLike<void>).then === 'function') {
    return Promise.resolve(maybePromise).then(() => source)
  }
  return source
}

export default WeappTwRuntimeClassSetLoader
