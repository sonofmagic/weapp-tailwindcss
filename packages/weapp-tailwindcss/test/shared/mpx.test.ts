import path from 'node:path'
import { createRequire } from 'node:module'
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import { afterEach } from 'vitest'
import { describe, expect, it, vi } from 'vitest'
import {
  ensureMpxTailwindcssAliases,
  getTailwindcssCssEntry,
  injectMpxCssRewritePreRules,
  isMpx,
  patchMpxLoaderResolve,
  patchMpxWebpackPluginNormalizeLib,
  setupMpxTailwindcssRedirect,
} from '@/shared/mpx'

vi.mock('@/shared/tailwindcss-css-redirect', () => ({
  installTailwindcssCssRedirect: vi.fn(),
}))

const createdDirs: string[] = []

afterEach(async () => {
  await Promise.all(createdDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
})

async function createMpxWebpackPluginFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-mpx-plugin-'))
  createdDirs.push(root)
  const pluginDir = path.join(root, 'node_modules/@mpxjs/webpack-plugin')
  const normalizeDir = path.join(pluginDir, 'lib/utils')
  await mkdir(normalizeDir, { recursive: true })
  await writeFile(path.join(pluginDir, 'package.json'), JSON.stringify({
    name: '@mpxjs/webpack-plugin',
    version: '0.0.0-test',
    main: 'index.js',
  }))
  await writeFile(path.join(pluginDir, 'index.js'), 'module.exports = {}\n')
  await writeFile(path.join(normalizeDir, 'normalize.js'), [
    'exports.lib = function lib(file) {',
    '  return "original:" + file',
    '}',
    '',
  ].join('\n'))
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ private: true }))
  return {
    pluginDir: await realpath(pluginDir),
    root,
  }
}

