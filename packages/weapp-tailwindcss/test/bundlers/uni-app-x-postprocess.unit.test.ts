import type { OutputAsset } from 'rollup'
import { describe, expect, it, vi } from 'vitest'
import { handleUniAppXPostCssTasks } from '@/bundlers/vite/generate-bundle/uni-app-x-postprocess'

function asset(fileName: string, source: string): OutputAsset {
  return {
    type: 'asset',
    fileName,
    names: [],
    originalFileNames: [],
    source,
  }
}

function createOptions(overrides: Partial<Parameters<typeof handleUniAppXPostCssTasks>[0]> = {}) {
  return {
    bundle: {},
    debug: vi.fn(),
    generatorRuntime: new Set<string>(),
    getCssHandlerOptions: vi.fn(() => ({ isMainChunk: false })),
    getSourceCandidateSourcesForEntries: vi.fn(() => new Map()),
    getSourceCandidatesForEntries: vi.fn(() => new Set()),
    getViteProcessedCssAssetResults: vi.fn(() => []),
    isHarmonyAppStyleTarget: false,
    isNativeAppStyleTarget: false,
    onUpdate: vi.fn(),
    opts: {
      appType: 'native',
      styleHandler: vi.fn(async (source: string) => ({ css: source })),
    },
    runtimeState: {
      tailwindRuntime: { majorVersion: 4 },
      readyPromise: Promise.resolve(),
    },
    styleHandler: vi.fn(async (source: string) => ({ css: source })),
    ...overrides,
  } as Parameters<typeof handleUniAppXPostCssTasks>[0]
}

describe('bundlers/vite uni-app-x post css tasks', () => {
  it('returns collected apply sources without native or harmony post processing', async () => {
    const bundle = {
      'pages/index.uvue': asset('pages/index.uvue', '.apply-source{@apply flex}'),
    }

    const sources = await handleUniAppXPostCssTasks(createOptions({
      bundle,
      opts: {
        appType: 'native',
      } as any,
    }))

    expect(sources.join('\n')).toContain('@apply flex')
  })

  it('injects harmony css into main asset and uvue placeholders', async () => {
    const onUpdate = vi.fn()
    const debug = vi.fn()
    const mainCssAsset = asset('styles/root.css', '.base{}')
    const pageStyleAsset = asset('pages/index.uvue', '.page{color:red}')
    const pageCodeAsset = asset('pages/index.uvue.ts', 'const GenPageStyles = []')
    const bundle = {
      'assets/root-hash.css': mainCssAsset,
      'assets/page-style-hash': pageStyleAsset,
      'assets/page-code-hash': pageCodeAsset,
    }

    await handleUniAppXPostCssTasks(createOptions({
      bundle,
      debug,
      getCssHandlerOptions: vi.fn(file => ({
        isMainChunk: file === 'styles/root.css',
      })),
      getViteProcessedCssAssetResults: () => new Map([
        ['app.css', '.generated{color:blue}'],
      ]),
      isHarmonyAppStyleTarget: true,
      onUpdate,
      opts: {
        appType: 'uni-app-x',
      } as any,
    }))

    expect(bundle['assets/root-hash.css']).toBe(mainCssAsset)
    expect(String(mainCssAsset.source)).toContain('.base{}')
    expect(String(mainCssAsset.source)).toContain('.generated{color:blue}')
    expect(bundle['assets/page-code-hash']).toBe(pageCodeAsset)
    expect(String(pageCodeAsset.source)).toContain('color')
    expect(String(pageCodeAsset.source)).toContain('generated')
    expect(onUpdate).toHaveBeenCalledWith('styles/root.css', '.base{}', expect.stringContaining('.generated{color:blue}'))
    expect(debug).toHaveBeenCalledWith('uni-app-x harmony main css inject')
    expect(debug).toHaveBeenCalledWith('uni-app-x style placeholder inject: %s', 'pages/index.uvue.ts')
  })
})
