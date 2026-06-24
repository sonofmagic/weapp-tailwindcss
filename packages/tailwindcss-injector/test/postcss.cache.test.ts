import path from 'pathe'
import postcss from 'postcss'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/wxml', async () => {
  const actual = await vi.importActual<typeof import('@/wxml')>('@/wxml')
  return {
    ...actual,
    getDepFiles: vi.fn(async () => new Set<string>()),
  }
})

const wxmlModule = await import('@/wxml')
const getDepFiles = vi.mocked(wxmlModule.getDepFiles)
const { default: creator } = await import('@/postcss')

describe('tailwindcss injector dependency handling', () => {
  beforeEach(() => {
    getDepFiles.mockClear()
  })

  it('tracks matching wxml dependency source for css inputs', async () => {
    const dep = path.resolve(__dirname, './fixtures/wxml/header.wxml')
    getDepFiles.mockResolvedValueOnce(new Set([dep]))
    const from = path.resolve(__dirname, './fixtures/wxml/index.wxss')

    const result = await postcss([creator()]).process('', { from })

    expect(getDepFiles).toHaveBeenCalledWith(path.resolve(__dirname, './fixtures/wxml/index.wxml'))
    expect(result.messages).toContainEqual({
      type: 'dependency',
      plugin: 'postcss-tailwindcss-injector',
      file: dep,
    })
  })

  it('skips dependency tracking when filter rejects the input', async () => {
    const from = path.resolve(__dirname, './fixtures/wxml/index.wxss')

    const result = await postcss([creator({
      filter: () => false,
    })]).process('', { from })

    expect(getDepFiles).not.toHaveBeenCalled()
    expect(result.messages).toEqual([])
  })
})
