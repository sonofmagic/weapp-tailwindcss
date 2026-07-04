import type { OutputAsset } from 'rollup'
import type { Plugin, ResolvedConfig } from 'vite'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { createContext, resetVitePluginTestContext, setCurrentContext } from './vite-plugin.testkit'

async function loadViteWeappTailwindcssPlugin() {
  const mod = await import('@/bundlers/vite')
  return mod.WeappTailwindcss
}

function getGenerateBundleHandler(plugin: Plugin) {
  const hook = plugin.generateBundle
  return typeof hook === 'function' ? hook : hook?.handler
}

function asset(fileName: string, source: string): OutputAsset {
  return {
    type: 'asset',
    fileName,
    name: fileName,
    names: [fileName],
    originalFileName: null,
    originalFileNames: [],
    source,
    needsCodeReference: false,
  }
}

describe('bundlers/vite builtin styleInjector', () => {
  it('injects configured imports after the main vite plugin output hooks', async () => {
    resetVitePluginTestContext()
    setCurrentContext(createContext({
      appType: 'native',
      styleInjector: {
        imports: ['shared.wxss'],
      },
    }))
    const WeappTailwindcss = await loadViteWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()!
    const styleInjectorPlugin = plugins.find(plugin => plugin.name === 'weapp-tailwindcss:style-injector')!
    const bundle = {
      'app.wxss': asset('app.wxss', '.app{}'),
    }

    await styleInjectorPlugin.configResolved?.call(styleInjectorPlugin, {
      root: process.cwd(),
      plugins,
      css: {},
    } as ResolvedConfig)
    await getGenerateBundleHandler(styleInjectorPlugin)?.call({
      emitFile(file: { type: 'asset', fileName?: string, source?: string | Uint8Array }) {
        if (file.type === 'asset' && file.fileName) {
          bundle[file.fileName] = asset(file.fileName, String(file.source ?? ''))
        }
        return file.fileName ?? ''
      },
    } as any, {} as any, bundle as any, false)

    expect(bundle['app.wxss'].source).toBe('@import "shared.wxss";\n.app{}')
    expect(plugins.at(-1)?.name).toBe('weapp-tailwindcss:style-injector')
  })

  it('uses the selected uni-app Vite framework styleInjector preset', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-style-injector-'))
    await mkdir(path.join(root, 'sub'), { recursive: true })
    await writeFile(path.join(root, 'pages.json'), JSON.stringify({
      subPackages: [
        {
          root: 'sub',
          pages: ['pages/index'],
        },
      ],
    }), 'utf8')
    await writeFile(path.join(root, 'sub/index.css'), '.sub{}', 'utf8')

    resetVitePluginTestContext()
    const context = createContext({
      appType: 'uni-app-vite',
      styleInjector: {
        subPackages: {
          pagesJsonPath: path.join(root, 'pages.json'),
          preprocess: false,
        },
      },
    })
    setCurrentContext(context)
    const WeappTailwindcss = await loadViteWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss()!
    const styleInjectorPrePlugin = plugins.find(plugin => plugin.name === 'weapp-tailwindcss:style-injector-pre')!
    const styleInjectorPlugin = plugins.find(plugin => plugin.name === 'weapp-tailwindcss:style-injector')!
    const bundle = {
      'sub/pages/index.wxss': asset('sub/pages/index.wxss', '.page{}'),
      'sub/index.wxss': asset('sub/index.wxss', '.sub{}'),
    }

    await styleInjectorPrePlugin.configResolved?.call(styleInjectorPrePlugin, {
      root: process.cwd(),
      plugins,
      css: {},
    } as ResolvedConfig)
    await styleInjectorPrePlugin.buildStart?.call({
      addWatchFile: () => {},
    } as any, {} as any)
    await styleInjectorPlugin.configResolved?.call(styleInjectorPlugin, {
      root: process.cwd(),
      plugins,
      css: {},
    } as ResolvedConfig)
    await getGenerateBundleHandler(styleInjectorPlugin)?.call({
      emitFile(file: { type: 'asset', fileName?: string, source?: string | Uint8Array }) {
        if (file.type === 'asset' && file.fileName) {
          bundle[file.fileName] = asset(file.fileName, String(file.source ?? ''))
        }
        return file.fileName ?? ''
      },
    } as any, {} as any, bundle as any, false)

    expect(bundle['sub/pages/index.wxss'].source).toBe('@import "../index.wxss";\n.page{}')
  })

  it('does not append styleInjector plugins when the main vite plugin is disabled', async () => {
    resetVitePluginTestContext()
    setCurrentContext(createContext({
      disabled: { plugin: true },
      styleInjector: true,
    }))
    const WeappTailwindcss = await loadViteWeappTailwindcssPlugin()
    const plugins = WeappTailwindcss() ?? []

    expect(plugins.some(plugin => plugin.name.startsWith('weapp-tailwindcss:style-injector'))).toBe(false)
  })
})
