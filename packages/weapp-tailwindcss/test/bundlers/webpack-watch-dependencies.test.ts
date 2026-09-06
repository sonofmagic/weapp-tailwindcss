import { mkdtemp, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { expect, it, vi } from 'vitest'
import webpack from 'webpack'
import { registerWebpackWatchFile } from '../../src/bundlers/webpack/loaders/watch-dependencies'

const require = createRequire(import.meta.url)
const taroRequire = createRequire(require.resolve('@tarojs/webpack5-runner/package.json', { paths: [path.resolve('demo/subpackage-taro-webpack-react-tailwindcss-v4')] }))
const VirtualModulesPlugin = taroRequire('webpack-virtual-modules')

it('registers a real Webpack virtual module as an existing input dependency', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'webpack-virtual-input-'))
  const file = path.join(root, 'virtual-entry.js')
  const modules = new VirtualModulesPlugin()
  const compiler = webpack({ mode: 'development', context: root, entry: file, output: { path: path.join(root, 'dist') }, plugins: [modules] })
  const context = { fs: compiler.inputFileSystem!, addDependency: vi.fn(), addMissingDependency: vi.fn(), addContextDependency: vi.fn() }
  try {
    modules.writeModule(file, 'export default 42')
    await registerWebpackWatchFile(context, file)
    expect(context.addDependency).toHaveBeenCalledWith(file)
    expect(context.addMissingDependency).not.toHaveBeenCalled()
    await registerWebpackWatchFile(context, path.join(root, 'absent.js'))
    expect(context.addMissingDependency).toHaveBeenCalledWith(path.join(root, 'absent.js'))
    await registerWebpackWatchFile(context, root)
    expect(context.addContextDependency).toHaveBeenCalledWith(root)
  }
  finally {
    await new Promise<void>((resolve, reject) => compiler.close(error => error ? reject(error) : resolve()))
    await rm(root, { recursive: true, force: true })
  }
})
