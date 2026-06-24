import { describe, expect, it } from 'vitest'
import { createTransformFilter, createTransformFilterSignature, shouldSkipViteAssetTransform, shouldSkipViteJsChunkTransform } from '@/bundlers/vite/generate-bundle/transform-filter'
import { createRollupAsset, createRollupChunk } from './vite-plugin.testkit'

describe('bundlers/vite transform filter', () => {
  it('does not skip when transform include and exclude are empty', () => {
    const filter = createTransformFilter({ include: [], exclude: [] }, '/repo')
    const chunk = {
      ...createRollupChunk('const cls = "text-red-500"'),
      moduleIds: ['/repo/src/pages/index.ts'],
    } as any

    expect(filter).toBeUndefined()
    expect(shouldSkipViteJsChunkTransform(chunk, filter)).toBe(false)
  })

  it('skips js chunks when every module is excluded', () => {
    const filter = createTransformFilter({ exclude: ['src/generated/**'] }, '/repo')
    const chunk = {
      ...createRollupChunk('export const cls = "text-red-500"'),
      moduleIds: ['/repo/src/generated/openapi.ts?hash=1'],
      modules: {
        '/repo/src/generated/schema.ts': {},
      },
    } as any

    expect(shouldSkipViteJsChunkTransform(chunk, filter)).toBe(true)
  })

  it('keeps mixed js chunks when only some modules are excluded', () => {
    const filter = createTransformFilter({ exclude: ['src/generated/**'] }, '/repo')
    const chunk = {
      ...createRollupChunk('const cls = "text-red-500"'),
      moduleIds: [
        '/repo/src/generated/openapi.ts',
        '/repo/src/pages/index.ts',
      ],
    } as any

    expect(shouldSkipViteJsChunkTransform(chunk, filter)).toBe(false)
  })

  it('skips js chunks outside transform.include', () => {
    const filter = createTransformFilter({ include: ['src/pages/**'] }, '/repo')
    const chunk = {
      ...createRollupChunk('export const cls = "text-red-500"'),
      moduleIds: ['/repo/src/generated/openapi.ts'],
    } as any

    expect(shouldSkipViteJsChunkTransform(chunk, filter)).toBe(true)
  })

  it('keeps js chunks with at least one module matching transform.include', () => {
    const filter = createTransformFilter({ include: ['src/pages/**'] }, '/repo')
    const chunk = {
      ...createRollupChunk('const cls = "text-red-500"'),
      moduleIds: [
        '/repo/src/generated/openapi.ts',
        '/repo/src/pages/index.ts',
      ],
    } as any

    expect(shouldSkipViteJsChunkTransform(chunk, filter)).toBe(false)
  })

  it('lets transform.exclude take precedence over transform.include', () => {
    const filter = createTransformFilter({
      include: ['src/generated/**'],
      exclude: ['src/generated/**'],
    }, '/repo')
    const chunk = {
      ...createRollupChunk('export const cls = "text-red-500"'),
      moduleIds: ['/repo/src/generated/openapi.ts'],
    } as any

    expect(shouldSkipViteJsChunkTransform(chunk, filter)).toBe(true)
  })

  it('matches regexp and function rules against normalized absolute paths', () => {
    const filter = createTransformFilter({
      include: [/\/src\/pages\//],
      exclude: [(id: string) => id.endsWith('/src/pages/generated.ts')],
    }, '/repo')
    const includedChunk = {
      ...createRollupChunk('const cls = "text-red-500"'),
      moduleIds: ['/repo/src/pages/index.ts'],
    } as any
    const excludedChunk = {
      ...createRollupChunk('const cls = "text-red-500"'),
      moduleIds: ['/repo/src/pages/generated.ts'],
    } as any

    expect(shouldSkipViteJsChunkTransform(includedChunk, filter)).toBe(false)
    expect(shouldSkipViteJsChunkTransform(excludedChunk, filter)).toBe(true)
  })

  it('matches absolute string glob rules', () => {
    const filter = createTransformFilter({ exclude: ['/repo/src/generated/**'] }, '/repo')
    const chunk = {
      ...createRollupChunk('export const cls = "text-red-500"'),
      moduleIds: ['/repo/src/generated/openapi.ts'],
    } as any

    expect(shouldSkipViteJsChunkTransform(chunk, filter)).toBe(true)
  })

  it('skips assets when every original source is excluded', () => {
    const filter = createTransformFilter({ exclude: ['src/generated/**'] }, '/repo')
    const asset = {
      ...createRollupAsset('<view class="text-red-500"></view>'),
      originalFileNames: [
        '/repo/src/generated/a.wxml',
        '/repo/src/generated/b.wxml',
      ],
    }

    expect(shouldSkipViteAssetTransform(asset, 'pages/index.wxml', '/repo', filter)).toBe(true)
  })

  it('keeps mixed assets when not every original source is excluded', () => {
    const filter = createTransformFilter({ exclude: ['src/generated/**'] }, '/repo')
    const asset = {
      ...createRollupAsset('<view class="text-red-500"></view>'),
      originalFileNames: [
        '/repo/src/generated/raw.wxml',
        '/repo/src/pages/index.wxml',
      ],
    }

    expect(shouldSkipViteAssetTransform(asset, 'pages/index.wxml', '/repo', filter)).toBe(false)
  })

  it('uses output file fallback when asset original sources are unavailable', () => {
    const filter = createTransformFilter({ exclude: ['generated/**'] }, '/repo')
    const asset = {
      ...createRollupAsset('.raw { color: red; }'),
      originalFileName: null,
      originalFileNames: [],
    }

    expect(shouldSkipViteAssetTransform(asset, 'generated/raw.wxss', '/repo', filter)).toBe(true)
  })

  it('creates stable transform filter signatures', () => {
    expect(createTransformFilterSignature({
      include: ['src/pages/**'],
      exclude: [/\/generated\//],
    })).toBe('include:s:src/pages/**;exclude:r:\\/generated\\//')
  })
})
