import type { ModuleNode, Plugin } from 'vite'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { hasTailwindRootDirectives } from '@/bundlers/shared/generator-css/directives'
import { createCompilationDependencyChanges, recordCompilationDependencyChanges } from '@/compiler'
import { vitePluginName } from '@/constants'
import { isSourceStyleRequest } from '../../shared/style-requests'
import { shouldCollectTransformedSourceCandidates } from '../css-memory'
import { hasSelfAcceptingNonStyleHotModule, mergeHotModulesByIdentity, resolveHotSourceModules, resolveHotTailwindCssModules, sendFullReloadForUnresolvedHotUpdate, sendSupplementalCssHotUpdates } from '../hot-css-modules'
import { isSourceCandidateRequest } from '../source-candidates'
import { cleanUrl, isCSSRequest } from '../utils'

export function createFrameworkSourceCandidatesPlugin(options: any): Plugin {
  const hasDifferentHotModules = (left: ModuleNode[], right: ModuleNode[]) => left.length !== right.length
    || left.some((mod, index) => mod !== right[index])
  const hasTemplateHotSourceModule = (modules: Array<{ id?: string | null, url?: string | null }>) => modules.some((mod) => {
    const request = mod.url ?? mod.id
    return typeof request === 'string'
      && /\.(?:uvue|nvue)(?:\?import)?$/i.test(request)
  })
  const sendSupplementalSourceHotUpdates = (ctx: any, modules: ModuleNode[]) => {
    const root = ctx.server.config?.root ?? process.cwd()
    const relatedModules = modules.flatMap(mod => [mod, ...(mod.importedModules ?? [])])
    const updates = relatedModules
      .filter(mod => !isSourceStyleRequest(mod.id ?? mod.url))
      .map((mod) => {
        let hotPath: string | undefined
        if (typeof mod.id === 'string' && path.isAbsolute(mod.id)) {
          const relative = typeof mod.url === 'string' && mod.url.startsWith('/pages/')
            ? path.relative(path.dirname(root), mod.id)
            : path.relative(root, mod.id)
          if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
            hotPath = `/${relative.split(path.sep).join('/')}`
          }
        }
        hotPath ??= mod.url ?? (typeof mod.id === 'string' && mod.id.startsWith('/') ? mod.id : undefined)
        return hotPath
          ? { acceptedPath: hotPath, explicitImportRequired: false, isWithinCircularImport: false, path: hotPath, timestamp: ctx.timestamp, type: 'js-update' as const }
          : undefined
      })
      .filter((update): update is NonNullable<typeof update> => update !== undefined)
    if (updates.length > 0) {
      ctx.server.ws?.send?.({ type: 'update', updates })
    }
  }
  return {
    name: `${vitePluginName}:source-candidates`,
    enforce: 'pre',
    async load(id) {
      if (
        !options.shouldOwnTailwindGeneration
        || options.isWebOrNativeAppPlatform(options.resolveViteStylePlatform())
        || !isCSSRequest(id)
        || !shouldCollectTransformedSourceCandidates(id)
      ) {
        return
      }
      const file = cleanUrl(id)
      const rawCode = await readFile(file, 'utf8').catch(() => undefined)
      if (typeof rawCode !== 'string') {
        return
      }
      options.rememberOriginalCssLayerSource(id, rawCode)
      const transformedCode = options.transformEarlyMiniProgramCss(rawCode)
      if (transformedCode === rawCode) {
        return
      }
      options.cssMemory.rememberKnownSfcSource(id, transformedCode)
      return transformedCode
    },
    transform: {
      order: 'pre',
      async handler(code, id) {
        if (options.hasUserCssLayerBlocks(code)) {
          options.rememberOriginalCssLayerSource(id, code)
        }
        let transformedCode = code
        if (options.shouldOwnTailwindGeneration && !options.resolveCurrentGeneratorBranch().isWeb && isCSSRequest(id)) {
          transformedCode = options.transformEarlyMiniProgramCss(code)
        }
        const shouldReturnTransformedCode = transformedCode !== code
        if (options.shouldOwnTailwindGeneration && shouldCollectTransformedSourceCandidates(id)) {
          options.cssMemory.rememberKnownSfcSource(id, transformedCode)
          if (isCSSRequest(id) && hasTailwindRootDirectives(transformedCode, { importFallback: options.resolveCurrentGeneratorOptions().importFallback })) {
            options.rememberTailwindRootCssModule(id)
          }
        }
        if (!options.shouldOwnTailwindGeneration || !isSourceCandidateRequest(id) || !shouldCollectTransformedSourceCandidates(id)) {
          return shouldReturnTransformedCode ? { code: transformedCode, map: null } : undefined
        }
        return options.hmrTimingRecorder.measure('sourceCandidates.transform', async () => {
          options.invalidateRecordedGeneratorCandidates()
          const file = cleanUrl(id)
          if (!options.sourceScanSession.matches(file)) {
            options.sourceCandidateCollector.remove(file)
            options.sourceScanSession.cacheCurrent()
            return
          }
          await options.sourceCandidateCollector.merge(id, transformedCode)
          options.sourceScanSession.cacheCurrent()
          return shouldReturnTransformedCode ? { code: transformedCode, map: null } : undefined
        }, { emit: false })
      },
    },
    async watchChange(id, change) {
      recordCompilationDependencyChanges(options.runtimeState, createCompilationDependencyChanges([path.resolve(cleanUrl(id))]))
      await options.hmrTimingRecorder.measure('sourceCandidates.watchChange', async () => {
        if (options.shouldOwnTailwindGeneration && isSourceCandidateRequest(id)) {
          options.invalidateRecordedGeneratorCandidates()
        }
        if (options.sourceScanSession.isDependency(id)) {
          options.sourceScanSession.invalidate()
        }
        if (change.event === 'delete') {
          const file = cleanUrl(id)
          const sourceCandidateChange = options.sourceCandidateCollector.remove(file)
          options.sourceScanSession.cacheCurrent()
          options.hmrCandidateState.apply(options.hmrCandidateState.createChange(file, sourceCandidateChange, {
            runtimeAffecting: options.sourceScanSession.isDependency(file),
          }))
          return
        }
        const changedSource = options.shouldOwnTailwindGeneration && isSourceCandidateRequest(id) && isCSSRequest(id)
          ? await readFile(cleanUrl(id), 'utf8').catch(() => undefined)
          : undefined
        if (typeof changedSource === 'string') {
          options.rememberOriginalCssLayerSource(id, changedSource)
          await options.refreshTailwindRootCssSource(id, changedSource)
        }
        await options.sourceScanSession.syncChangedFile(id, changedSource)
      }, { emit: false })
    },
    handleHotUpdate: {
      order: 'post',
      async handler(ctx) {
        recordCompilationDependencyChanges(options.runtimeState, createCompilationDependencyChanges([path.resolve(cleanUrl(ctx.file))]))
        return options.hmrTimingRecorder.measure('sourceCandidates.handleHotUpdate', async () => {
          const isSourceCandidateHotUpdate = options.shouldOwnTailwindGeneration && isSourceCandidateRequest(ctx.file)
          if (isSourceCandidateHotUpdate && isSourceStyleRequest(ctx.file)) {
            for (const mod of ctx.modules) {
              for (const id of [mod.id, mod.url, mod.file]) {
                if (typeof id === 'string' && id.length > 0) {
                  options.rememberTailwindRootCssModule(id)
                }
              }
            }
          }
          const hotSource = isSourceCandidateHotUpdate && typeof ctx.read === 'function'
            ? await ctx.read().catch(() => undefined)
            : undefined
          if (typeof hotSource === 'string' && isCSSRequest(ctx.file)) {
            options.rememberOriginalCssLayerSource(ctx.file, hotSource)
            await options.refreshTailwindRootCssSource(ctx.file, hotSource)
          }
          const sourceCandidateChange = await options.sourceScanSession.syncChangedFile(ctx.file, hotSource)
          options.sourceScanSession.consumeHotUpdateChange(ctx.file)
          const isWebLikeHotUpdate = options.isCurrentWebLikeStylePlatform()
          let canUseHmrCandidateAppend = false
          if (isSourceCandidateHotUpdate) {
            options.invalidateRecordedGeneratorCandidates()
            const preserveDeletedCssInHmr = options.resolveCurrentGeneratorOptions().hmr.preserveDeletedCss
            canUseHmrCandidateAppend = preserveDeletedCssInHmr
              && !isSourceStyleRequest(ctx.file)
              && sourceCandidateChange !== undefined
              && !sourceCandidateChange.runtimeAffecting
            if (!canUseHmrCandidateAppend) {
              if (sourceCandidateChange === undefined) {
                options.hmrCandidateState.clear()
                if (!preserveDeletedCssInHmr && !isSourceStyleRequest(ctx.file)) {
                  options.hmrCandidateState.queueFullRegeneration()
                }
              }
              if (isWebLikeHotUpdate) {
                await options.refreshRuntimeStateForAutoCssSources?.(true)
                await options.sourceScanSession.sync({ force: true })
              }
            }
          }
          if (isSourceCandidateHotUpdate) {
            await options.sourceScanSession.waitForPendingSyncs()
          }
          if (isSourceCandidateHotUpdate && !isSourceStyleRequest(ctx.file)) {
            options.hmrCandidateState.reconcileRuntimeCandidates(
              ctx.file,
              options.sourceCandidateCollector.values(),
              options.tailwindRootCssModuleIds,
            )
          }
          const hotTailwindCssModuleIds = isSourceStyleRequest(ctx.file)
            ? [ctx.file]
            : options.tailwindRootCssModuleIds
          const cssModules = await resolveHotTailwindCssModules(ctx, hotTailwindCssModuleIds)
          const hotRoot = ctx.server.config?.root ?? process.cwd()
          const sourceModules = isSourceCandidateHotUpdate && !isSourceStyleRequest(ctx.file)
            ? await resolveHotSourceModules(ctx)
            : ctx.modules
          if (isWebLikeHotUpdate && isSourceCandidateHotUpdate && !isSourceStyleRequest(ctx.file)) {
            sendSupplementalSourceHotUpdates(ctx, sourceModules)
            if (sourceModules.some((mod) => {
              const id = mod.id ?? mod.url
              return typeof id === 'string' && /[?&]macro=true(?:&|$)/.test(id) === false
                && typeof mod.url === 'string' && mod.url.startsWith('/pages/')
                && /\.vue(?:$|[?#])/i.test(id)
            })) {
              queueMicrotask(() => sendFullReloadForUnresolvedHotUpdate(ctx))
              return []
            }
          }
          const hasHmrCandidateAppend = options.hmrCandidateState.hasPendingCandidateAppend()
            || (canUseHmrCandidateAppend && sourceCandidateChange !== undefined && sourceCandidateChange.addedCandidates.size > 0)
          if (
            isSourceCandidateHotUpdate
            && !isSourceStyleRequest(ctx.file)
            && !hasHmrCandidateAppend
            && !isWebLikeHotUpdate
            && (
              (!hasSelfAcceptingNonStyleHotModule(sourceModules) && cssModules.length === 0)
              || (cssModules.length > 0 && options.isUniViteProject())
            )
          ) {
            sendFullReloadForUnresolvedHotUpdate(ctx)
            return []
          }
          if (
            isWebLikeHotUpdate
            && isSourceCandidateHotUpdate
            && !isSourceStyleRequest(ctx.file)
            && sourceModules.some(mod => options.isNuxtPageHotModule?.(mod.id ?? mod.url))
          ) {
            sendFullReloadForUnresolvedHotUpdate(ctx)
            return []
          }
          if (
            isWebLikeHotUpdate
            && isSourceCandidateHotUpdate
            && !isSourceStyleRequest(ctx.file)
            && /\.(?:uvue|nvue)$/i.test(cleanUrl(ctx.file))
            && !hasTemplateHotSourceModule(sourceModules)
          ) {
            sendFullReloadForUnresolvedHotUpdate(ctx)
            return []
          }
          const shouldSendSupplementalCssHotUpdates = !(
            isWebLikeHotUpdate
            && isSourceCandidateHotUpdate
            && !isSourceStyleRequest(ctx.file)
            && sourceCandidateChange !== undefined
            && (
              options.resolveCurrentGeneratorOptions().hmr.preserveDeletedCss
              && !sourceCandidateChange.runtimeAffecting
              && sourceCandidateChange.addedCandidates.size === 0
              && sourceCandidateChange.removedCandidates.size > 0
            )
          )
          const supplementalCssFallbackIds = new Set([
            ...options.tailwindRootCssModuleIds,
            ...options.viteProcessedCssSourceFiles,
          ])
          if (options.hmrCandidateState.hasPendingChange()) {
            options.hmrCandidateState.armTargets(cssModules, supplementalCssFallbackIds)
          }
          if (shouldSendSupplementalCssHotUpdates) {
            sendSupplementalCssHotUpdates(ctx, cssModules, supplementalCssFallbackIds)
          }
          if (isWebLikeHotUpdate && isSourceCandidateHotUpdate && !isSourceStyleRequest(ctx.file)) {
            return cssModules.length > 0
              ? mergeHotModulesByIdentity(hotRoot, sourceModules, cssModules)
              : hasDifferentHotModules(sourceModules, ctx.modules) ? sourceModules : undefined
          }
          if (isSourceCandidateHotUpdate && !isSourceStyleRequest(ctx.file) && cssModules.length > 0) {
            return mergeHotModulesByIdentity(hotRoot, sourceModules, cssModules)
          }
          return cssModules.length > 0 ? mergeHotModulesByIdentity(hotRoot, ctx.modules, cssModules) : undefined
        }, { emit: false })
      },
    },
    async buildStart() {
      await options.hmrTimingRecorder.measure('sourceCandidates.buildStart', options.prepareTailwindGeneration, { emit: false })
    },
    generateBundle: options.preGenerateBundleHook,
  }
}
