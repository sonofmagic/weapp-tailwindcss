import path from 'pathe'
import postcss from 'postcss'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('tailwindcss-config', () => ({
  loadConfig: vi.fn(async () => ({
    config: {
      content: [],
    },
  })),
}))

vi.mock('@/wxml', async () => {
  const actual = await vi.importActual<typeof import('@/wxml')>('@/wxml')
  return {
    ...actual,
    getDepFiles: vi.fn(async () => new Set<string>()),
  }
})

const loadConfig = vi.mocked((await import('tailwindcss-config')).loadConfig)
const wxmlModule = await import('@/wxml')
const getDepFiles = vi.mocked(wxmlModule.getDepFiles)
const { default: creator } = await import('@/postcss')

describe('tailwindcss injector config handling', () => {
  beforeEach(() => {
    loadConfig.mockClear()
    getDepFiles.mockClear()
  })

  it('loads config only once per cwd + path combination', async () => {
    const plugin = creator({
      cwd: path.resolve(__dirname),
      config: 'tailwind.config.js',
    })
    const from = path.resolve(__dirname, './fixtures/wxml/index.wxss')

    await postcss([plugin]).process('', { from })
    await postcss([plugin]).process('', { from })

    expect(loadConfig).toHaveBeenCalledTimes(1)
  })

  it('passes postcss input to functional configs', async () => {
    const configFn = vi.fn(() => ({
      content: [],
    }))
    const plugin = creator({ config: configFn })
    const from = path.resolve(__dirname, './fixtures/wxml/index.wxss')

    await postcss([plugin]).process('', { from })

    expect(configFn).toHaveBeenCalledTimes(1)
    expect(configFn.mock.calls[0][0]).toMatchObject({ file: from })
  })
})
