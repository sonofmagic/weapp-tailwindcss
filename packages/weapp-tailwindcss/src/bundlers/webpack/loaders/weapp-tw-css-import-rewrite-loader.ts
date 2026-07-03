import type webpack from 'webpack'
import type { WebpackCssImportRewriteLoaderOptions } from './runtime-registry'
import type { AppType, InternalUserDefinedOptions } from '@/types'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import process from 'node:process'
import { inspect } from 'node:util'
import { filterExistingCssRules } from '@weapp-tailwindcss/postcss'
import { ensurePosix } from '@weapp-tailwindcss/shared'
import { rewriteTailwindcssImportsInCode } from '@/bundlers/shared/css-imports'
import { createBundlerGeneratedCssMarker } from '@/bundlers/shared/generated-css-marker'
import { hasTailwindApplyDirective, hasTailwindRootDirectives, normalizeTailwindSourceForGenerator, removeTailwindSourceDirectives } from '@/bundlers/shared/generator-css/directives'
import { generateTailwindV4Css } from '@/bundlers/shared/v4-generation-core'
import { createSourceCandidateStore, isSourceCandidateRequest } from '@/bundlers/vite/source-candidates'
import { resolveSourceCandidateScanFiles } from '@/bundlers/vite/source-candidates/scan-root'
import { resolveTailwindV4EntriesFromCssCached } from '@/bundlers/vite/source-scan'
import { normalizeStyleHandlerMajorVersion } from '@/context/style-options'
import { inferGeneratorTargetFromEnv } from '@/runtime-branch/generator-target-env'
import { resolveTailwindcssOptions } from '@/tailwindcss/runtime-options'
import { resolveSourceScanPath } from '@/tailwindcss/source-scan'
import { collectWebpackBareSelectorUserCss, finalizeMiniProgramUserCssAssetSource, finalizeWebpackCssAssetSource } from '../BaseUnifiedPlugin/v5-assets/pipeline-helpers'
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
  const tailwindOptions = resolveTailwindcssOptions(options.tailwindRuntimeOptions)
  const cssEntries = [
    ...(options.cssEntries ?? []),
    ...(tailwindOptions?.v4?.cssEntries ?? []),
  ]
    .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
    .map(entry => path.resolve(entry))
  const resolvedFile = path.resolve(file)
  const matchedCssEntryIndex = cssEntries.findIndex(entry => entry === resolvedFile)
  return {
    isMainChunk: matchedCssEntryIndex >= 0
      ? matchedCssEntryIndex === 0
      : options.mainCssChunkMatcher(file, appType),
    postcssOptions: {
      options: {
        from: file,
      },
    },
    ...(normalizeStyleHandlerMajorVersion(majorVersion) === undefined ? {} : { majorVersion: 4 as const }),
  }
}

async function resolveWebpackLoaderSourceCandidates(
  source: string,
  loaderContext: webpack.LoaderContext<CssImportRewriteLoaderOptions>,
  options: CssImportRewriteLoaderOptions | undefined,
) {
  const compilerOptions = options?.tailwindcssImportRewrite?.compilerOptions
  if (!compilerOptions) {
    return undefined
  }
  const root = compilerOptions.tailwindcssBasedir ?? process.cwd()
  const file = loaderContext.resourcePath
  const resolved = await resolveTailwindV4EntriesFromCssCached(source, path.dirname(file))
  if (!resolved) {
    return undefined
  }
  const collector = createSourceCandidateStore({
    bareArbitraryValues: compilerOptions.arbitraryValues?.bareArbitraryValues,
  })
  collector.syncInline(resolved.inlineCandidates)
  const outDir = loaderContext.rootContext
    ? path.resolve(loaderContext.rootContext, 'dist')
    : undefined
  const scanFiles = await resolveSourceCandidateScanFiles({
    entries: resolved.entries,
    explicit: resolved.explicit,
    filter: isSourceCandidateRequest,
    outDir,
    root,
  })
  await Promise.all(scanFiles.map(async (file) => {
    const normalizedFile = resolveSourceScanPath(file)
    registerWebpackWatchFile(loaderContext, normalizedFile)
    await collector.syncFile(normalizedFile)
  }))
  const candidates = collector.valuesForEntries(resolved.entries)
  if (candidates.size === 0) {
    return undefined
  }
  return {
    candidates,
    getSourceCandidatesForEntries: collector.valuesForEntries,
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
  const generatorTarget = compilerOptions.generator?.target ?? inferGeneratorTargetFromEnv()
  if (generatorTarget !== 'web' && generatorTarget !== 'weapp') {
    return undefined
  }
  const file = loaderContext.resourcePath
  const normalizedSource = normalizeCssConfigDirectives(source, file)
  const cssHandlerOptions = createCssHandlerOptions(
    compilerOptions,
    runtimeState.tailwindRuntime.majorVersion,
    file,
    rewriteOptions.appType,
  )
  const sourceCandidateScan = await resolveWebpackLoaderSourceCandidates(normalizedSource, loaderContext, options)
  const generated = await generateTailwindV4Css({
    opts: compilerOptions,
    runtimeState,
    runtime,
    rawSource: normalizedSource,
    file,
    outputFile: file,
    getSourceCandidatesForEntries: sourceCandidateScan?.getSourceCandidatesForEntries,
    sourceCandidates: sourceCandidateScan?.candidates,
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
  const generatedCss = removeTailwindSourceDirectives(generated.css, { importFallback: true })
  const finalizedGeneratedCss = finalizeWebpackCssAssetSource(generatedCss, compilerOptions, generatorTarget === 'web', {
    cssPreflight: cssHandlerOptions.isMainChunk,
    generatedCss: true,
  })
  const bareUserCss = collectWebpackBareSelectorUserCss(normalizedSource)
  const finalizedBareUserCss = bareUserCss.trim().length === 0
    ? ''
    : finalizeMiniProgramUserCssAssetSource(bareUserCss, compilerOptions, generatorTarget === 'web', {
        cssPreflight: false,
      })
  const missingBareUserCss = finalizedBareUserCss.trim().length === 0
    ? ''
    : filterExistingCssRules(finalizedGeneratedCss, finalizedBareUserCss)
  const css = missingBareUserCss.trim().length === 0
    ? generatedCss
    : `${generatedCss}\n${missingBareUserCss}`
  rewriteOptions.registerGeneratedCss?.({
    classSet: generated.classSet,
    css,
    dependencies: generated.dependencies,
    file,
  })
  return `${createBundlerGeneratedCssMarker('webpack', file)}\n${css}`
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
  const hasTailwindGeneratorSource = typeof input === 'string' && (
    hasTailwindRootDirectives(input, { importFallback: true })
    || hasTailwindApplyDirective(input)
  )
  const registerTask = hasTailwindGeneratorSource
    ? (() => {
        const css = normalizeCssConfigDirectives(
          normalizeTailwindSourceForGenerator(input, { importFallback: true }),
          this.resourcePath,
        )
        opt?.tailwindcssImportRewrite?.registerCssSourceFile?.({
          file: this.resourcePath,
          css,
          processed: false,
        })
        return opt?.tailwindcssImportRewrite?.registerCssSource?.({
          file: this.resourcePath,
          css,
        })
      })()
    : undefined
  const transform = () => {
    const transformed = transformCssImportRewriteSource(source, opt)
    if (typeof transformed === 'string') {
      return normalizeCssConfigDirectives(transformed, this.resourcePath)
    }
    return transformed
  }
  const canGenerate = hasTailwindGeneratorSource
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
