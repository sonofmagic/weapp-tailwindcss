import type webpack from 'webpack'
import type { RuntimeLoaderWatchDependencies, WebpackRuntimeClassSetLoaderOptions } from './runtime-registry'
import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { postcss } from '@weapp-tailwindcss/postcss'
import { removeUnsupportedCascadeLayers } from '@/tailwindcss/remove-unsupported-css'
import { isWebpackCssLoaderRuntimeSource } from '../shared/css-loader-runtime'
import { getWebpackLoaderRuntime } from './runtime-registry'
import { registerWebpackWatchContext, registerWebpackWatchFile } from './watch-dependencies'

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

function resolveOriginalCssSource(file: string, source: string | Buffer) {
  if (isPlainCssResource(file)) {
    try {
      return readFileSync(file, 'utf8')
    }
    catch {
    }
  }
  return Buffer.isBuffer(source) ? source.toString('utf8') : source
}

function resolveRegisteredCssSource(file: string, source: string | Buffer) {
  const sourceText = Buffer.isBuffer(source) ? source.toString('utf8') : source
  if (!isWebpackCssLoaderRuntimeSource(sourceText)) {
    return resolveOriginalCssSource(file, source)
  }
  if (isPlainCssResource(file)) {
    try {
      return readFileSync(file, 'utf8')
    }
    catch {
      return undefined
    }
  }
  return undefined
}

function isPlainCssResource(file: string) {
  return new Set([
    '.acss',
    '.css',
    '.jxss',
    '.qss',
    '.ttss',
    '.wxss',
  ]).has(path.extname(file.replace(/[?#].*$/, '')).toLowerCase())
}

const WeappTwRuntimeClassSetLoader: webpack.LoaderDefinitionFunction<RuntimeClassSetLoaderOptions> = function (
  this: webpack.LoaderContext<RuntimeClassSetLoaderOptions>,
  source: string | Buffer,
) {
  if (process.env['WEAPP_TW_LOADER_DEBUG']) {
    process.stdout.write(`[weapp-tw-runtime-classset-loader] executing for ${this.resourcePath}\n`)
  }
  const rawOptions = this.getOptions()
  const runtime = getWebpackLoaderRuntime(rawOptions?.weappTailwindcssRuntimeKey)
  const opt = runtime?.classSet ?? rawOptions
  if (this.resourcePath) {
    opt?.updateGeneratedCss?.({
      file: this.resourcePath,
      css: Buffer.isBuffer(source) ? source.toString('utf8') : source,
    })
    opt?.registerCssSourceFile?.({
      file: this.resourcePath,
      css: resolveRegisteredCssSource(this.resourcePath, source),
    })
  }
  const maybePromise = opt?.getClassSet?.()
  const applyWatchDependencies = (dependencies: RuntimeLoaderWatchDependencies | void) => {
    for (const file of dependencies?.files ?? []) {
      registerWebpackWatchFile(this, file)
    }
    for (const context of dependencies?.contexts ?? []) {
      registerWebpackWatchContext(this, context)
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
