import type { Plugin, ResolvedConfig } from 'vite'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { vitePluginName } from '@/constants'
import {
  createContext,
  getTransformUVueMock,
  resetVitePluginTestContext,
  setCurrentContext,
} from './vite-plugin.testkit'

const mocks = vi.hoisted(() => ({
  generateTailwindV4Css: vi.fn(),
}))
const createdDirs: string[] = []

vi.mock('@/bundlers/shared/v4-generation-core', () => ({
  generateTailwindV4Css: mocks.generateTailwindV4Css,
}))

async function loadWeappTailwindcssPlugin() {
  const mod = await import('@/bundlers/vite')
  return mod.WeappTailwindcss
}

function getTransformHandler(plugin: Plugin) {
  return typeof plugin.transform === 'function'
    ? plugin.transform
    : plugin.transform?.handler
}

function getPlugin(plugins: Plugin[], suffix: string) {
  return plugins.find(plugin => plugin.name === `${vitePluginName}:${suffix}`) as Plugin
}

describe('bundlers/vite WeappTailwindcss hook coverage', () => {
  afterEach(async () => {
    await Promise.all(
      createdDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })),
    )
  })

  beforeEach(() => {
    vi.resetModules()
    resetVitePluginTestContext()
    mocks.generateTailwindV4Css.mockReset()
    mocks.generateTailwindV4Css.mockResolvedValue({
      css: '.generated{color:red}',
      dependencies: ['/project/tailwind.config.ts'],
      classSet: new Set(['generated']),
      target: 'weapp',
    })
  })

  it('drives source candidate transform, watch change, hot update, build start, and post config hooks', async () => {
    const context = createContext({
      appType: 'uni-app',
      cssEntries: ['/project/src/app.css'],
      tailwindcssBasedir: '/project',
    })
    setCurrentContext(context)
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()!
    const sourcePlugin = plugins.find(plugin => plugin.name === `${vitePluginName}:source-candidates`) as Plugin
    const postPlugin = plugins.find(plugin => plugin.name === `${vitePluginName}:post`) as Plugin

    expect(sourcePlugin).toBeTruthy()
    expect(postPlugin).toBeTruthy()

    const transform = getTransformHandler(sourcePlugin)!
    await transform.call(sourcePlugin as any, 'export const cls = "text-red-500"', '/project/src/page.ts')
    await sourcePlugin.watchChange?.('/project/src/page.ts', { event: 'update' } as any)
    await sourcePlugin.watchChange?.('/project/src/page.ts', { event: 'delete' } as any)

    const hotResult = await sourcePlugin.handleHotUpdate?.({
      file: '/project/src/page.ts',
      modules: [],
      server: {
        moduleGraph: {
          getModulesByFile: () => undefined,
        },
        ws: {
          send: vi.fn(),
        },
      },
    } as any)
    expect(hotResult).toEqual([])

    await sourcePlugin.buildStart?.call({
      addWatchFile: vi.fn(),
    } as any)

    const configResult = await postPlugin.config?.({
      plugins: [
        { name: '@tailwindcss/vite:generate:serve' },
        { name: 'other' },
      ],
      root: '/project',
    } as any, { command: 'build', mode: 'production' } as any)

    expect(configResult).toMatchObject({
      resolve: {
        alias: expect.any(Array),
      },
    })
  })

  it('compiles uni conditional CSS before downstream style checks on mini-program platforms', async () => {
    const previousUniPlatform = process.env.UNI_PLATFORM
    process.env.UNI_PLATFORM = 'mp-weixin'
    try {
      const context = createContext({
        appType: 'uni-app-vite',
        tailwindcssBasedir: '/project',
      })
      setCurrentContext(context)
      const WeappTailwindcss = await loadWeappTailwindcssPlugin()
      const plugins = WeappTailwindcss()!
      const sourcePlugin = getPlugin(plugins, 'source-candidates')

      expect(sourcePlugin.transform).toMatchObject({ order: 'pre' })

      const result = await getTransformHandler(sourcePlugin)?.call(
        sourcePlugin,
        [
          '@import "tailwindcss" source(none);',
          '@layer base {',
          '  /* #ifdef H5 */',
          '  svg { display: initial; }',
          '  /* #endif */',
          '  /* #ifdef MP-WEIXIN */',
          '  .wx-only { color: red; }',
          '  /* #endif */',
          '}',
        ].join('\n'),
        '/project/src/tailwind.css',
      )

      expect(result).toMatchObject({
        code: expect.stringContaining('.wx-only'),
        map: null,
      })
      expect(result?.code).not.toContain('svg')
      expect(result?.code).not.toContain('#ifdef H5')
      expect(result?.code).not.toContain('@layer base')
    }
    finally {
      if (previousUniPlatform === undefined) {
        delete process.env.UNI_PLATFORM
      }
      else {
        process.env.UNI_PLATFORM = previousUniPlatform
      }
    }
  })

  it('keeps uni-app x uvue transform enabled on Web targets', async () => {
    const context = createContext({
      appType: 'uni-app-x',
      tailwindcssBasedir: '/project',
      uniAppX: {
        enabled: false,
      },
    })
    setCurrentContext(context)
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()!
    const uvuePlugin = plugins.find(plugin => plugin.name === 'weapp-tailwindcss:uni-app-x:nvue') as Plugin | undefined

    expect(uvuePlugin).toBeTruthy()

    const result = await getTransformHandler(uvuePlugin!)?.call(
      uvuePlugin,
      '<template><view class="text-[#f7fbff]">Hello</view></template>',
      '/project/pages/index/index.uvue',
    )

    expect(getTransformUVueMock()).toHaveBeenCalledWith(
      '<template><view class="text-[#f7fbff]">Hello</view></template>',
      '/project/pages/index/index.uvue',
      context.jsHandler,
      expect.any(Set),
    )
    expect(result?.code).toContain('uvue:/project/pages/index/index.uvue:')
  })

  it('infers mini-program platform from vite output directory for early CSS macro compilation', async () => {
    const previousUniPlatform = process.env.UNI_PLATFORM
    delete process.env.UNI_PLATFORM
    try {
      const context = createContext({
        appType: 'uni-app-vite',
        tailwindcssBasedir: '/project',
      })
      setCurrentContext(context)
      const WeappTailwindcss = await loadWeappTailwindcssPlugin()
      const plugins = WeappTailwindcss()!
      const postPlugin = getPlugin(plugins, 'post')
      await (postPlugin.configResolved as any)?.call(postPlugin, {
        command: 'serve',
        root: '/project',
        plugins: [],
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist/dev/mp-weixin' },
      } as ResolvedConfig)

      const sourcePlugin = getPlugin(plugins, 'source-candidates')
      const result = await getTransformHandler(sourcePlugin)?.call(
        sourcePlugin,
        [
          '@layer base {',
          '  /* #ifdef H5 */',
          '  svg { display: initial; }',
          '  /* #endif */',
          '  /* #ifdef MP-WEIXIN */',
          '  .wx-only { color: red; }',
          '  /* #endif */',
          '}',
        ].join('\n'),
        '/project/src/tailwind.css',
      )

      expect(result?.code).toContain('.wx-only')
      expect(result?.code).not.toContain('svg')
      expect(result?.code).not.toContain('@layer base')
    }
    finally {
      if (previousUniPlatform === undefined) {
        delete process.env.UNI_PLATFORM
      }
      else {
        process.env.UNI_PLATFORM = previousUniPlatform
      }
    }
  })

  it('keeps uni-app-vite default css root and preflight untouched after vite root inference', async () => {
    const previousUniPlatform = process.env.UNI_PLATFORM
    delete process.env.UNI_PLATFORM
    try {
      const context = createContext({
        appType: 'uni-app-vite',
        tailwindcssBasedir: '/project',
        cssPreflight: {
          'box-sizing': 'border-box',
          margin: '0',
          padding: '0',
          border: '0 solid',
        },
        cssSelectorReplacement: {
          root: ['page', '.tw-root', 'wx-root-portal-content'],
          universal: ['view', 'text'],
        },
      })
      setCurrentContext(context)
      const WeappTailwindcss = await loadWeappTailwindcssPlugin()
      const plugins = WeappTailwindcss()!
      const postPlugin = getPlugin(plugins, 'post')

      await (postPlugin.configResolved as any)?.call(postPlugin, {
        command: 'serve',
        root: '/project',
        plugins: [],
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist/dev/mp-weixin' },
      } as ResolvedConfig)

      expect(context.cssPreflight).toMatchObject({
        'box-sizing': 'border-box',
        margin: '0',
        padding: '0',
        border: '0 solid',
      })
      expect(context.cssSelectorReplacement?.root).toStrictEqual(['page', '.tw-root', 'wx-root-portal-content'])
    }
    finally {
      if (previousUniPlatform === undefined) {
        delete process.env.UNI_PLATFORM
      }
      else {
        process.env.UNI_PLATFORM = previousUniPlatform
      }
    }
  })

  it('strips Tailwind cascade layer syntax from vite serve css before uni bundle style checks', async () => {
    mocks.generateTailwindV4Css.mockResolvedValueOnce({
      css: [
        '@layer theme, base, components, utilities;',
        '@layer base {',
        '  .base-reset { box-sizing: border-box; }',
        '}',
        '@layer utilities {',
        '  .text-red-500 { color: red; }',
        '}',
      ].join('\n'),
      dependencies: [],
      classSet: new Set(['base-reset', 'text-red-500']),
      target: 'weapp',
    })
    const context = createContext({
      appType: 'uni-app-vite',
      tailwindcssBasedir: '/project',
    })
    setCurrentContext(context)
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()!
    const postPlugin = getPlugin(plugins, 'post')
    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: '/project',
      plugins: [],
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist/dev/mp-weixin' },
    } as ResolvedConfig)

    const serveCssPlugin = getPlugin(plugins, 'generate:serve')
    const result = await getTransformHandler(serveCssPlugin)?.call(
      { addWatchFile: vi.fn() },
      '@import "tailwindcss";',
      '/project/src/tailwind.css',
    )

    expect(result?.code).toContain('.base-reset')
    expect(result?.code).toContain('.text-red-500')
    expect(result?.code).not.toContain('@layer')
  })

  it('uses inferred uni-app-vite WebView branch for app-plus serve css compat', async () => {
    const previousUniPlatform = process.env.UNI_PLATFORM
    const previousUniUtsPlatform = process.env.UNI_UTS_PLATFORM
    process.env.UNI_PLATFORM = 'app-plus'
    process.env.UNI_UTS_PLATFORM = 'app-android'
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-uni-app-vite-webview-'))
    createdDirs.push(root)
    await writeFile(path.join(root, 'package.json'), JSON.stringify({
      dependencies: {
        '@dcloudio/uni-app': '^3.0.0',
      },
      devDependencies: {
        '@dcloudio/vite-plugin-uni': '^3.0.0',
      },
    }), 'utf8')
    try {
      mocks.generateTailwindV4Css.mockResolvedValueOnce({
        css: [
          '.bg-gradient-to-br {',
          '  --tw-gradient-position: to bottom right in oklab;',
          '  background-image: linear-gradient(var(--tw-gradient-stops));',
          '}',
        ].join('\n'),
        dependencies: [],
        classSet: new Set(['bg-gradient-to-br']),
        target: 'web',
      })
      const context = createContext({
        appType: undefined,
        tailwindcssBasedir: root,
      })
      setCurrentContext(context)
      const WeappTailwindcss = await loadWeappTailwindcssPlugin()
      const plugins = WeappTailwindcss()!
      const postPlugin = getPlugin(plugins, 'post')
      await (postPlugin.configResolved as any)?.call(postPlugin, {
        command: 'serve',
        root,
        plugins: [],
        css: { postcss: { plugins: [] } },
        build: { outDir: 'dist/dev/app-plus' },
      } as ResolvedConfig)

      expect(context.appType).toBe('uni-app-vite')

      const serveCssPlugin = getPlugin(plugins, 'generate:serve')
      const result = await getTransformHandler(serveCssPlugin)?.call(
        { addWatchFile: vi.fn() },
        '@import "tailwindcss";',
        path.join(root, 'src/main.css'),
      )

      expect(result?.code).toContain('--tw-gradient-position: to bottom right')
      expect(result?.code).not.toContain('to bottom right in oklab')
      expect(mocks.generateTailwindV4Css).toHaveBeenCalledWith(expect.objectContaining({
        outputFile: 'src/main.css',
        restoreLocalCssImports: false,
      }))
    }
    finally {
      if (previousUniPlatform === undefined) {
        delete process.env.UNI_PLATFORM
      }
      else {
        process.env.UNI_PLATFORM = previousUniPlatform
      }
      if (previousUniUtsPlatform === undefined) {
        delete process.env.UNI_UTS_PLATFORM
      }
      else {
        process.env.UNI_UTS_PLATFORM = previousUniUtsPlatform
      }
    }
  })

  it('keeps post config inert when plugin ownership is disabled', async () => {
    setCurrentContext(createContext({
      disabled: { plugin: true },
    }))
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()

    expect(plugins).toBeUndefined()
  })

  it('generates vite serve css, hmr css modules, and serve js transforms', async () => {
    const context = createContext({
      appType: 'uni-app',
      tailwindcssBasedir: '/project',
      mainCssChunkMatcher: vi.fn((file: string) => file.endsWith('app.css')),
      jsHandler: vi.fn((code: string) => ({ code: `js:${code}` })),
    })
    setCurrentContext(context)
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()!
    const postPlugin = getPlugin(plugins, 'post')
    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: '/project',
      plugins: [{ name: 'vite:css' }],
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as any)

    const serveCssPlugin = getPlugin(plugins, 'generate:serve')
    const serveCssHmrPlugin = getPlugin(plugins, 'generate:serve-hmr')
    const serveJsPlugin = getPlugin(plugins, 'js:serve')
    const addWatchFile = vi.fn()

    const cssResult = await getTransformHandler(serveCssPlugin)?.call(
      { addWatchFile },
      '@import "tailwindcss";\n.app{}',
      '/project/src/app.css',
    )
    expect(cssResult).toMatchObject({
      code: expect.stringContaining('.generated{color:red}'),
      map: null,
    })
    expect(addWatchFile).toHaveBeenCalledWith('/project/tailwind.config.ts')
    expect(mocks.generateTailwindV4Css).toHaveBeenCalledWith(expect.objectContaining({
      file: '/project/src/app.css',
      outputFile: 'src/app.css',
      cssSources: expect.any(Array),
    }))

    const hmrCode = 'const __vite__css = "@import \\"tailwindcss\\";\\n.page{}";\n__vite__updateStyle(__vite__id, __vite__css)'
    const hmrResult = await getTransformHandler(serveCssHmrPlugin)?.call(
      { addWatchFile },
      hmrCode,
      '/project/src/pages/index.css?vue&type=style&direct',
    )
    expect(hmrResult).toMatchObject({
      code: expect.stringContaining('.generated{color:red}'),
      map: null,
    })

    const jsResult = await getTransformHandler(serveJsPlugin)?.call(
      serveJsPlugin,
      'const cls = "alpha"',
      '/project/src/pages/index.ts',
    )
    expect(jsResult).toBeUndefined()
    expect(context.jsHandler).not.toHaveBeenCalled()
  })

  it('regenerates uni-app-vite root css after vue template hmr adds named arbitrary colors', async () => {
    mocks.generateTailwindV4Css.mockImplementation(async (options: any) => ({
      css: [...options.runtime].sort().map((candidate: string) => `.${candidate}{display:block}`).join('\n'),
      dependencies: [],
      classSet: new Set(options.runtime),
      target: 'weapp',
    }))
    const context = createContext({
      appType: 'uni-app-vite',
      cssEntries: ['/project/src/tailwind.css'],
      tailwindcssBasedir: '/project',
      mainCssChunkMatcher: vi.fn((file: string) => file.endsWith('tailwind.css')),
    })
    setCurrentContext(context)
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()!
    const postPlugin = getPlugin(plugins, 'post')
    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: '/project',
      plugins: [{ name: 'vite:uni' }],
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist/dev/mp-weixin' },
    } as any)

    const serveCssPlugin = getPlugin(plugins, 'generate:serve')
    await getTransformHandler(serveCssPlugin)?.call(
      { addWatchFile: vi.fn() },
      '@import "tailwindcss";\n@source "./pages/**/*.vue";',
      '/project/src/tailwind.css',
    )

    mocks.generateTailwindV4Css.mockClear()
    const sourcePlugin = getPlugin(plugins, 'source-candidates')
    const send = vi.fn()
    const hotResult = await sourcePlugin.handleHotUpdate?.({
      file: '/project/src/pages/index.vue',
      modules: [{ id: '/project/src/pages/index.vue', isSelfAccepting: true }],
      read: vi.fn(async () => '<template><view class="text-[yellow] bg-[blue]">hmr</view></template>'),
      timestamp: 1000,
      server: {
        config: {
          root: '/project',
          build: { outDir: 'dist/dev/mp-weixin' },
        },
        moduleGraph: {
          getModuleById: vi.fn(),
          getModulesByFile: vi.fn(() => []),
          invalidateModule: vi.fn(),
        },
        ws: {
          send,
        },
      },
    } as any)
    await Promise.resolve()

    expect(hotResult).toBeUndefined()
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'full-reload' }))
    expect(send).toHaveBeenCalledWith({
      type: 'update',
      updates: [expect.objectContaining({
        path: '/src/tailwind.css',
        acceptedPath: '/src/tailwind.css',
      })],
    })

    const serveCssHmrPlugin = getPlugin(plugins, 'generate:serve-hmr')
    const hmrCode = 'const __vite__css = "@import \\"tailwindcss\\";\\n@source \\"./pages/**/*.vue\\";";\n__vite__updateStyle(__vite__id, __vite__css)'
    const hmrResult = await getTransformHandler(serveCssHmrPlugin)?.call(
      { addWatchFile: vi.fn() },
      hmrCode,
      '/project/src/tailwind.css?direct&t=1000',
    )

    expect(hmrResult?.code).toContain('.text-[yellow]{display:block}')
    expect(hmrResult?.code).toContain('.bg-[blue]{display:block}')
    expect(mocks.generateTailwindV4Css).toHaveBeenLastCalledWith(expect.objectContaining({
      runtime: expect.objectContaining({
        has: expect.any(Function),
      }),
    }))
    const lastRuntime = mocks.generateTailwindV4Css.mock.calls.at(-1)?.[0]?.runtime as Set<string>
    expect(lastRuntime.has('text-[yellow]')).toBe(true)
    expect(lastRuntime.has('bg-[blue]')).toBe(true)
  })

  it('keeps vite serve css unchanged when generator returns no css', async () => {
    mocks.generateTailwindV4Css.mockResolvedValueOnce(undefined)
    const context = createContext({
      appType: 'uni-app',
      tailwindcssBasedir: '/project',
    })
    setCurrentContext(context)
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()!
    const postPlugin = getPlugin(plugins, 'post')
    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: '/project',
      plugins: [{ name: 'vite:css' }],
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as any)

    const serveCssPlugin = getPlugin(plugins, 'generate:serve')
    const cssResult = await getTransformHandler(serveCssPlugin)?.call(
      { addWatchFile: vi.fn() },
      '@import "tailwindcss";\n.plain{color:red}',
      '/project/src/plain.css',
    )

    expect(cssResult).toBeUndefined()
    expect(mocks.generateTailwindV4Css).toHaveBeenCalledWith(expect.objectContaining({
      file: '/project/src/plain.css',
    }))
  })

  it('skips vite serve js transform for web generator targets', async () => {
    const context = createContext({
      appType: 'h5',
      generator: {
        target: 'web',
      },
      jsHandler: vi.fn((code: string) => ({ code: `js:${code}` })),
    })
    setCurrentContext(context)
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()!
    const postPlugin = getPlugin(plugins, 'post')
    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: '/project',
      plugins: [{ name: 'vite:css' }],
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as any)

    const serveJsPlugin = getPlugin(plugins, 'js:serve')
    const jsResult = await getTransformHandler(serveJsPlugin)?.call(
      serveJsPlugin,
      'const cls = "alpha"',
      '/project/src/pages/index.ts',
    )

    expect(jsResult).toBeUndefined()
    expect(context.jsHandler).not.toHaveBeenCalled()
  })

  it('sends a full reload for unresolved source hot updates in uni vite projects', async () => {
    const context = createContext({
      appType: 'uni-app',
      cssEntries: ['/project/src/app.css'],
      tailwindcssBasedir: '/project',
    })
    setCurrentContext(context)
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()!
    const postPlugin = getPlugin(plugins, 'post')
    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: '/project',
      plugins: [{ name: 'vite:uni' }],
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as any)

    const sourcePlugin = getPlugin(plugins, 'source-candidates')
    const send = vi.fn()
    const hotResult = await sourcePlugin.handleHotUpdate?.({
      file: '/project/src/pages/index.ts',
      modules: [{ id: '/project/src/pages/index.ts', isSelfAccepting: false }],
      server: {
        moduleGraph: {
          getModulesByFile: () => undefined,
        },
        ws: {
          send,
        },
      },
    } as any)

    expect(hotResult).toEqual([])
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ type: 'full-reload' }))
  })

  it('does not treat ordinary web macro subrequests as Nuxt page macro reloads', async () => {
    const context = createContext({
      cssEntries: ['/project/src/style.css'],
      generator: {
        target: 'web',
      },
      tailwindcssBasedir: '/project',
    })
    setCurrentContext(context)
    const WeappTailwindcss = await loadWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()!
    const postPlugin = getPlugin(plugins, 'post')
    await (postPlugin.configResolved as any)?.call(postPlugin, {
      command: 'serve',
      root: '/project',
      plugins: [],
      css: { postcss: { plugins: [] } },
      build: { outDir: 'dist' },
    } as any)

    const sourcePlugin = getPlugin(plugins, 'source-candidates')
    const send = vi.fn()
    const module = {
      id: '/project/src/main.tsx?macro=true',
      url: '/src/main.tsx?macro=true',
      isSelfAccepting: true,
    }
    const hotResult = await sourcePlugin.handleHotUpdate?.({
      file: '/project/src/main.tsx',
      modules: [module],
      server: {
        moduleGraph: {
          getModulesByFile: () => undefined,
          getModuleById: () => undefined,
          invalidateModule: vi.fn(),
        },
        ws: {
          send,
        },
      },
    } as any)

    expect(hotResult).toBeUndefined()
    expect(send).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'full-reload' }))
  })
})
