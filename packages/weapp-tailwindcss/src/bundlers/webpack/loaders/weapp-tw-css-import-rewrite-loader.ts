import type { TailwindV4CssSource } from 'tailwindcss-patch'
import type webpack from 'webpack'
import type { AppType } from '@/types'
import { Buffer } from 'node:buffer'
import process from 'node:process'
import { inspect } from 'node:util'
import { ensurePosix } from '@weapp-tailwindcss/shared'
import loaderUtils from 'loader-utils'
import { rewriteTailwindcssImportsInCode } from '@/bundlers/shared/css-imports'

const TAILWIND_ROOT_DIRECTIVE_RE = /@(?:import\s+(?:url\(\s*)?["']?tailwindcss4?(?:\/[^"')\s]*)?|tailwind|config|custom-variant|plugin|source|theme|utility|variant)\b/

interface CssImportRewriteLoaderOptions {
  tailwindcssImportRewrite?: {
    pkgDir: string
    appType?: AppType
    registerCssSource?: (source: TailwindV4CssSource) => Promise<void> | void
  }
}

const getLoaderOptions = (loaderUtils as unknown as {
  getOptions: (context: webpack.LoaderContext<CssImportRewriteLoaderOptions>) => CssImportRewriteLoaderOptions | undefined
}).getOptions

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
  if (process.env.WEAPP_TW_LOADER_DEBUG) {
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
  if (process.env.WEAPP_TW_LOADER_DEBUG) {
    process.stdout.write(`[weapp-tw-css-import-rewrite-loader] executing for ${this.resourcePath}\n`)
  }
  const opt = getLoaderOptions(this)
  const input = Buffer.isBuffer(source) ? source.toString('utf-8') : source
  const registerTask = typeof input === 'string' && TAILWIND_ROOT_DIRECTIVE_RE.test(input)
    ? opt?.tailwindcssImportRewrite?.registerCssSource?.({
        file: this.resourcePath,
        css: input,
      })
    : undefined
  const transform = () => transformCssImportRewriteSource(source, opt)
  if (registerTask && typeof (registerTask as PromiseLike<void>).then === 'function') {
    return Promise.resolve(registerTask).then(transform)
  }
  return transform()
}

export default WeappTwCssImportRewriteLoader
