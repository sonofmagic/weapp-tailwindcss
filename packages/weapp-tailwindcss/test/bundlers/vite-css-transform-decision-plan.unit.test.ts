import { describe, expect, it } from 'vitest'
import {
  resolveViteCssLinkedImpactSignature,
  resolveViteCssTransformCachePlan,
  resolveViteCssTransformDecisionPlan,
} from '../../src/bundlers/vite/generate-bundle/css-transform-decision-plan'

function createDecisionOptions() {
  return {
    alreadyProcessedCssAsset: true,
    cssAssetIdentityKind: 'bundler-generated' as const,
    cssIsMainChunk: false,
    generatorCandidateSignatureInitialized: true,
    generatorCandidatesChanged: false,
    generatorRawSource: '.generated { color: red; }',
    hasCurrentTailwindGenerationDirective: false,
    hasRememberedApplySource: false,
    hasRuntimeAffectingChanges: false,
    hasSameOutputRememberedTailwindGenerationSource: false,
    hasStaleViteProcessedCssSource: true,
    isCollectedBundlerGeneratedCssFile: true,
    isProcessCssFile: false,
    isRuntimeLinkedCss: false,
    rawSource: '/* weapp-tailwindcss:bundler-generated */\n.generated { color: red; }',
    shouldProcessTailwindGeneration: true,
    shouldRegenerateMainPackageCssWithScopedCandidates: false,
    useIncrementalMode: true,
    vitePipelineCssAsset: true,
    viteProcessedCssAsset: true,
  }
}

describe('vite css transform decision plan', () => {
  it('reuses stable stale generated css without tracking the generator', () => {
    const plan = resolveViteCssTransformDecisionPlan(createDecisionOptions())

    expect(plan.shouldPreserveCollectedViteCssAsset).toBe(true)
    expect(plan.shouldPreserveStaleGeneratedCssAsset).toBe(true)
    expect(plan.shouldReuseProcessedCss).toBe(true)
    expect(plan.shouldTrackGeneratorRuntime).toBe(true)
    expect(plan.shouldReplayLastCss).toBe(false)
    expect(plan.strippedViteProcessedCss).toContain('.generated')
  })

  it('never preserves a generator placeholder as stale generated css', () => {
    const plan = resolveViteCssTransformDecisionPlan({
      ...createDecisionOptions(),
      cssAssetIdentityKind: 'generator-placeholder',
    })

    expect(plan.shouldPreserveStaleGeneratedCssAsset).toBe(false)
    expect(plan.shouldReuseProcessedCss).toBe(false)
  })

  it('regenerates processed css when candidates change', () => {
    const plan = resolveViteCssTransformDecisionPlan({
      ...createDecisionOptions(),
      generatorCandidatesChanged: true,
      generatorRawSource: '@import "tailwindcss";',
    })

    expect(plan.shouldRegenerateCollectedViteCss).toBe(true)
    expect(plan.shouldRefreshViteProcessedCssByCandidates).toBe(true)
    expect(plan.shouldTrackGeneratorRuntime).toBe(true)
    expect(plan.shouldReuseProcessedCss).toBe(false)
    expect(plan.shouldReplayLastCss).toBe(false)
  })

  it('does not replay a last result for runtime-linked css', () => {
    const plan = resolveViteCssTransformDecisionPlan({
      ...createDecisionOptions(),
      isRuntimeLinkedCss: true,
    })

    expect(plan.shouldReplayLastCss).toBe(false)
  })
})

describe('vite css transform cache plan', () => {
  it('builds stable cache and remembered signatures', () => {
    expect(resolveViteCssTransformCachePlan({
      cssIsMainChunk: true,
      cssRuntimeAffectingHash: 'raw-hash',
      cssShareScope: 'scope',
      linkedImpactSignature: 'linked',
      outputFile: 'app.acss',
      runtimeSignature: 'runtime',
      scopedGeneratorCandidateSignature: 'candidates',
      sourceTraceSignature: 'trace',
      tailwindcssMajorVersion: 4,
    })).toEqual({
      cssCacheKey: 'app.acss',
      cssHashKey: 'app.acss:css:runtime:candidates:4',
      cssRuntimeSignature: 'runtime:candidates',
      cssSharedCacheKey: 'scope:runtime:candidates:4:1:raw-hash:candidates:trace',
      cssTaskHash: 'raw-hash:candidates:trace:linked',
      rememberedCssRuntimeSignature: 'runtime:candidates:raw-hash',
    })
  })

  it('sorts linked html and js changes before resolving signatures', () => {
    expect(resolveViteCssLinkedImpactSignature({
      changedHtmlFiles: new Set(['b.wxml', 'a.wxml']),
      changedJsFiles: new Set(['d.js', 'c.js']),
      runtimeAffectingSignatureByFile: new Map([
        ['a.wxml', 'html-a'],
        ['b.wxml', 'html-b'],
        ['c.js', 'js-c'],
        ['d.js', 'js-d'],
      ]),
    })).toBe('html-a:html-b:js-c:js-d')
  })
})
