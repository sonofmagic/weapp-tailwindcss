import type { Buffer } from 'node:buffer'
import type webpack from 'webpack'
import process from 'node:process'
import loaderUtils from 'loader-utils'

interface RuntimeClassSetLoaderOptions {
  getClassSet?: () => void | Promise<void>
  getWatchDependencies?: () => RuntimeLoaderWatchDependencies | Promise<RuntimeLoaderWatchDependencies | void> | void
}

interface RuntimeLoaderWatchDependencies {
  files?: Iterable<string>
  contexts?: Iterable<string>
}

function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  return Boolean(value && typeof (value as PromiseLike<T>).then === 'function')
}

const getLoaderOptions = (loaderUtils as unknown as {
  getOptions: (context: webpack.LoaderContext<RuntimeClassSetLoaderOptions>) => RuntimeClassSetLoaderOptions | undefined
}).getOptions

const WeappTwRuntimeClassSetLoader: webpack.LoaderDefinitionFunction<RuntimeClassSetLoaderOptions> = function (
  this: webpack.LoaderContext<RuntimeClassSetLoaderOptions>,
  source: string | Buffer,
) {
  if (process.env.WEAPP_TW_LOADER_DEBUG) {
    process.stdout.write(`[weapp-tw-runtime-classset-loader] executing for ${this.resourcePath}\n`)
  }
  const opt = getLoaderOptions(this)
  const maybePromise = opt?.getClassSet?.()
  const applyWatchDependencies = (dependencies: RuntimeLoaderWatchDependencies | void) => {
    for (const file of dependencies?.files ?? []) {
      this.addDependency?.(file)
    }
    for (const context of dependencies?.contexts ?? []) {
      this.addContextDependency?.(context)
    }
  }
  const resolveWatchDependencies = () => {
    const dependencies = opt?.getWatchDependencies?.()
    if (isPromiseLike<RuntimeLoaderWatchDependencies | void>(dependencies)) {
      return Promise.resolve(dependencies).then((value) => {
        applyWatchDependencies(value)
      })
    }
    applyWatchDependencies(dependencies)
  }
  if (isPromiseLike<void>(maybePromise)) {
    return Promise.resolve(maybePromise).then(async () => {
      await resolveWatchDependencies()
      return source
    })
  }
  resolveWatchDependencies()
  return source
}

export default WeappTwRuntimeClassSetLoader
