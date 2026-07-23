import type { OutputAsset, OutputChunk } from 'rollup'
import { describe, expect, it, vi } from 'vitest'
import { finalizeMiniProgramCssAssets } from '@/bundlers/vite/generate-bundle/final-css-assets'
import { createRollupAsset } from './vite-plugin.testkit'

function createBundle(source: string, fileName = 'app.wxss') {
  return {
    [fileName]: {
      ...createRollupAsset(source),
      fileName,
    },
  } satisfies Record<string, OutputAsset | OutputChunk>
}

describe('vite final mini-program css assets', () => {
  it('removes empty conditional at-rules from cached app styles', async () => {
    const bundle = createBundle([
      '@import "./theme.wxss";',
      '@media (prefers-color-scheme: light) {}',
      '@media (prefers-color-scheme: dark) { /* removed declarations */ }',
      '@media screen { @supports (display: grid) {} }',
      '@media (prefers-color-scheme: dark) { .theme{color:black} }',
      '.keep{color:red}',
    ].join('\n'))
    const onUpdate = vi.fn()
    const recordCssAssetResult = vi.fn()
    const styleHandler = vi.fn(async (code: string) => ({ css: code }))

    await finalizeMiniProgramCssAssets(bundle, {
      cssMatcher: file => file.endsWith('.wxss'),
      getCssHandlerOptions: () => ({ isMainChunk: true } as any),
      isWebGeneratorTarget: false,
      lastCssResultByFile: new Map([['app.wxss', 'cached']]),
      onUpdate,
      recordCssAssetResult,
      styleHandler,
    })

    const css = String((bundle['app.wxss'] as OutputAsset).source)
    expect(css).not.toContain('@media (prefers-color-scheme: light)')
    expect(css).not.toContain('@supports')
    expect(css).toContain('@media (prefers-color-scheme: dark) { .theme{color:black} }')
    expect(css).toContain('@import "./theme.wxss";')
    expect(css).toContain('.keep{color:red}')
    expect(styleHandler).not.toHaveBeenCalled()
    expect(recordCssAssetResult).toHaveBeenCalledWith('app.wxss', css)
    expect(onUpdate).toHaveBeenCalledWith('app.wxss', expect.any(String), css)
  })

  it('cleans cached css assets whenever they reach final bundle emission', async () => {
    const source = '@media (prefers-color-scheme: dark) {}\n.keep{color:red}'
    const bundle = createBundle(source)
    const onUpdate = vi.fn()
    const recordCssAssetResult = vi.fn()

    await finalizeMiniProgramCssAssets(bundle, {
      cssMatcher: file => file.endsWith('.wxss'),
      getCssHandlerOptions: () => ({ isMainChunk: true } as any),
      isWebGeneratorTarget: false,
      lastCssResultByFile: new Map([['app.wxss', 'cached']]),
      onUpdate,
      recordCssAssetResult,
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
    })

    const css = String((bundle['app.wxss'] as OutputAsset).source)
    expect(css).toBe('.keep{color:red}')
    expect(recordCssAssetResult).toHaveBeenCalledWith('app.wxss', css)
    expect(onUpdate).toHaveBeenCalledWith('app.wxss', source, css)
  })

  it('cleans empty at-rules after handling uncached css assets', async () => {
    const source = '@media (prefers-color-scheme: dark) { /* removed */ }\n.button:hover{color:red}'
    const bundle = createBundle(source)
    const styleHandler = vi.fn(async (code: string) => ({ css: code }))

    await finalizeMiniProgramCssAssets(bundle, {
      cssMatcher: file => file.endsWith('.wxss'),
      getCssHandlerOptions: () => ({ isMainChunk: true } as any),
      isWebGeneratorTarget: false,
      onUpdate: vi.fn(),
      recordCssAssetResult: vi.fn(),
      styleHandler,
    })

    const css = String((bundle['app.wxss'] as OutputAsset).source)
    expect(css).not.toContain('@media')
    expect(css).toContain('.button:hover{color:red}')
    expect(styleHandler).toHaveBeenCalledOnce()
  })

  it('cleans matched non-WeChat mini-program style assets', async () => {
    const source = '@media (prefers-color-scheme: light) {}\n.keep{color:red}'
    const bundle = createBundle(source, 'app.acss')

    await finalizeMiniProgramCssAssets(bundle, {
      cssMatcher: file => /\.(?:acss|wxss)$/.test(file),
      getCssHandlerOptions: () => ({ isMainChunk: true } as any),
      isWebGeneratorTarget: false,
      lastCssResultByFile: new Map([['app.acss', 'cached']]),
      onUpdate: vi.fn(),
      recordCssAssetResult: vi.fn(),
      styleHandler: vi.fn(async (code: string) => ({ css: code })),
    })

    expect(String((bundle['app.acss'] as OutputAsset).source)).toBe('.keep{color:red}')
  })
})
