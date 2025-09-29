import path from 'pathe'
import postcss from 'postcss'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const tailwindcssMock = vi.fn(() => ({
  postcssPlugin: 'tailwindcss-mock',
  Once: vi.fn(),
}))

vi.mock('tailwindcss', () => ({
  default: tailwindcssMock,
  __esModule: true,
}))

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
    tailwindcssMock.mockClear()
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

  it('merges files into object-form content without dropping extractors', async () => {
    const plugin = creator({
      config: {
        content: {
          files: ['app/**/*.{js,ts}'],
          extract: {
            html: (input: string) => [input],
          },
        },
      },
    })
    const from = path.resolve(__dirname, './fixtures/wxml/index.wxss')

    await postcss([plugin]).process('', { from })

    expect(tailwindcssMock).toHaveBeenCalledTimes(1)
    const configArg = tailwindcssMock.mock.calls[0][0]

    expect(configArg.content).toBeDefined()
    if (configArg && typeof configArg === 'object') {
      const content = configArg.content
      expect(content).not.toBeUndefined()
      expect(content).toMatchObject({ extract: { html: expect.any(Function) } })
      const files = Array.isArray(content.files) ? content.files : []
      expect(files).toEqual([
        'app/**/*.{js,ts}',
        `${path.resolve(__dirname, './fixtures/wxml/index')}.{wxml,js,ts}`,
      ])
    }
  })
})
