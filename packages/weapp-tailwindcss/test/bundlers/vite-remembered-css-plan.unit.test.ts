import type { OutputAsset } from 'rollup'
import { describe, expect, it, vi } from 'vitest'
import { resolveRememberedCssSourcePlan } from '@/bundlers/vite/generate-bundle/remembered-css-plan'

function createAsset(fileName: string, source = ''): OutputAsset {
  return {
    fileName,
    name: undefined,
    needsCodeReference: false,
    originalFileName: undefined,
    originalFileNames: [],
    source,
    type: 'asset',
  }
}

function createOptions(overrides: Partial<Parameters<typeof resolveRememberedCssSourcePlan>[0]> = {}) {
  return {
    configuredSourceFileKeys: new Set<string>(),
    cssMatcher: (file: string) => file.endsWith('.wxss'),
    currentRawSourceHasExplicitScanContext: false,
    debug: vi.fn(),
    explicitConfiguredSourceFileKeys: new Set<string>(),
    file: 'pages/index/index.wxss',
    getRememberedCssSources: () => new Map(),
    getSfcSource: undefined,
    hasExplicitConfiguredRootSource: false,
    normalizeConfiguredSourceFile: (file: string) => file.replace(/[?#].*$/, ''),
    originalSource: createAsset('pages/index/index.wxss'),
    outputFile: 'pages/index/index.wxss',
    outputRoot: '/repo/dist',
    resolveConfiguredRootSource: () => undefined,
    resolveMatchedOutputFile: () => undefined,
    snapshot: { entries: [] } as any,
    sourceRoot: '/repo/src',
    temporaryOutput: false,
    ...overrides,
  }
}

describe('vite remembered css source plan', () => {
  it('filters remembered sources against explicit scan and configured output scope', async () => {
    const sources = new Map([
      ['plain', {
        outputFile: 'pages/index/index.wxss',
        rawSource: '.plain{}',
        sourceFile: '/repo/src/plain.css',
      }],
      ['scanned', {
        outputFile: 'pages/index/index.wxss',
        rawSource: '@source "./pages/**/*.vue";',
        sourceFile: '/repo/src/scanned.css',
      }],
      ['other-output', {
        outputFile: 'pages/index/index.wxss',
        rawSource: '@source "./other/**/*.vue";',
        sourceFile: '/repo/src/other.css',
      }],
    ])

    const plan = await resolveRememberedCssSourcePlan(createOptions({
      configuredSourceFileKeys: new Set(['/repo/src/other.css']),
      currentRawSourceHasExplicitScanContext: true,
      getRememberedCssSources: () => sources,
      resolveMatchedOutputFile: sourceFile => sourceFile.endsWith('/other.css')
        ? 'pages/other/other.wxss'
        : undefined,
    }))

    expect(plan.sources.map(source => source.sourceFile)).toEqual(['/repo/src/scanned.css'])
    expect(plan.hasUsableTailwindSource).toBe(true)
  })

  it('prefers the latest inferred sfc snapshot for the same source owner', async () => {
    const sourceFile = '/repo/src/pages/index/index.vue'
    const sources = new Map([
      ['page', {
        outputFile: 'pages/index/index.wxss',
        rawSource: '.stale { @apply block; }',
        sourceFile: `${sourceFile}?vue&type=style&index=0`,
      }],
    ])
    const plan = await resolveRememberedCssSourcePlan(createOptions({
      getRememberedCssSources: () => sources,
      getSfcSource: () => '<template></template><style>.latest { @apply flex; }</style>',
      snapshot: {
        entries: [{
          file: 'pages/index/index.js',
          output: {
            facadeModuleId: sourceFile,
            fileName: 'pages/index/index.js',
            moduleIds: [sourceFile],
            modules: { [sourceFile]: {} },
            type: 'chunk',
          },
          source: '',
          type: 'js',
        }],
      } as any,
    }))

    expect(plan.sources).toEqual([{
      outputFile: 'pages/index/index.wxss',
      rawSource: '.latest { @apply flex; }',
      sourceFile,
    }])
  })

  it('replaces configured temporary sources with the explicit root source', async () => {
    const configuredFile = '/repo/src/app.css'
    const configuredRootSource = {
      outputFile: 'app.wxss',
      rawSource: '@import "tailwindcss";',
      sourceFile: configuredFile,
    }
    const plan = await resolveRememberedCssSourcePlan(createOptions({
      configuredSourceFileKeys: new Set([configuredFile]),
      explicitConfiguredSourceFileKeys: new Set([configuredFile]),
      getRememberedCssSources: () => new Map([
        ['temporary', {
          outputFile: 'app.wxss',
          rawSource: '@import "tailwindcss";',
          sourceFile: configuredFile,
        }],
      ]),
      outputFile: 'app.wxss',
      resolveConfiguredRootSource: () => configuredRootSource,
      temporaryOutput: true,
    }))

    expect(plan).toEqual({
      hasUsableTailwindSource: true,
      sources: [configuredRootSource],
    })
  })
})
