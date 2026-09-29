import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'
import { expect, it, vi } from 'vitest'
import { configure } from '../configs.mjs'

it.each(['esm', 'cjs'])('真实配置打包后 %s 捕获器可以加载 Node 内建模块，禁用组无需安装插件', async (format) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cost-config-'))
  try {
    const pkg = path.join(root, 'node_modules', 'weapp-tailwindcss')
    await mkdir(pkg, { recursive: true })
    await writeFile(path.join(root, 'package.json'), JSON.stringify({ type: 'module' }))
    await writeFile(path.join(pkg, 'package.json'), JSON.stringify({ name: 'weapp-tailwindcss', exports: { './vite': './index.cjs' } }))
    await writeFile(path.join(pkg, 'index.cjs'), 'exports.WeappTailwindcss = options => [{ name: "published", options }]')
    const file = path.join(root, `vite.config.${format === 'esm' ? 'ts' : 'cjs'}`)
    await writeFile(file, format === 'esm'
      ? 'import { WeappTailwindcss } from "weapp-tailwindcss/vite"; export default WeappTailwindcss({ cssEntries: ["entry.css"] })'
      : 'const { WeappTailwindcss } = require("weapp-tailwindcss/vite"); module.exports = WeappTailwindcss({ cssEntries: ["entry.css"] })')
    const consumer = { root, project: root, item: { family: 'uni' } }
    const recordsFile = path.join(root, 'options.jsonl')
    vi.stubEnv('WEAPP_DEMO_COST_CAPTURE', recordsFile)
    const load = async (name) => {
      const outfile = path.join(root, '.cost', `${name}.mjs`)
      await build({ entryPoints: [file], outfile, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent' })
      return (await import(pathToFileURL(outfile).href)).default
    }
    const restore = await configure(consumer, 'capture')
    expect((await load('captured'))[0].name).toBe('published')
    const records = (await readFile(recordsFile, 'utf8')).trim().split('\n').map(line => JSON.parse(line))
    expect(records[0].value.options.cssEntries).toEqual(['entry.css'])
    await restore()
    await rm(path.join(root, 'node_modules'), { recursive: true })
    await configure(consumer, 'disabled', records)
    expect(await load('disabled')).toEqual([])
  }
  finally { vi.unstubAllEnvs(); await rm(root, { recursive: true, force: true }) }
})
