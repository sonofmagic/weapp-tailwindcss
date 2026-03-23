// @ts-nocheck
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

const WeappTwRuntimeClassSetLoader: webpack.LoaderDefinitionFunction<RuntimeClassSetLoaderOptions> = function (
  this: webpack.LoaderContext<any>,
  source: string | Buffer,
) {
  if (process.env.WEAPP_TW_LOADER_DEBUG) {
    // eslint-disable-next-line no-console
    console.log('[weapp-tw-runtime-classset-loader] executing for', this.resourcePath)
  }
  const opt = loaderUtils.getOptions(this)
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
    if (dependencies && typeof (dependencies as PromiseLike<RuntimeLoaderWatchDependencies | void>).then === 'function') {
      return Promise.resolve(dependencies).then((value) => {
        applyWatchDependencies(value)
      })
    }
    applyWatchDependencies(dependencies)
  }
  if (maybePromise && typeof (maybePromise as PromiseLike<void>).then === 'function') {
    return Promise.resolve(maybePromise).then(async () => {
      await resolveWatchDependencies()
      return source
    })
  }
  resolveWatchDependencies()
  return source
}

export default WeappTwRuntimeClassSetLoader