describe('mpx integration helpers', () => {
  it('detects mpx app type and resolves tailwind css entry', () => {
    expect(isMpx('mpx' as any)).toBe(true)
    expect(isMpx('taro' as any)).toBe(false)
    expect(getTailwindcssCssEntry('/pkg')).toBe(path.join('/pkg', 'index.css'))
  })

  it('adds resolve aliases for object and array alias forms', () => {
    const compiler = { options: { resolve: { alias: {} } } }

    expect(ensureMpxTailwindcssAliases(compiler, '/tailwind')).toBe(path.join('/tailwind', 'index.css'))
    expect(compiler.options.resolve.alias).toMatchObject({
      tailwindcss: path.join('/tailwind', 'index.css'),
      tailwindcss$: path.join('/tailwind', 'index.css'),
    })

    const arrayCompiler = { options: { resolve: { alias: [] as any[] } } }
    ensureMpxTailwindcssAliases(arrayCompiler, '/tailwind')
    expect(arrayCompiler.options.resolve.alias).toEqual(expect.arrayContaining([
      { name: 'tailwindcss', alias: path.join('/tailwind', 'index.css') },
      { name: 'tailwindcss$', alias: path.join('/tailwind', 'index.css') },
    ]))

    const emptyCompiler: any = {}
    ensureMpxTailwindcssAliases(emptyCompiler, '/tailwind')
    expect(emptyCompiler.options.resolve.alias.tailwindcss).toBe(path.join('/tailwind', 'index.css'))
  })

  it('adds mpx webpack plugin aliases when the plugin can be resolved from project context', () => {
    const require = createRequire(import.meta.url)
    const pluginPackageJson = require.resolve('@mpxjs/webpack-plugin/package.json')
    const pluginDir = path.dirname(pluginPackageJson)
    const compiler = {
      context: process.cwd(),
      options: {
        context: process.cwd(),
        resolve: { alias: {} },
      },
    }

    ensureMpxTailwindcssAliases(compiler, '/tailwind')

    expect(compiler.options.resolveLoader.alias).toMatchObject({
      '@mpxjs/webpack-plugin': pluginDir,
      '@mpxjs/webpack-plugin$': pluginDir,
      '@mpxjs/webpack-plugin/lib/record-loader': path.join(pluginDir, 'lib/record-loader'),
    })
    expect(compiler.options.resolve.alias).toMatchObject({
      '@mpxjs/webpack-plugin': pluginDir,
      '@mpxjs/webpack-plugin$': pluginDir,
      '@mpxjs/webpack-plugin/lib/style-compiler/index': path.join(pluginDir, 'lib/style-compiler/index'),
    })
  })

  it('patches normalize.lib from a project-local mpx webpack plugin fixture once', async () => {
    const { pluginDir, root } = await createMpxWebpackPluginFixture()
    const compiler = {
      context: root,
      options: { context: root },
    }
    const projectRequire = createRequire(path.join(root, 'package.json'))
    const normalize = projectRequire('@mpxjs/webpack-plugin/lib/utils/normalize')
    const originalLib = normalize.lib

    expect(originalLib('file.js')).toBe('original:file.js')
    expect(patchMpxWebpackPluginNormalizeLib(compiler, pluginDir)).toBe(true)
    expect(patchMpxWebpackPluginNormalizeLib(compiler, pluginDir)).toBe(true)
    expect(normalize.lib('record-loader')).toBe(path.join(pluginDir, 'lib/record-loader'))
    expect((normalize.lib as any).__weappTwPatched).toBe(true)
    expect((normalize.lib as any).__weappTwOriginal).toBe(originalLib)
  })

  it('adds object and array aliases for a project-local mpx webpack plugin fixture', async () => {
    const { pluginDir, root } = await createMpxWebpackPluginFixture()
    const compiler = {
      context: root,
      options: {
        context: root,
        resolve: { alias: {} },
      },
    }

    ensureMpxTailwindcssAliases(compiler, '/tailwind')

    expect(compiler.options.resolveLoader.alias).toMatchObject({
      '@mpxjs/webpack-plugin': pluginDir,
      '@mpxjs/webpack-plugin$': pluginDir,
      '@mpxjs/webpack-plugin/lib/style-compiler/strip-conditional-loader': path.join(pluginDir, 'lib/style-compiler/strip-conditional-loader'),
    })
    expect(compiler.options.resolve.alias).toMatchObject({
      '@mpxjs/webpack-plugin': pluginDir,
      '@mpxjs/webpack-plugin$': pluginDir,
      '@mpxjs/webpack-plugin/lib/record-loader': path.join(pluginDir, 'lib/record-loader'),
    })

    const arrayCompiler = {
      context: root,
      options: {
        context: root,
        resolve: { alias: [] as any[] },
      },
    }
    ensureMpxTailwindcssAliases(arrayCompiler, '/tailwind')
    expect(arrayCompiler.options.resolve.alias).toEqual(expect.arrayContaining([
      { name: '@mpxjs/webpack-plugin/lib/record-loader', alias: path.join(pluginDir, 'lib/record-loader') },
      { name: /^@mpxjs\/webpack-plugin\//, alias: pluginDir },
    ]))
  })

  it('patches loader resolve for tailwindcss requests once', () => {
    const originalResolve = vi.fn((_context, request, callback) => callback(null, `origin:${request}`))
    const loaderContext = {
      context: '/missing',
      options: { context: '/missing' },
      resolve: originalResolve,
    }

    patchMpxLoaderResolve(loaderContext, '/tailwind', true)
    patchMpxLoaderResolve(loaderContext, '/tailwind', true)

    const callback = vi.fn()
    loaderContext.resolve('/ctx', 'tailwindcss', callback)
    loaderContext.resolve('/ctx', 'tailwindcss$', callback)
    loaderContext.resolve('/ctx', 'tailwindcss/colors', callback)
    loaderContext.resolve('/ctx', 'other', callback)

    expect(callback).toHaveBeenNthCalledWith(1, null, path.join('/tailwind', 'index.css'))
    expect(callback).toHaveBeenNthCalledWith(2, null, path.join('/tailwind', 'index.css'))
    expect(callback).toHaveBeenNthCalledWith(3, null, path.join('/tailwind', 'colors'))
    expect(callback).toHaveBeenNthCalledWith(4, null, 'origin:other')
    expect(originalResolve).toHaveBeenCalledTimes(1)
  })

  it('patches loader resolve for mpx webpack plugin requests when resolvable', () => {
    const require = createRequire(import.meta.url)
    const pluginDir = path.dirname(require.resolve('@mpxjs/webpack-plugin/package.json'))
    const originalResolve = vi.fn((_context, request, callback) => callback(null, `origin:${request}`))
    const loaderContext = {
      context: process.cwd(),
      options: { context: process.cwd() },
      resolve: originalResolve,
    }

    patchMpxLoaderResolve(loaderContext, '/tailwind', true)

    const callback = vi.fn()
    loaderContext.resolve('/ctx', '@mpxjs/webpack-plugin', callback)
    loaderContext.resolve('/ctx', '@mpxjs/webpack-plugin/lib/record-loader', callback)
    loaderContext.resolve('/ctx', undefined, callback)

    expect(callback).toHaveBeenNthCalledWith(1, null, pluginDir)
    expect(callback).toHaveBeenNthCalledWith(2, null, path.join(pluginDir, 'lib/record-loader'))
    expect(callback).toHaveBeenNthCalledWith(3, null, 'origin:undefined')
    expect(originalResolve).toHaveBeenCalledTimes(1)
  })

  it('patches loader resolve for a project-local mpx webpack plugin fixture', async () => {
    const { pluginDir, root } = await createMpxWebpackPluginFixture()
    const originalResolve = vi.fn((_context, request, callback) => callback(null, `origin:${request}`))
    const loaderContext = {
      context: root,
      options: { context: root },
      resolve: originalResolve,
    }

    patchMpxLoaderResolve(loaderContext, '/tailwind', true)

    const callback = vi.fn()
    loaderContext.resolve('/ctx', '@mpxjs/webpack-plugin', callback)
    loaderContext.resolve('/ctx', '@mpxjs/webpack-plugin/lib/style-compiler/index', callback)
    loaderContext.resolve('/ctx', '@mpxjs/webpack-plugin-extra', callback)

    expect(callback).toHaveBeenNthCalledWith(1, null, pluginDir)
    expect(callback).toHaveBeenNthCalledWith(2, null, path.join(pluginDir, 'lib/style-compiler/index'))
    expect(callback).toHaveBeenNthCalledWith(3, null, 'origin:@mpxjs/webpack-plugin-extra')
    expect(originalResolve).toHaveBeenCalledTimes(1)
  })

  it('skips loader resolve and normalize patches when inputs are unavailable', () => {
    const loaderContext = { resolve: vi.fn() }

    patchMpxLoaderResolve(loaderContext, '/tailwind', false)
    expect((loaderContext.resolve as any).__weappTwPatched).toBeUndefined()
    patchMpxLoaderResolve({ resolve: undefined }, '/tailwind', true)
    expect(patchMpxWebpackPluginNormalizeLib({}, undefined)).toBe(false)
  })

  it('injects css rewrite pre rules and ignores missing loader', () => {
    const compiler: any = { options: { module: { rules: [] } } }

    injectMpxCssRewritePreRules(compiler, undefined, {})
    expect(compiler.options.module.rules).toEqual([])

    injectMpxCssRewritePreRules(compiler, '/loader', { flag: true })
    expect(compiler.options.module.rules).toHaveLength(2)
    expect(compiler.options.module.rules[0].resourceQuery('type=styles')).toBe(true)
    expect(compiler.options.module.rules[0].resourceQuery(undefined as any)).toBe(false)
    expect(compiler.options.module.rules[0].resourceQuery('foo=1&type=styles&bar=2')).toBe(true)
    expect(compiler.options.module.rules[1].resourceQuery('type=styles')).toBe(false)
    expect(compiler.options.module.rules[1].resourceQuery('lang=css')).toBe(true)
  })

  it('sets up tailwindcss css redirect only when enabled', async () => {
    const { installTailwindcssCssRedirect } = await import('@/shared/tailwindcss-css-redirect')

    setupMpxTailwindcssRedirect('/tailwind', false)
    setupMpxTailwindcssRedirect('/tailwind', true)

    expect(installTailwindcssCssRedirect).toHaveBeenCalledTimes(1)
    expect(installTailwindcssCssRedirect).toHaveBeenCalledWith('/tailwind')
  })
})
