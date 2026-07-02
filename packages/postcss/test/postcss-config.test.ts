import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {
  getPostcssPluginName,
  removeTailwindPostcssPlugins,
  resolveFilteredPostcssConfig,
} from '@/index'

describe('postcss config helpers', () => {
  let tempDirs: string[] = []

  afterEach(async () => {
    await Promise.all(tempDirs.map(dir => rm(dir, { recursive: true, force: true })))
    tempDirs = []
  })

  async function createTempDir() {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-postcss-config-'))
    tempDirs.push(dir)
    return dir
  }

  it('gets plugin names from plugin objects and factories', () => {
    expect(getPostcssPluginName({ postcssPlugin: 'demo' })).toBe('demo')
    expect(getPostcssPluginName(() => ({ postcssPlugin: 'factory' }))).toBeUndefined()

    const factory = Object.assign(() => ({ postcssPlugin: 'factory' }), { postcss: true })
    expect(getPostcssPluginName(factory)).toBe('factory')

    const throwing = Object.assign(() => {
      throw new Error('boom')
    }, { postcss: true })
    expect(getPostcssPluginName(throwing)).toBeUndefined()
    expect(getPostcssPluginName(null)).toBeUndefined()
    expect(getPostcssPluginName({ postcssPlugin: 1 })).toBeUndefined()
  })

  it('removes tailwind postcss plugins in place', () => {
    const plugins = [
      { postcssPlugin: 'autoprefixer' },
      { postcssPlugin: 'tailwindcss' },
      { postcssPlugin: '@tailwindcss/postcss' },
    ]

    expect(removeTailwindPostcssPlugins(plugins)).toBe(2)
    expect(plugins).toEqual([{ postcssPlugin: 'autoprefixer' }])
  })

  it('loads config and filters tailwind plugins', async () => {
    const dir = await createTempDir()
    await writeFile(path.join(dir, 'postcss.config.cjs'), [
      'module.exports = {',
      '  plugins: [',
      '    { postcssPlugin: "tailwindcss" },',
      '    { postcssPlugin: "autoprefixer" }',
      '  ],',
      '  options: { from: undefined }',
      '}',
    ].join('\n'))

    const filtered = await resolveFilteredPostcssConfig(dir)
    expect(filtered).toMatchObject({
      options: {
        options: { from: undefined },
      },
      plugins: [{ postcssPlugin: 'autoprefixer' }],
      removed: 1,
    })
  })

  it('returns undefined when no config or no tailwind plugin exists', async () => {
    const emptyDir = await createTempDir()
    await expect(resolveFilteredPostcssConfig(emptyDir)).resolves.toBeUndefined()

    const dir = await createTempDir()
    await writeFile(path.join(dir, 'postcss.config.cjs'), [
      'module.exports = {',
      '  plugins: [{ postcssPlugin: "autoprefixer" }]',
      '}',
    ].join('\n'))
    await expect(resolveFilteredPostcssConfig(dir)).resolves.toBeUndefined()
  })

  it('handles non-array plugin configs and rethrows unexpected load errors', async () => {
    const objectPluginsDir = await createTempDir()
    await writeFile(path.join(objectPluginsDir, 'postcss.config.cjs'), [
      'module.exports = {',
      '  plugins: {}',
      '}',
    ].join('\n'))
    await expect(resolveFilteredPostcssConfig(objectPluginsDir)).resolves.toBeUndefined()

    const stringErrorDir = await createTempDir()
    await writeFile(path.join(stringErrorDir, 'postcss.config.cjs'), 'throw "boom"')
    await expect(resolveFilteredPostcssConfig(stringErrorDir)).rejects.toBe('boom')

    const errorDir = await createTempDir()
    await writeFile(path.join(errorDir, 'postcss.config.cjs'), 'throw new Error("custom failure")')
    await expect(resolveFilteredPostcssConfig(errorDir)).rejects.toThrow('custom failure')
  })
})
