import type { ResolvedConfig } from 'vite'
import path from 'node:path'
import process from 'node:process'
import { cleanUrl, normalizePath } from '@/bundlers/vite/utils'
import {
  collectUniAppXHarmonyApplyStyleSourcesFromSource,
  collectUniAppXHarmonyApplyUtilitiesFromSources,
  createUniAppXHarmonyApplyGeneratorSource,
  expandUniAppXHarmonyApplyStyles,
} from '../style-asset'

interface HarmonyApplyHookContext {
  addWatchFile?: (id: string) => void
}

interface CreateUniAppXHarmonyApplyExpanderOptions {
  generateCss?: ((id: string, code: string, hookContext?: HarmonyApplyHookContext & { transient?: boolean }) => Promise<string | undefined> | string | undefined) | undefined
  getResolvedConfig: () => ResolvedConfig | undefined
  isHarmonyBuildTarget: () => boolean
  transformCss: (css: string, id: string) => Promise<string>
}

function createStableHash(input: string) {
  let hash = 2166136261
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

export function createUniAppXHarmonyApplyExpander(options: CreateUniAppXHarmonyApplyExpanderOptions) {
  const styleSources = new Set<string>()
  const utilities = new Set<string>()

  function rememberSource(code: string, id: string) {
    const sources = collectUniAppXHarmonyApplyStyleSourcesFromSource(code, id)
    for (const source of sources) {
      styleSources.add(source)
      for (const utility of collectUniAppXHarmonyApplyUtilitiesFromSources([source])) {
        utilities.add(utility)
      }
    }
  }

  async function expandStyles(code: string, id: string, hookContext: HarmonyApplyHookContext) {
    if (!options.isHarmonyBuildTarget() || !code.includes('@apply')) {
      return code
    }
    const sources = collectUniAppXHarmonyApplyStyleSourcesFromSource(code, id)
    const sourceUtilities = collectUniAppXHarmonyApplyUtilitiesFromSources(sources)
    if (sources.length === 0 || sourceUtilities.size === 0) {
      return code
    }
    const cssFile = path.resolve(
      options.getResolvedConfig()?.root ?? process.cwd(),
      `uni-app-x-harmony-apply-${createStableHash(normalizePath(cleanUrl(id)))}.css`,
    )
    const generatedCss = await options.generateCss?.(
      cssFile,
      createUniAppXHarmonyApplyGeneratorSource(sources, sourceUtilities),
      {
        addWatchFile: hookContext.addWatchFile?.bind(hookContext),
        transient: true,
      },
    )
    if (typeof generatedCss !== 'string' || generatedCss.trim().length === 0) {
      return code
    }
    return expandUniAppXHarmonyApplyStyles(code, await options.transformCss(generatedCss, id))
  }

  return {
    expandStyles,
    rememberSource,
    styleSources,
    utilities,
  }
}
