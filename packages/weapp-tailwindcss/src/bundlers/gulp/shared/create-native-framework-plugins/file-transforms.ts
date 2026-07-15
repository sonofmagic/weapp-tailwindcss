import type File from 'vinyl'
import type { getCompilerContext } from '@/context'
import type { TailwindRuntimeState } from '@/tailwindcss/runtime'
import type { CreateJsHandlerOptions, IStyleHandlerOptions, ITemplateHandlerOptions, JsModuleGraphOptions } from '@/types'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import { shouldSkipJsTransform } from '@/js/precheck'
import { processCachedTask } from '../../../shared/cache'
import { annotateCssSourceTrace, createCssSourceTraceCacheSignature, createCssTokenSourceMap } from '../../../shared/css-source-trace'
import { createBundlerGeneratedCssMarker, hasBundlerGeneratedCssMarker, stripBundlerGeneratedCssMarkers } from '../../../shared/generated-css-marker'
import { generateCssByGenerator } from '../../../shared/generator-css'
import { finalizeMiniProgramGeneratorCss } from '../../../shared/generator-css/generation-helpers'
import { rewriteLocalCssImportRequestsForOutput } from '../../../shared/generator-css/local-imports'
import { createVinylTransform } from '../../vinyl-transform'
import { pruneGulpProcessCache, rememberGulpProcessCacheKey } from './cache-state'

type DebugFunction = (formatter: unknown, ...args: unknown[]) => void
type RuntimeRefreshOptions = boolean | {
  forceRefresh?: boolean
  forceCollect?: boolean
  clearCache?: boolean
}

export interface GulpFileTransformContext {
  cache: ReturnType<typeof getCompilerContext>['cache']
  createRuntimeSetHash: (
    rawSource: string,
    nextRuntimeSet: Set<string>,
    sourceTraceSignature?: string,
    sourceCandidateSignature?: string,
    outputSignature?: string,
  ) => string
  debug: DebugFunction
  generatedCssPreflightModeByFile: Map<string, { inject: boolean, preserve: boolean }>
  getSourceCandidateGetter: () => ((entries?: unknown) => Set<string>) | undefined
  getSourceCandidateSourceGetter: () => ((entries?: unknown) => Map<string, Set<string>>) | undefined
  getRuntimeSet: () => Set<string>
  gulpProcessCacheKeys: Set<string>
  opts: ReturnType<typeof getCompilerContext>
  refreshGulpV4SourceCandidates: (forceRefresh?: boolean) => Promise<((entries?: unknown) => Set<string>) | undefined>
  refreshRuntimeSet: (options?: RuntimeRefreshOptions) => Promise<Set<string>>
  refreshRuntimeSetForSource: (file: File, rawSource: string, type: 'html' | 'js') => Promise<Set<string>>
  registerAutoCssSource: (file: File, rawSource: string) => Promise<boolean>
  resolveGulpStyleOutputExtension: (file: File) => string | undefined
  resolveGulpTransformTimingDetails: (phase: string) => unknown
  resolveModuleGraphOptions: (moduleGraph?: JsModuleGraphOptions) => JsModuleGraphOptions
  resolveWxmlHandlerOptions: (options?: Partial<ITemplateHandlerOptions>) => Partial<ITemplateHandlerOptions>
  resolveWxssFileHandlerOptions: (file: File, rawSource: string, options?: Partial<IStyleHandlerOptions>) => Partial<IStyleHandlerOptions>
  resolveWxssUserHandlerOptions: (options?: Partial<IStyleHandlerOptions>) => Partial<IStyleHandlerOptions>
  runtimeState: TailwindRuntimeState
}

