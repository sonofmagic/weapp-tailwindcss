import type { ExistingRawSourceMap } from 'rollup'
import path from 'node:path'
import { cleanUrl, cssLangRE, formatPostcssSourceMap, isCSSRequest, normalizePath, slash } from '@/bundlers/vite/utils'

describe('vite utils', () => {
  it('normalises slashes and css requests', () => {
    expect(slash('C:\\Users\\file.css')).toBe('C:/Users/file.css')
    expect(isCSSRequest('main.css')).toBe(true)
    expect(cssLangRE.test('file.scss?inline')).toBe(true)
    expect(isCSSRequest('main.ts')).toBe(false)
  })

  it('normalises paths platform independently', () => {
    expect(normalizePath('src/../src/main.css')).toBe('src/main.css')
  })

  it('cleans postcss virtual file urls', () => {
    expect(cleanUrl('style.css?inline#hash')).toBe('style.css')
  })

  it('formats postcss source maps', async () => {
    const map: ExistingRawSourceMap = {
      file: 'ignored.css',
      mappings: 'AAAA',
      names: [],
      sources: [
        'index.css?inline',
        '%3Cstdin%3E',
        'nested/one.css',
        '<virtual>',
      ],
      sourcesContent: ['.a{}'],
      version: 3,
    }

    const result = await formatPostcssSourceMap(map, path.resolve('/project', 'input.css'))

    expect(result.file).toBe(path.resolve('/project', 'input.css'))
    expect(result.sources).toEqual([
      path.resolve('/project', 'index.css'),
      '\u0000<stdin>',
      path.resolve('/project', 'nested/one.css'),
      '\u0000<virtual>',
    ])
    expect(result.sourcesContent).toEqual(map.sourcesContent)
  })
})
