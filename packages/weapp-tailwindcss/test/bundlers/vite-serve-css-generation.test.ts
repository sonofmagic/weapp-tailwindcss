import { describe, expect, it, vi } from 'vitest'
import { createViteServeCssGenerationPlugins } from '@/bundlers/vite/serve-css-generation'

function createPlugins(overrides: Record<string, any> = {}) {
  const options = {
    generateCss: vi.fn((id: string, code: string) => `${code}\n/* ${id} */`),
    getCommand: vi.fn(() => 'serve'),
    onTailwindRootCss: vi.fn(),
    shouldGenerate: vi.fn(() => true),
    ...overrides,
  }
  return {
    options,
    plugins: createViteServeCssGenerationPlugins(options),
  }
}

describe('vite serve css generation plugins', () => {
  it('generates root css during serve transform and skips unchanged or unsupported requests', async () => {
    const { options, plugins } = createPlugins()
    const rootPlugin = plugins[0]!

    await expect(rootPlugin.transform?.call({} as any, '@import "tailwindcss";', '/src/app.css?raw' as any)).resolves.toBeUndefined()
    await expect(rootPlugin.transform?.call({} as any, '.plain{color:red}', '/src/app.css' as any)).resolves.toBeUndefined()

    const result = await rootPlugin.transform?.call({} as any, '@import "tailwindcss";', '/src/app.css' as any)

    expect(result).toEqual({
      code: '@import "tailwindcss";\n/* /src/app.css */',
      map: null,
    })
    expect(options.onTailwindRootCss).toHaveBeenCalledWith('/src/app.css', '@import "tailwindcss";')

    options.generateCss.mockReturnValueOnce('@import "tailwindcss";')
    await expect(rootPlugin.transform?.call({} as any, '@import "tailwindcss";', '/src/app.css' as any)).resolves.toBeUndefined()
  })

  it('rewrites Vite css hmr modules and leaves invalid modules untouched', async () => {
    const { options, plugins } = createPlugins({
      generateCss: vi.fn((_id: string, code: string) => `${code}\n.next{color:blue}`),
    })
    const hmrPlugin = plugins[1]!
    const code = [
      'const __vite__css = ".root{color:red}"',
      '__vite__updateStyle(__vite__id, __vite__css)',
    ].join('\n')

    await expect(hmrPlugin.transform?.call({} as any, code, '/src/app.css?direct&worker' as any)).resolves.toBeUndefined()
    await expect(hmrPlugin.transform?.call({} as any, '__vite__updateStyle(id, css)', '/src/app.css?direct' as any)).resolves.toBeUndefined()

    const result = await hmrPlugin.transform?.call({} as any, code, '/src/app.css?direct' as any)

    expect(result).toEqual({
      code: [
        'const __vite__css = ".root{color:red}\\n.next{color:blue}"',
        '__vite__updateStyle(__vite__id, __vite__css)',
      ].join('\n'),
      map: null,
    })
    expect(options.onTailwindRootCss).toHaveBeenCalledWith('/src/app.css?direct', '.root{color:red}')

    options.generateCss.mockReturnValueOnce('.root{color:red}')
    await expect(hmrPlugin.transform?.call({} as any, code, '/src/app.css?direct' as any)).resolves.toBeUndefined()
  })

  it('skips both transforms when generation is disabled or command is not serve', async () => {
    const disabled = createPlugins({ shouldGenerate: vi.fn(() => false) })
    await expect(disabled.plugins[0]!.transform?.call({} as any, '@import "tailwindcss";', '/src/app.css' as any)).resolves.toBeUndefined()
    await expect(disabled.plugins[1]!.transform?.call({} as any, '__vite__updateStyle(id, css)', '/src/app.css?direct' as any)).resolves.toBeUndefined()

    const build = createPlugins({ getCommand: vi.fn(() => 'build') })
    await expect(build.plugins[0]!.transform?.call({} as any, '@import "tailwindcss";', '/src/app.css' as any)).resolves.toBeUndefined()
  })
})
