import type { Plugin } from 'vite'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { hasTailwindRootDirectives } from '@/bundlers/shared/generator-css/directives'
import { createCompilationDependencyChanges, recordCompilationDependencyChanges } from '@/compiler'
import { vitePluginName } from '@/constants'
import { isSourceStyleRequest } from '../../shared/style-requests'
import { shouldCollectTransformedSourceCandidates } from '../css-memory'
import { hasSelfAcceptingNonStyleHotModule, resolveHotSourceModules, resolveHotTailwindCssModules, sendFullReloadForUnresolvedHotUpdate, sendSupplementalCssHotUpdates } from '../hot-css-modules'
import { isSourceCandidateRequest } from '../source-candidates'
import { cleanUrl, isCSSRequest } from '../utils'

export function createFrameworkSourceCandidatesPlugin(options: any): Plugin {
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
        if (options.shouldOwnTailwindGeneration) {
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
        await options.sourceScanSession.syncChangedFile(id)
      }, { emit: false })
    },
    async handleHotUpdate(ctx) {
      recordCompilationDependencyChanges(options.runtimeState, createCompilationDependencyChanges([path.resolve(cleanUrl(ctx.file))]))
      return options.hmrTimingRecorder.measure('sourceCandidates.handleHotUpdate', async () => {
        const isSourceCandidateHotUpdate = options.shouldOwnTailwindGeneration && isSourceCandidateRequest(ctx.file)
        if (isSourceCandidateHotUpdate && isSourceStyleRequest(ctx.file)) {
          for (const mod of ctx.modules) {
            options.rememberTailwindRootCssModule(mod.id)
            options.rememberTailwindRootCssModule(mod.url)
            options.rememberTailwindRootCssModule(mod.file)
          }
        }
        const hotSource = isSourceCandidateHotUpdate && typeof ctx.read === 'function'
          ? await ctx.read().catch(() => undefined)
          : undefined
        if (typeof hotSource === 'string' && isCSSRequest(ctx.file)) {
          options.rememberOriginalCssLayerSource(ctx.file, hotSource)
        }
        const sourceCandidateChange = await options.sourceScanSession.syncChangedFile(ctx.file, hotSource)
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
        const cssModules = resolveHotTailwindCssModules(ctx, options.tailwindRootCssModuleIds)
        const sourceModules = isSourceCandidateHotUpdate && !isSourceStyleRequest(ctx.file)
          ? resolveHotSourceModules(ctx)
          : ctx.modules
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
          && ctx.modules.some(mod => options.isNuxtPageMacroHotModule(mod.id ?? mod.url))
        ) {
          sendFullReloadForUnresolvedHotUpdate(ctx)
          return []
        }
        const shouldSendSupplementalCssHotUpdates = !(
          isWebLikeHotUpdate
          && isSourceCandidateHotUpdate
          && !isSourceStyleRequest(ctx.file)
          && options.resolveCurrentGeneratorOptions().hmr.preserveDeletedCss
          && sourceCandidateChange !== undefined
          && !sourceCandidateChange.runtimeAffecting
          && sourceCandidateChange.addedCandidates.size === 0
          && sourceCandidateChange.removedCandidates.size > 0
        )
        const supplementalCssFallbackIds = new Set([
          ...options.tailwindRootCssModuleIds,
          ...options.viteProcessedCssSourceFiles,
        ])
        if (hasHmrCandidateAppend) {
          options.hmrCandidateState.armTargets(cssModules, supplementalCssFallbackIds)
        }
        if (shouldSendSupplementalCssHotUpdates) {
          sendSupplementalCssHotUpdates(ctx, cssModules, supplementalCssFallbackIds)
        }
        if (isWebLikeHotUpdate && isSourceCandidateHotUpdate && !isSourceStyleRequest(ctx.file)) {
          return undefined
        }
        if (isSourceCandidateHotUpdate && !isSourceStyleRequest(ctx.file) && cssModules.length > 0) {
          return [...sourceModules, ...cssModules]
        }
        return cssModules.length > 0 ? [...ctx.modules, ...cssModules] : undefined
      }, { emit: false })
    },
    async buildStart() {
      await options.hmrTimingRecorder.measure('sourceCandidates.buildStart', options.prepareTailwindGeneration, { emit: false })
    },
    generateBundle: options.preGenerateBundleHook,
  }
}
