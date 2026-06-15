import type webpack from 'webpack'
import type { WebpackCssImportRewriteLoaderOptions } from './runtime-registry'
import type { AppType, InternalUserDefinedOptions } from '@/types'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import process from 'node:process'
import { inspect } from 'node:util'
import { ensurePosix } from '@weapp-tailwindcss/shared'
import { rewriteTailwindcssImportsInCode } from '@/bundlers/shared/css-imports'
import { createBundlerGeneratedCssMarker } from '@/bundlers/shared/generated-css-marker'
import { generateCssByGenerator } from '@/bundlers/shared/generator-css'
import { hasTailwindRootDirectives, normalizeTailwindSourceForGenerator } from '@/bundlers/shared/generator-css/directives'
import { getWebpackLoaderRuntime } from './runtime-registry'
import { registerWebpackWatchFile } from './watch-dependencies'

interface CssImportRewriteLoaderOptions extends WebpackCssImportRewriteLoaderOptions {}

function resolveLoaderOptions(options: CssImportRewriteLoaderOptions | undefined): CssImportRewriteLoaderOptions | undefined {
  const runtime = getWebpackLoaderRuntime(options?.tailwindcssImportRewriteRuntimeKey)?.cssImportRewrite
  return runtime
    ? {
        ...options,
        tailwindcssImportRewrite: runtime,
      }
    : options
}

function joinPosixPath(base: string, subpath: string) {
  if (base.endsWith('/')) {
    return `${base}${subpath}`
  }
  return `${base}/${subpath}`
}

function applyCssImportRewrite(source: string, options: CssImportRewriteLoaderOptions | undefined) {
  const rewriteOptions = options?.tailwindcssImportRewrite
  const pkgDir = rewriteOptions?.pkgDir
  if (!pkgDir) {
    return source
  }
  const rewritten = rewriteTailwindcssImportsInCode(
    source,
    ensurePosix(pkgDir),
    {
      join: joinPosixPath,
      appType: rewriteOptions.appType,
    },
  )
  return rewritten ?? source
}

function isPackageJsonImportRequest(request: string) {
  return request.startsWith('#')
}

function normalizeCssConfigDirectives(source: string, resourcePath?: string) {
  if (!resourcePath) {
    return source
  }
  const base = path.dirname(resourcePath)
  return source.replace(/@config\s+(["'])(.+?)\1\s*;?/g, (full, quote: string, request: string) => {
    if (path.isAbsolute(request) || isPackageJsonImportRequest(request)) {
      return full
    }
    const resolved = path.resolve(base, request)
    return `@config ${quote}${ensurePosix(resolved)}${quote};`
  })
}

function createCssHandlerOptions(
  options: InternalUserDefinedOptions,
  majorVersion: number | undefined,
  file: string,
  appType?: AppType,
) {
  return {
    isMainChunk: options.mainCssChunkMatcher(file, appType),
    postcssOptions: {
      options: {
        from: file,
      },
    },
    ...(majorVersion === undefined ? {} : { majorVersion }),
  }
}

async function generateCssForWebpackPipeline(
  source: string,
  loaderContext: webpack.LoaderContext<CssImportRewriteLoaderOptions>,
  options: CssImportRewriteLoaderOptions | undefined,
) {
  const rewriteOptions = options?.tailwindcssImportRewrite
  const compilerOptions = rewriteOptions?.compilerOptions
  const runtimeState = rewriteOptions?.runtimeState
  const getRuntimeSet = rewriteOptions?.getRuntimeSet
  if (!compilerOptions || !runtimeState || !getRuntimeSet) {
    return undefined
  }
  await runtimeState.readyPromise
  const runtime = await getRuntimeSet()
  if (compilerOptions.generator?.target !== 'web') {
    return undefined
  }
  const file = loaderContext.resourcePath
  const normalizedSource = normalizeCssConfigDirectives(source, file)
  const cssHandlerOptions = createCssHandlerOptions(
    compilerOptions,
    runtimeState.twPatcher.majorVersion,
    file,
    rewriteOptions.appType,
  )
  const generated = await generateCssByGenerator({
    opts: compilerOptions,
    runtimeState,
    runtime,
    rawSource: normalizedSource,
    file,
    cssHandlerOptions,
    cssUserHandlerOptions: {
      ...cssHandlerOptions,
      isMainChunk: false,
    },
    styleHandler: compilerOptions.styleHandler,
    debug: () => undefined,
  })
  if (!generated) {
    return undefined
  }
  rewriteOptions.markGeneratedCssSource?.(file)
  for (const dependency of generated.dependencies) {
    registerWebpackWatchFile(loaderContext, dependency)
  }
  return `${createBundlerGeneratedCssMarker('webpack', file)}\n${generated.css}`
}

export function transformCssImportRewriteSource(
  source: string | Buffer,
  options: CssImportRewriteLoaderOptions | undefined,
) {
  const isBuffer = Buffer.isBuffer(source)
  const input = isBuffer ? source.toString('utf-8') : source
  const rewritten = applyCssImportRewrite(input, options)
  // If unchanged, return original to preserve type.
  if (rewritten === input) {
    return source
  }
  if (process.env['WEAPP_TW_LOADER_DEBUG']) {
    process.stdout.write(`[weapp-tw-css-import-rewrite-loader] rewritten import ${inspect({
      before: input.slice(0, 80),
      after: rewritten.slice(0, 80),
    })}\n`)
  }
  return rewritten
}

const WeappTwCssImportRewriteLoader: webpack.LoaderDefinitionFunction<CssImportRewriteLoaderOptions> = function (
  this: webpack.LoaderContext<CssImportRewriteLoaderOptions>,
  source: string | Buffer,
) {
  if (process.env['WEAPP_TW_LOADER_DEBUG']) {
    process.stdout.write(`[weapp-tw-css-import-rewrite-loader] executing for ${this.resourcePath}\n`)
  }
  const opt = resolveLoaderOptions(this.getOptions())
  const input = Buffer.isBuffer(source) ? source.toString('utf-8') : source
  const hasTailwindRoot = typeof input === 'string' && hasTailwindRootDirectives(input, { importFallback: true })
  const registerTask = hasTailwindRoot
    ? opt?.tailwindcssImportRewrite?.registerCssSource?.({
        file: this.resourcePath,
        css: normalizeCssConfigDirectives(
          normalizeTailwindSourceForGenerator(input, { importFallback: true }),
          this.resourcePath,
        ),
      })
    : undefined
  const transform = () => {
    const transformed = transformCssImportRewriteSource(source, opt)
    if (typeof transformed === 'string') {
      return normalizeCssConfigDirectives(transformed, this.resourcePath)
    }
    return transformed
  }
  const canGenerate = hasTailwindRoot
    && opt?.tailwindcssImportRewrite?.compilerOptions
    && opt.tailwindcssImportRewrite.runtimeState
    && opt.tailwindcssImportRewrite.getRuntimeSet
  const generate = canGenerate
    ? async () => {
      const generated = await generateCssForWebpackPipeline(input, this, opt)
      return generated ?? transform()
    }
    : undefined
  if (registerTask && typeof (registerTask as PromiseLike<void>).then === 'function') {
    return Promise.resolve(registerTask).then(async () => {
      if (generate) {
        return generate()
      }
      return transform()
    })
  }
  if (generate) {
    return generate()
  }
  return transform()
}

export default WeappTwCssImportRewriteLoader
