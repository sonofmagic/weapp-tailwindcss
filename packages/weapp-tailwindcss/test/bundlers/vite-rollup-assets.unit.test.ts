import { describe, expect, it, vi } from 'vitest'
import { createReplayCssAsset, registerGeneratorDependencies } from '@/bundlers/vite/generate-bundle/rollup-assets'

describe('vite generate-bundle rollup assets helpers', () => {
  it('creates replay css assets with Rollup-compatible metadata', () => {
    expect(createReplayCssAsset('app.wxss', '.root{}')).toMatchObject({
      type: 'asset',
      fileName: 'app.wxss',
      source: '.root{}',
      names: [],
      originalFileNames: [],
      needsCodeReference: false,
    })
  })

  it('registers generator dependencies and ignores invalid Rollup phase errors', () => {
    const addWatchFile = vi.fn((file: string) => {
      if (file === 'late.css') {
        throw Object.assign(new Error('Cannot call "addWatchFile" after the build has finished.'), {
          code: 'INVALID_ROLLUP_PHASE',
        })
      }
    })

    registerGeneratorDependencies({ addWatchFile }, ['app.css', 'late.css'])
    registerGeneratorDependencies({}, ['ignored.css'])

    expect(addWatchFile).toHaveBeenCalledWith('app.css')
    expect(addWatchFile).toHaveBeenCalledWith('late.css')
  })

  it('rethrows unexpected dependency registration failures', () => {
    expect(() => registerGeneratorDependencies({
      addWatchFile() {
        throw new Error('boom')
      },
    }, ['app.css'])).toThrow('boom')
  })
})
