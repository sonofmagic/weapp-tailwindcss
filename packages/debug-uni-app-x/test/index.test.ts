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
    vi.restoreAllMocks()
  })

  it('writes transformed output and logs bundles when enabled', async () => {
    process.env.DEBUG_UNI_APP_X_LOG = 'true'
    const cwd = path.resolve('/tmp/weapp-tailwindcss')
    const plugins = debugX({ cwd })

    expect(plugins).toHaveLength(3)

    const plugin = plugins[1]
    const transformResult = await plugin.transform?.('console.log(1)', path.join(cwd, 'src', 'index.ts'))
    expect(transformResult).toBeUndefined()

    expect(fs.outputFile).toHaveBeenCalledWith(
      path.join(cwd, '.debug', 'normal', 'src', 'index.ts'),
      'console.log(1)',
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
  })
})