export function createGulpFileTransforms(context: GulpFileTransformContext) {
  const {
    cache,
    createRuntimeSetHash,
    debug,
    generatedCssPreflightModeByFile,
    getSourceCandidateGetter,
    getSourceCandidateSourceGetter,
    getRuntimeSet,
    gulpProcessCacheKeys,
    opts,
    refreshGulpV4SourceCandidates,
    refreshRuntimeSet,
    refreshRuntimeSetForSource,
    registerAutoCssSource,
    resolveGulpStyleOutputExtension,
    resolveGulpTransformTimingDetails,
    resolveModuleGraphOptions,
    resolveWxmlHandlerOptions,
    resolveWxssFileHandlerOptions,
    resolveWxssUserHandlerOptions,
    runtimeState,
  } = context
  const { templateHandler, styleHandler, jsHandler } = opts

  function createWxssTransform(
    options: Partial<IStyleHandlerOptions>,
    stage: 'generate' | 'transform',
  ) {
    return createVinylTransform(`css:${stage}`, async (file) => {
      if (!file.contents) {
        return
      }
      const rawSource = file.contents.toString()
      const cssSourceChanged = await registerAutoCssSource(file, rawSource)
      const shouldUseGenerator = runtimeState.tailwindRuntime.majorVersion === 4
      let gulpSourceCandidateGetter = getSourceCandidateGetter()
      if (shouldUseGenerator) {
        gulpSourceCandidateGetter = await refreshGulpV4SourceCandidates(cssSourceChanged)
      }
      const nextRuntimeSet = await refreshRuntimeSet({
        forceRefresh: cssSourceChanged,
        forceCollect: cssSourceChanged,
        clearCache: cssSourceChanged,
      })
      const sourceCandidateSourceGetter = getSourceCandidateSourceGetter()
      const sourceTraceTokenSources = sourceCandidateSourceGetter
        ? createCssTokenSourceMap(sourceCandidateSourceGetter(undefined), opts)
        : undefined
      const sourceTraceSignature = createCssSourceTraceCacheSignature(sourceTraceTokenSources, opts)
      const sourceCandidateSignature = gulpSourceCandidateGetter
        ? `gulp-source-candidates:1:${[...gulpSourceCandidateGetter(undefined)].sort().join('\n')}`
        : undefined
      const styleOutputExtension = resolveGulpStyleOutputExtension(file)
      const outputSignature = styleOutputExtension
        ? `gulp-output:1:${stage}:${styleOutputExtension}`
        : `gulp-output:0:${stage}`
      await processCachedTask<string>({
        cache,
        cacheKey: file.path,
        hash: createRuntimeSetHash(rawSource, nextRuntimeSet, sourceTraceSignature, sourceCandidateSignature, outputSignature),
        applyResult(source) {
          file.contents = Buffer.from(source)
        },
        onCacheHit() {
          debug('css cache hit: %s', file.path)
        },
        async transform() {
          await runtimeState.readyPromise
          const cssHandlerOptions = resolveWxssFileHandlerOptions(file, rawSource, options)
          const generated = shouldUseGenerator
            ? await generateCssByGenerator({
                opts,
                runtimeState,
                runtime: nextRuntimeSet,
                rawSource,
                file: file.path,
                cssHandlerOptions,
                cssUserHandlerOptions: resolveWxssUserHandlerOptions(options),
                getSourceCandidatesForEntries: gulpSourceCandidateGetter,
                styleHandler,
                debug,
                deferCssAdaptation: stage === 'generate',
              })
            : undefined
          const transformedCss = generated?.css ?? (stage === 'generate'
            ? rawSource
            : (await styleHandler(rawSource, cssHandlerOptions)).css)
          if (stage === 'generate') {
            const preflightMode = generated?.metadata?.preflightMode
            if (preflightMode) {
              generatedCssPreflightModeByFile.set(file.path, preflightMode)
            }
            else {
              generatedCssPreflightModeByFile.delete(file.path)
            }
          }
          const css = annotateCssSourceTrace(transformedCss, {
            opts,
            tokenSources: sourceTraceTokenSources,
          })
          const generatedCss = stage === 'generate' && generated
            ? `${createBundlerGeneratedCssMarker('gulp', file.path)}\n${css}`
            : css
          const outputCss = stage === 'generate'
            ? generatedCss
            : rewriteLocalCssImportRequestsForOutput(generatedCss, {
                styleOutputExtension,
              })
          debug('css handle: %s', file.path)
          return { result: outputCss }
        },
      })
      rememberGulpProcessCacheKey(gulpProcessCacheKeys, file.path)
      pruneGulpProcessCache(cache, gulpProcessCacheKeys)
    }, () => resolveGulpTransformTimingDetails(`css:${stage}`))
  }

  const generateWxss = (options: Partial<IStyleHandlerOptions> = {}) => createWxssTransform(options, 'generate')
  const transformWxss = (options: Partial<IStyleHandlerOptions> = {}) => createWxssTransform(options, 'transform')
  const adaptWxss = (options: Partial<IStyleHandlerOptions> = {}) =>
    createVinylTransform('css:adapt', async (file) => {
      if (!file.contents) {
        return
      }
      const rawSource = file.contents.toString()
      const generatedCss = hasBundlerGeneratedCssMarker(rawSource)
      const source = generatedCss ? stripBundlerGeneratedCssMarkers(rawSource) : rawSource
      const styleOutputExtension = resolveGulpStyleOutputExtension(file)
      const cssHandlerOptions = resolveWxssFileHandlerOptions(file, source, options)
      const handled = await styleHandler(source, cssHandlerOptions)
      const preflightMode = generatedCssPreflightModeByFile.get(file.path)
      const finalized = generatedCss
        ? finalizeMiniProgramGeneratorCss(
            handled.css,
            'weapp',
            runtimeState.tailwindRuntime.majorVersion,
            opts.cssPreflight,
            {
              injectPreflight: preflightMode?.inject ?? cssHandlerOptions.isMainChunk,
              preservePreflight: preflightMode?.preserve ?? cssHandlerOptions.isMainChunk,
              styleOptions: cssHandlerOptions,
            },
          )
        : handled.css
      file.contents = Buffer.from(rewriteLocalCssImportRequestsForOutput(finalized, {
        styleOutputExtension,
      }))
      debug('css adapt: %s', file.path)
    }, () => resolveGulpTransformTimingDetails('css:adapt'))

  const transformJs = (options: Partial<CreateJsHandlerOptions> = {}) =>
    createVinylTransform('js', async (file) => {
      if (!file.contents) {
        return
      }
      const filename = path.resolve(file.path)
      const rawSource = file.contents.toString()
      await refreshRuntimeSetForSource(file, rawSource, 'js')
      await runtimeState.readyPromise
      const moduleGraph = resolveModuleGraphOptions(options.moduleGraph)
      const handlerOptions: CreateJsHandlerOptions = {
        ...options,
        generateMap: false,
        filename,
        moduleGraph,
        babelParserOptions: {
          ...(options?.babelParserOptions ?? {}),
          sourceFilename: filename,
        },
      }
      if (runtimeState.tailwindRuntime.majorVersion !== undefined) {
        handlerOptions.tailwindcssMajorVersion = runtimeState.tailwindRuntime.majorVersion
      }
      await processCachedTask<string>({
        cache,
        cacheKey: file.path,
        rawSource,
        applyResult(source) {
          file.contents = Buffer.from(source)
        },
        onCacheHit() {
          debug('js cache hit: %s', file.path)
        },
        async transform() {
          await runtimeState.readyPromise
          const currentSource = file.contents?.toString() ?? rawSource
          if (shouldSkipJsTransform(currentSource, {
            ...handlerOptions,
            classNameSet: getRuntimeSet(),
          } as CreateJsHandlerOptions)) {
            return { result: currentSource }
          }
          const { code } = await jsHandler(currentSource, getRuntimeSet(), handlerOptions)
          debug('js handle: %s', file.path)
          return { result: code }
        },
      })
      rememberGulpProcessCacheKey(gulpProcessCacheKeys, file.path)
      pruneGulpProcessCache(cache, gulpProcessCacheKeys)
    }, () => resolveGulpTransformTimingDetails('js'))

  const transformWxml = (options: Partial<ITemplateHandlerOptions> = {}) =>
    createVinylTransform('html', async (file) => {
      if (!file.contents) {
        return
      }
      const rawSource = file.contents.toString()
      await refreshRuntimeSetForSource(file, rawSource, 'html')
      await runtimeState.readyPromise
      await processCachedTask<string>({
        cache,
        cacheKey: file.path,
        rawSource,
        applyResult(source) {
          file.contents = Buffer.from(source)
        },
        onCacheHit() {
          debug('html cache hit: %s', file.path)
        },
        async transform() {
          await runtimeState.readyPromise
          const code = await templateHandler(rawSource, resolveWxmlHandlerOptions(options))
          debug('html handle: %s', file.path)
          return { result: code }
        },
      })
      rememberGulpProcessCacheKey(gulpProcessCacheKeys, file.path)
      pruneGulpProcessCache(cache, gulpProcessCacheKeys)
    }, () => resolveGulpTransformTimingDetails('html'))

  return { adaptWxss, generateWxss, transformWxss, transformWxml, transformJs }
}
