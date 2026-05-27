import type webpack from 'webpack'
import type { RuntimeLoaderWatchDependencies, WebpackRuntimeClassSetLoaderOptions } from './runtime-registry'
import { Buffer } from 'node:buffer'
import process from 'node:process'
import postcss from 'postcss'
import { removeUnsupportedCascadeLayers } from '@/tailwindcss/remove-unsupported-css'
import { getWebpackLoaderRuntime } from './runtime-registry'

interface RuntimeClassSetLoaderOptions extends WebpackRuntimeClassSetLoaderOptions {
  weappTailwindcssRuntimeKey?: string
}

function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  return Boolean(value && typeof (value as PromiseLike<T>).then === 'function')
}

function normalizeRuntimeCssSource(source: string | Buffer) {
  if (Buffer.isBuffer(source)) {
    const css = source.toString('utf8')
    return shouldCleanRuntimeCss(css) ? Buffer.from(cleanRuntimeCss(css)) : source
  }
  return shouldCleanRuntimeCss(source) ? cleanRuntimeCss(source) : source
}

function shouldCleanRuntimeCss(css: string) {
  return css.includes('@layer') || css.includes('@theme')
}

function cleanRuntimeCss(css: string) {
  const root = postcss.parse(css)
  removeUnsupportedCascadeLayers(root)
  removeUnsupportedThemeKeyframes(root)
  return root.toString()
}

function removeUnsupportedThemeKeyframes(root: postcss.Root) {
  root.walkAtRules('theme', (themeRule) => {
    themeRule.walkAtRules((atRule) => {
      if (atRule.name.startsWith('-') && atRule.name.endsWith('keyframes')) {
        atRule.remove()
      }
    })
  })
}

const WeappTwRuntimeClassSetLoader: webpack.LoaderDefinitionFunction<RuntimeClassSetLoaderOptions> = function (
  this: webpack.LoaderContext<RuntimeClassSetLoaderOptions>,
  source: string | Buffer,
) {
  if (process.env['WEAPP_TW_LOADER_DEBUG']) {
    process.stdout.write(`[weapp-tw-runtime-classset-loader] executing for ${this.resourcePath}\n`)
  }
  const rawOptions = this.getOptions()
  const opt = getWebpackLoaderRuntime(rawOptions?.weappTailwindcssRuntimeKey)?.classSet ?? rawOptions
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
      return normalizeRuntimeCssSource(source)
    })
  }
  resolveWatchDependencies()
  return normalizeRuntimeCssSource(source)
}

export default WeappTwRuntimeClassSetLoader
