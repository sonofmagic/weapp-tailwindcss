import type { OutputAsset, OutputChunk } from 'rollup'
import type { ResolvedConfig } from 'vite'
import type { OutputEntry } from './bundle-entries'
import type { CreateJsHandlerOptions, InternalUserDefinedOptions, LinkedJsModuleResult } from '@/types'
import path from 'node:path'
import process from 'node:process'
import { createUniAppXAssetTask } from '@/uni-app-x'
import { getGroupedEntries } from '@/utils'
import { processCachedTask } from '../shared/cache'
import { toAbsoluteOutputPath } from '../shared/module-graph'
import { pushConcurrentTaskFactories } from '../shared/run-tasks'
import { applyLinkedResults, createBundleModuleGraphOptions, isJavaScriptEntry } from './bundle-entries'

interface GenerateBundleContext {
  opts: InternalUserDefinedOptions
  runtimeState: {
    twPatcher: InternalUserDefinedOptions['twPatcher']
    patchPromise: Promise<void>
  }
  ensureRuntimeClassSet: (force?: boolean) => Promise<Set<string>>
  debug: (format: string, ...args: unknown[]) => void
  getResolvedConfig: () => ResolvedConfig | undefined
}

export function createGenerateBundleHook(context: GenerateBundleContext) {
  return async function generateBundle(_opt: unknown, bundle: Record<string, OutputAsset | OutputChunk>) {
    const {
      opts,
      runtimeState,
      ensureRuntimeClassSet,
      debug,
      getResolvedConfig,
    } = context
    const {
      appType,
      cache,
      mainCssChunkMatcher,
      onEnd,
      onStart,
      onUpdate,
      styleHandler,
      templateHandler,
      jsHandler,
      uniAppX,
    } = opts

    await runtimeState.patchPromise
    debug('start')
    onStart()

    const entries = Object.entries(bundle)
    const resolvedConfig = getResolvedConfig()
    const rootDir = resolvedConfig?.root ? path.resolve(resolvedConfig.root) : process.cwd()
    const outDir = resolvedConfig?.build?.outDir
      ? path.resolve(rootDir, resolvedConfig.build.outDir)
      : rootDir
    const jsEntries = new Map<string, OutputEntry>()
    for (const [fileName, output] of entries) {
      const entry: OutputEntry = { fileName, output }
      if (isJavaScriptEntry(entry)) {
        const absolute = toAbsoluteOutputPath(fileName, outDir)
        jsEntries.set(absolute, entry)
      }
    }
    const moduleGraphOptions = createBundleModuleGraphOptions(outDir, jsEntries)
    const groupedEntries = getGroupedEntries(entries, opts)
    const runtime = await ensureRuntimeClassSet(true)
    debug('get runtimeSet, class count: %d', runtime.size)
    const handleLinkedUpdate = (fileName: string, previous: string, next: string) => {
      onUpdate(fileName, previous, next)
      debug('js linked handle: %s', fileName)
    }
    const pendingLinkedUpdates: Array<() => void> = []
    const scheduleLinkedApply = (entry: OutputEntry, code: string) => {
      pendingLinkedUpdates.push(() => {
        if (entry.output.type === 'chunk') {
          entry.output.code = code
        }
        else {
          entry.output.source = code
        }
      })
    }
    const applyLinkedUpdates = (linked?: Record<string, LinkedJsModuleResult>) => {
      applyLinkedResults(linked, jsEntries, handleLinkedUpdate, scheduleLinkedApply)
    }
    const createHandlerOptions = (absoluteFilename: string, extra?: CreateJsHandlerOptions): CreateJsHandlerOptions => ({
      ...extra,
      filename: absoluteFilename,
      moduleGraph: moduleGraphOptions,
      babelParserOptions: {
        ...(extra?.babelParserOptions ?? {}),
        sourceFilename: absoluteFilename,
      },
    })
    const tasks: Promise<void>[] = []
    if (Array.isArray(groupedEntries.html)) {
      for (const [file, originalSource] of groupedEntries.html as [string, OutputAsset][]) {
        const rawSource = originalSource.source.toString()
        tasks.push(
          processCachedTask<string>({
            cache,
            cacheKey: file,
            rawSource,
            applyResult(source) {
              originalSource.source = source
            },
            onCacheHit() {
              debug('html cache hit: %s', file)
            },
            async transform() {
              const transformed = await templateHandler(rawSource, {
                runtimeSet: runtime,
              })
              onUpdate(file, rawSource, transformed)
              debug('html handle: %s', file)
              return {
                result: transformed,
              }
            },
          }),
        )
      }
    }

    const jsTaskFactories: Array<() => Promise<void>> = []

    if (Array.isArray(groupedEntries.js)) {
      for (const [file, originalSource] of groupedEntries.js as [string, OutputAsset | OutputChunk][]) {
        if (originalSource.type === 'chunk') {
          const absoluteFile = toAbsoluteOutputPath(file, outDir)
          const initialRawSource = originalSource.code
          jsTaskFactories.push(async () => {
            await processCachedTask<string>({
              cache,
              cacheKey: file,
              rawSource: initialRawSource,
              applyResult(source) {
                originalSource.code = source
              },
              onCacheHit() {
                debug('js cache hit: %s', file)
              },
              async transform() {
                const rawSource = originalSource.code
                const { code, linked } = await jsHandler(rawSource, runtime, createHandlerOptions(absoluteFile))
                onUpdate(file, rawSource, code)
                debug('js handle: %s', file)
                applyLinkedUpdates(linked)
                return {
                  result: code,
                }
              },
            })
          })
        }
        else if (uniAppX && originalSource.type === 'asset') {
          jsTaskFactories.push(
            createUniAppXAssetTask(
              file,
              originalSource,
              outDir,
              {
                cache,
                createHandlerOptions,
                debug,
                jsHandler,
                onUpdate,
                runtimeSet: runtime,
                applyLinkedResults: applyLinkedUpdates,
                uniAppX,
              },
            ),
          )
        }
      }
    }

    if (Array.isArray(groupedEntries.css)) {
      for (const [file, originalSource] of groupedEntries.css as [string, OutputAsset][]) {
        const rawSource = originalSource.source.toString()
        tasks.push(
          processCachedTask<string>({
            cache,
            cacheKey: file,
            rawSource,
            applyResult(source) {
              originalSource.source = source
            },
            onCacheHit() {
              debug('css cache hit: %s', file)
            },
            async transform() {
              await runtimeState.patchPromise
              const { css } = await styleHandler(rawSource, {
                isMainChunk: mainCssChunkMatcher(originalSource.fileName, appType),
                postcssOptions: {
                  options: {
                    from: file,
                  },
                },
                majorVersion: runtimeState.twPatcher.majorVersion,
              })
              onUpdate(file, rawSource, css)
              debug('css handle: %s', file)
              return {
                result: css,
              }
            },
          }),
        )
      }
    }
    pushConcurrentTaskFactories(tasks, jsTaskFactories)

    await Promise.all(tasks)
    for (const apply of pendingLinkedUpdates) {
      apply()
    }
    onEnd()
    debug('end')
  }
}
