import { describe, expect, it } from 'vitest'
import { createScopedGeneratorRuntime } from '@/bundlers/vite/generate-bundle/scoped-generator'

describe('bundlers/vite scoped generator runtime', () => {
  it('keeps runtime-confirmed custom variant conditional comment candidates when css has @source', async () => {
    const rawSource = [
      '@custom-variant wx {',
      '  /* #ifdef MP-WEIXIN */',
      '  @slot;',
      '  /* #endif */',
      '}',
      '@source "./pages/**/*.{wxml,vue}";',
    ].join('\n')
    const fallbackRuntime = new Set(['wx:bg-blue-500', 'not-wx:bg-red-500'])
    const sourceCandidates = new Set(['text-white'])

    const runtime = await createScopedGeneratorRuntime({
      cssHandlerOptions: {
        isMainChunk: true,
      },
      fallbackRuntime,
      getSourceCandidatesForEntries: () => sourceCandidates,
      majorVersion: 4,
      outputFile: 'app.wxss',
      rawSource,
      scopedSourceCandidateGetter: undefined,
      shouldExcludeSubpackageSourceCandidates: () => false,
      sourceFile: '/project/src/tailwind.css',
    })

    expect(runtime.has('text-white')).toBe(true)
    expect(runtime.has('wx:bg-blue-500')).toBe(true)
    expect(runtime.has('not-wx:bg-red-500')).toBe(true)
  })

  it('merges fallback runtime for main css import wrappers', async () => {
    const fallbackRuntime = new Set(['wx:bg-blue-500'])
    const sourceCandidates = new Set(['text-white'])

    const runtime = await createScopedGeneratorRuntime({
      cssHandlerOptions: {
        isMainChunk: true,
      },
      fallbackRuntime,
      getSourceCandidatesForEntries: () => sourceCandidates,
      majorVersion: 4,
      outputFile: 'app.wxss',
      rawSource: '@import "./tailwind.css";',
      scopedSourceCandidateGetter: () => sourceCandidates,
      shouldExcludeSubpackageSourceCandidates: () => false,
      sourceFile: '/project/src/App.vue?vue&type=style&index=0',
    })

    expect(runtime.has('text-white')).toBe(true)
    expect(runtime.has('wx:bg-blue-500')).toBe(true)
  })
})
