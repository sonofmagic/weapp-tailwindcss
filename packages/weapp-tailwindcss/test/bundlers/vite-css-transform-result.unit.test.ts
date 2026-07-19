import { describe, expect, it, vi } from 'vitest'
import { applyViteCssTransformTaskResult } from '../../src/bundlers/vite/generate-bundle/css-transform-result'

function createOptions() {
  return {
    addWatchFile: vi.fn(),
    debug: vi.fn(),
    debugCssDiff: true,
    file: 'pages/index.acss',
    generatorSourceFile: '/project/src/pages/index.css',
    outputFile: 'pages/index.acss',
    outputIsMainChunk: false,
    recordCssAssetResult: vi.fn(),
    recordViteProcessedCssAssetResult: vi.fn(),
    shouldInjectVitePipelineCssIntoMain: true,
    shouldRecordVitePipelineCssByOutput: true,
    tailwindcssMajorVersion: 4,
    transformRuntime: new Set<string>(),
    vitePipelineCssAsset: true,
    vitePipelineCssInjectionOutputFile: 'app.acss',
  }
}

describe('vite css transform result application', () => {
  it('applies Tailwind dependencies, candidates and Vite asset records', () => {
    const options = createOptions()
    const css = applyViteCssTransformTaskResult({
      ...options,
      result: {
        classSet: new Set(['text-red-500']),
        css: '.generated { color: red; }',
        dependencies: ['/project/tailwind.config.ts'],
        diffSource: '@import "tailwindcss";',
        generatorTarget: 'weapp',
        kind: 'tailwind',
        shouldRecordCssAsset: true,
      },
    })

    expect(css).toBe('.generated { color: red; }')
    expect(options.addWatchFile).toHaveBeenCalledWith('/project/tailwind.config.ts')
    expect(options.transformRuntime).toEqual(new Set(['text-red-500']))
    expect(options.recordCssAssetResult).toHaveBeenCalledWith(
      'pages/index.acss',
      '.generated { color: red; }',
    )
    expect(options.recordViteProcessedCssAssetResult).toHaveBeenNthCalledWith(
      1,
      'app.acss',
      '.generated { color: red; }',
      {
        injectIntoMain: true,
        outputFile: 'app.acss',
      },
    )
    expect(options.recordViteProcessedCssAssetResult).toHaveBeenNthCalledWith(
      2,
      'pages/index.acss',
      '.generated { color: red; }',
      {
        injectIntoMain: true,
        outputFile: 'app.acss',
      },
    )
  })

  it('records import shells without creating Vite pipeline injection records', () => {
    const options = createOptions()
    applyViteCssTransformTaskResult({
      ...options,
      result: {
        css: '@import "./shared.acss";',
        dependencies: [],
        kind: 'import-shell',
        shouldRecordCssAsset: true,
      },
    })

    expect(options.recordCssAssetResult).toHaveBeenCalledOnce()
    expect(options.recordViteProcessedCssAssetResult).not.toHaveBeenCalled()
    expect(options.debug).toHaveBeenCalledWith(
      'css preserve mini-program import shell: %s',
      'pages/index.acss',
    )
  })

  it('keeps web passthrough application free of asset records', () => {
    const options = createOptions()
    applyViteCssTransformTaskResult({
      ...options,
      result: {
        css: '.web {}',
        dependencies: [],
        kind: 'web',
        shouldRecordCssAsset: false,
      },
    })

    expect(options.recordCssAssetResult).not.toHaveBeenCalled()
    expect(options.recordViteProcessedCssAssetResult).not.toHaveBeenCalled()
    expect(options.debug).toHaveBeenCalledWith(
      'css preserve web target: %s',
      'pages/index.acss',
    )
  })
})
