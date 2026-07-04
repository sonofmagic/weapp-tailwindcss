import type { OutputAsset, OutputBundle } from 'rollup'
import { describe, expect, it, vi } from 'vitest'
import { normalizeRootMiniProgramImportShellAssets } from '@/bundlers/vite/generate-bundle/finalize'

function asset(fileName: string, source: string): OutputAsset {
  return {
    type: 'asset',
    fileName,
    names: [],
    originalFileNames: [],
    source,
  }
}

describe('vite generate bundle finalize helpers', () => {
  it('normalizes taro root css to import origin shell', () => {
    const bundle: OutputBundle = {
      'app.wxss': asset('app.wxss', '.root{color:red}'),
      'app-origin.wxss': asset('app-origin.wxss', '.root{color:red}'),
      'chunk.js': { type: 'chunk', fileName: 'chunk.js' } as any,
    }
    const onUpdate = vi.fn()
    const record = vi.fn()

    expect(normalizeRootMiniProgramImportShellAssets(bundle, {
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      enabled: true,
      onUpdate,
      recordCssAssetResult: record,
      debug: vi.fn(),
    })).toBe(1)

    expect(String((bundle['app.wxss'] as OutputAsset).source)).toBe('@import "./app-origin.wxss";\n')
    expect(String((bundle['app-origin.wxss'] as OutputAsset).source)).toBe('.root{color:red}')
    expect(onUpdate).toHaveBeenCalledTimes(2)
    expect(record).toHaveBeenCalledWith('app.wxss', '@import "./app-origin.wxss";\n')
  })

  it('skips taro root normalization when origin is not compatible', () => {
    const baseOptions = {
      cssMatcher: (file: string) => file.endsWith('.wxss'),
      enabled: true,
      onUpdate: vi.fn(),
      recordCssAssetResult: vi.fn(),
      debug: vi.fn(),
    }

    expect(normalizeRootMiniProgramImportShellAssets({
      'app.wxss': asset('app.wxss', '@import "./app-origin.wxss";\n'),
      'app-origin.wxss': asset('app-origin.wxss', '.root{color:red}'),
    }, baseOptions)).toBe(0)
    expect(normalizeRootMiniProgramImportShellAssets({
      'app.wxss': asset('app.wxss', '.root{color:red}'),
      'app-origin.wxss': asset('app-origin.wxss', '@import "./other.wxss";\n'),
    }, baseOptions)).toBe(0)
    expect(normalizeRootMiniProgramImportShellAssets({
      'app.wxss': asset('app.wxss', '.root{color:red}'),
      'app-origin.wxss': asset('app-origin.wxss', '.other{color:blue}'),
    }, baseOptions)).toBe(0)
    expect(normalizeRootMiniProgramImportShellAssets({
      'app.css': asset('app.css', '.root{color:red}'),
      'app-origin.css': asset('app-origin.css', '.root{color:red}'),
    }, { ...baseOptions, enabled: false })).toBe(0)
  })
})
