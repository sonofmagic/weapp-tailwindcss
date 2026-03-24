import path from 'pathe'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('fs-extra', () => {
  const outputFile = vi.fn(async () => Promise.resolve())
  return {
    default: {
      outputFile,
    },
    outputFile,
  }
})

const fs = await import('fs-extra')
const { debugX } = await import('../src/index')

describe('debug-uni-app-x plugin', () => {
  afterEach(() => {
    delete process.env.DEBUG_UNI_APP_X_LOG
    delete process.env.DEBUG_UNI_APP_X
    delete process.env.UNI_UTS_PLATFORM
    delete process.env.UNI_PLATFORM
    vi.restoreAllMocks()
  })

  it('writes transformed output and logs bundles when enabled', async () => {
    process.env.DEBUG_UNI_APP_X_LOG = 'true'
    const cwd = path.resolve('/tmp/weapp-tailwindcss')
    const plugins = debugX({ cwd, enabled: true })

    expect(plugins).toHaveLength(3)

    const plugin = plugins[1]
    const transformResult = await plugin.transform?.('console.log(1)', path.join(cwd, 'src', 'index.ts'))
    expect(transformResult).toBeUndefined()

    expect(fs.outputFile).toHaveBeenCalledWith(
      path.join(cwd, '.debug', 'normal', 'src', 'index.ts'),
      'console.log(1)',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenCalledWith(
      path.join(cwd, '.debug', 'normal', '_meta.json'),
      JSON.stringify([
        {
          file: 'src/index.ts',
          id: path.join(cwd, 'src', 'index.ts'),
          stage: 'normal',
          type: 'transform',
        },
      ], null, 2) + '\n',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenCalledWith(
      path.join(cwd, '.debug', '_manifest.json'),
      JSON.stringify({
        pre: [],
        normal: [
          {
            file: 'src/index.ts',
            id: path.join(cwd, 'src', 'index.ts'),
            stage: 'normal',
            type: 'transform',
          },
        ],
        post: [],
        'bundle-pre': [],
        'bundle-normal': [],
        'bundle-post': [],
      }, null, 2) + '\n',
      'utf8',
    )

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await plugin.generateBundle?.({}, {
      'chunk.js': {
        type: 'chunk',
        code: 'export default 1',
      },
      'asset.css': {
        type: 'asset',
        source: '.foo{}',
      },
    })

    expect(consoleSpy).toHaveBeenCalledWith('generateBundle\n', ['asset.css', 'chunk.js'])
    expect(fs.outputFile).toHaveBeenCalledWith(
      path.join(cwd, '.debug', 'bundle-normal', '_keys.txt'),
      'asset.css\nchunk.js',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenCalledWith(
      path.join(cwd, '.debug', 'bundle-normal', 'asset', 'asset.css'),
      '.foo{}',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenCalledWith(
      path.join(cwd, '.debug', 'bundle-normal', 'chunk', 'chunk.js'),
      'export default 1',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenCalledWith(
      path.join(cwd, '.debug', 'bundle-normal', '_meta.json'),
      JSON.stringify([
        {
          file: 'asset/asset.css',
          id: 'asset.css',
          stage: 'normal',
          type: 'bundle',
        },
        {
          file: 'chunk/chunk.js',
          id: 'chunk.js',
          stage: 'normal',
          type: 'bundle',
        },
      ], null, 2) + '\n',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenCalledWith(
      path.join(cwd, '.debug', '_manifest.json'),
      JSON.stringify({
        pre: [],
        normal: [
          {
            file: 'src/index.ts',
            id: path.join(cwd, 'src', 'index.ts'),
            stage: 'normal',
            type: 'transform',
          },
        ],
        post: [],
        'bundle-pre': [],
        'bundle-normal': [
          {
            file: 'asset/asset.css',
            id: 'asset.css',
            stage: 'normal',
            type: 'bundle',
          },
          {
            file: 'chunk/chunk.js',
            id: 'chunk.js',
            stage: 'normal',
            type: 'bundle',
          },
        ],
        'bundle-post': [],
      }, null, 2) + '\n',
      'utf8',
    )
  })

  it('skips platforms only when explicitly configured', async () => {
    process.env.UNI_UTS_PLATFORM = 'app-ios'
    const cwd = path.resolve('/tmp/weapp-tailwindcss')
    const plugins = debugX({ cwd, enabled: true, skipPlatforms: ['app-ios'] })

    await plugins[1].transform?.('console.log(1)', path.join(cwd, 'src', 'index.ts'))
    await plugins[1].generateBundle?.({}, {
      'chunk.js': {
        type: 'chunk',
        code: 'export default 1',
      },
    })

    expect(fs.outputFile).not.toHaveBeenCalled()
  })

  it('supports stage and rule based filtering', async () => {
    const cwd = path.resolve('/tmp/weapp-tailwindcss')
    const plugins = debugX({
      cwd,
      enabled: true,
      stages: ['post'],
      include: [/keep/u],
      exclude: ['skip'],
    })

    await plugins[0].transform?.('console.log(1)', path.join(cwd, 'src', 'keep.ts'))
    await plugins[1].transform?.('console.log(2)', path.join(cwd, 'src', 'keep.ts'))
    await plugins[2].transform?.('console.log(3)', path.join(cwd, 'src', 'skip-keep.ts'))
    await plugins[2].transform?.('console.log(4)', path.join(cwd, 'src', 'keep.ts'))
    await plugins[2].generateBundle?.({}, {
      'skip.css': {
        type: 'asset',
        source: '.skip{}',
      },
      'keep.css': {
        type: 'asset',
        source: '.keep{}',
      },
    })

    expect(fs.outputFile).toHaveBeenCalledTimes(7)
    expect(fs.outputFile).toHaveBeenNthCalledWith(
      1,
      path.join(cwd, '.debug', 'post', 'src', 'keep.ts'),
      'console.log(4)',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenNthCalledWith(
      2,
      path.join(cwd, '.debug', 'post', '_meta.json'),
      JSON.stringify([
        {
          file: 'src/keep.ts',
          id: path.join(cwd, 'src', 'keep.ts'),
          stage: 'post',
          type: 'transform',
        },
      ], null, 2) + '\n',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenNthCalledWith(
      3,
      path.join(cwd, '.debug', '_manifest.json'),
      JSON.stringify({
        pre: [],
        normal: [],
        post: [
          {
            file: 'src/keep.ts',
            id: path.join(cwd, 'src', 'keep.ts'),
            stage: 'post',
            type: 'transform',
          },
        ],
        'bundle-pre': [],
        'bundle-normal': [],
        'bundle-post': [],
      }, null, 2) + '\n',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenNthCalledWith(
      4,
      path.join(cwd, '.debug', 'bundle-post', '_keys.txt'),
      'keep.css',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenNthCalledWith(
      5,
      path.join(cwd, '.debug', 'bundle-post', 'asset', 'keep.css'),
      '.keep{}',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenCalledWith(
      path.join(cwd, '.debug', 'bundle-post', '_meta.json'),
      JSON.stringify([
        {
          file: 'asset/keep.css',
          id: 'keep.css',
          stage: 'post',
          type: 'bundle',
        },
      ], null, 2) + '\n',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenCalledWith(
      path.join(cwd, '.debug', '_manifest.json'),
      JSON.stringify({
        pre: [],
        normal: [],
        post: [
          {
            file: 'src/keep.ts',
            id: path.join(cwd, 'src', 'keep.ts'),
            stage: 'post',
            type: 'transform',
          },
        ],
        'bundle-pre': [],
        'bundle-normal': [],
        'bundle-post': [
          {
            file: 'asset/keep.css',
            id: 'keep.css',
            stage: 'post',
            type: 'bundle',
          },
        ],
      }, null, 2) + '\n',
      'utf8',
    )
  })

  it('preserves query information to avoid overwriting sub requests', async () => {
    const cwd = path.resolve('/tmp/weapp-tailwindcss')
    const plugins = debugX({ cwd, enabled: true })

    await plugins[0].transform?.(
      '<style></style>',
      `${path.join(cwd, 'App.uvue')}?vue&type=style&index=0&lang.css`,
    )
    await plugins[0].transform?.(
      '<script></script>',
      `${path.join(cwd, 'App.uvue')}?vue&type=script&lang.uts`,
    )

    expect(fs.outputFile).toHaveBeenNthCalledWith(
      1,
      path.join(cwd, '.debug', 'pre', 'App.uvue__vue_type_style_index_0_lang.css'),
      '<style></style>',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenNthCalledWith(
      2,
      path.join(cwd, '.debug', 'pre', '_meta.json'),
      JSON.stringify([
        {
          file: 'App.uvue__vue_type_style_index_0_lang.css',
          id: `${path.join(cwd, 'App.uvue')}?vue&type=style&index=0&lang.css`,
          stage: 'pre',
          type: 'transform',
        },
      ], null, 2) + '\n',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenNthCalledWith(
      3,
      path.join(cwd, '.debug', '_manifest.json'),
      JSON.stringify({
        pre: [
          {
            file: 'App.uvue__vue_type_style_index_0_lang.css',
            id: `${path.join(cwd, 'App.uvue')}?vue&type=style&index=0&lang.css`,
            stage: 'pre',
            type: 'transform',
          },
        ],
        normal: [],
        post: [],
        'bundle-pre': [],
        'bundle-normal': [],
        'bundle-post': [],
      }, null, 2) + '\n',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenNthCalledWith(
      4,
      path.join(cwd, '.debug', 'pre', 'App.uvue__vue_type_script_lang.uts'),
      '<script></script>',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenNthCalledWith(
      5,
      path.join(cwd, '.debug', 'pre', '_meta.json'),
      JSON.stringify([
        {
          file: 'App.uvue__vue_type_style_index_0_lang.css',
          id: `${path.join(cwd, 'App.uvue')}?vue&type=style&index=0&lang.css`,
          stage: 'pre',
          type: 'transform',
        },
        {
          file: 'App.uvue__vue_type_script_lang.uts',
          id: `${path.join(cwd, 'App.uvue')}?vue&type=script&lang.uts`,
          stage: 'pre',
          type: 'transform',
        },
      ], null, 2) + '\n',
      'utf8',
    )
    expect(fs.outputFile).toHaveBeenNthCalledWith(
      6,
      path.join(cwd, '.debug', '_manifest.json'),
      JSON.stringify({
        pre: [
          {
            file: 'App.uvue__vue_type_style_index_0_lang.css',
            id: `${path.join(cwd, 'App.uvue')}?vue&type=style&index=0&lang.css`,
            stage: 'pre',
            type: 'transform',
          },
          {
            file: 'App.uvue__vue_type_script_lang.uts',
            id: `${path.join(cwd, 'App.uvue')}?vue&type=script&lang.uts`,
            stage: 'pre',
            type: 'transform',
          },
        ],
        normal: [],
        post: [],
        'bundle-pre': [],
        'bundle-normal': [],
        'bundle-post': [],
      }, null, 2) + '\n',
      'utf8',
    )
  })

  it('swallows write errors and reports them via onError', async () => {
    const error = new Error('disk full')
    vi.mocked(fs.outputFile).mockRejectedValueOnce(error)

    const cwd = path.resolve('/tmp/weapp-tailwindcss')
    const onError = vi.fn()
    const plugins = debugX({ cwd, enabled: true, onError })

    await expect(
      plugins[1].transform?.('console.log(1)', path.join(cwd, 'src', 'index.ts')),
    ).resolves.toBeUndefined()

    expect(onError).toHaveBeenCalledWith(
      error,
      {
        stage: 'normal',
        type: 'transform',
        id: path.join(cwd, 'src', 'index.ts'),
      },
    )
  })
})
