import { mkdir, mkdtemp, readFile, realpath, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, it } from 'vitest'
import { repo } from './catalog.mjs'
import { replaceSourceFile } from './source-file.mjs'

it.each(['cjs', 'esm'].flatMap(format => ['file', 'directory'].map(dependency => ({ format, dependency }))))('keeps module and transform dependencies live after atomic replacement ($format, $dependency)', async ({ format, dependency }) => {
  const demoRequire = createRequire(path.join(repo, 'demo/uni-app-vite-tailwindcss-v4/package.json'))
  const viteRequire = createRequire(demoRequire.resolve('vite/package.json'))
  const rollup = format === 'cjs'
    ? viteRequire('rollup')
    : await import(pathToFileURL(path.join(path.dirname(viteRequire.resolve('rollup')), 'es/rollup.js')).href)
  const dir = await realpath(await mkdtemp(path.join(tmpdir(), 'rollup-transform-watch-')))
  const entry = path.join(dir, 'entry.js')
  const dataDir = path.join(dir, 'data')
  const data = path.join(dataDir, 'value.json')
  const output = path.join(dir, 'bundle.mjs')
  let watcher
  let builds = 0
  let errors = 0
  try {
    await mkdir(dataDir)
    await replaceSourceFile(entry, 'export { default as value } from "./data/value.json"; export { default as derived } from "virtual:derived"')
    await replaceSourceFile(data, '{"value":0}')
    watcher = rollup.watch({
      input: entry,
      output: { file: output, format: 'es' },
      plugins: [{
        name: 'shared-transform-dependency',
        resolveId(id) { return id === 'virtual:derived' ? id : null },
        load(id) { return id === 'virtual:derived' ? 'export default null' : null },
        async transform(code, id) {
          if (id === data) {
            return `export default ${JSON.parse(code).value}`
          }
          if (id === 'virtual:derived') {
            this.addWatchFile(dependency === 'directory' ? dataDir : data)
            return `export default ${JSON.parse(await readFile(data, 'utf8')).value * 2}`
          }
        },
      }],
    })
    watcher.on('event', (event) => {
      if (event.code === 'BUNDLE_END') {
        builds++
        void event.result.close()
      }
      else if (event.code === 'ERROR') {
        errors++
      }
    })
    const inspect = async (value, previous) => {
      await expect.poll(() => builds, { timeout: 5000 }).toBeGreaterThan(previous)
      const module = await import(`${pathToFileURL(output).href}?revision=${builds}`)
      expect(module.value).toBe(value)
      expect(module.derived).toBe(value * 2)
    }
    await inspect(0, 0)
    for (const value of [1, 2, 3]) {
      const previous = builds
      await replaceSourceFile(data, JSON.stringify({ value }))
      await inspect(value, previous)
    }
    await rm(data)
    await expect.poll(() => errors, { timeout: 5000 }).toBeGreaterThan(0)
    const previous = builds
    await replaceSourceFile(data, '{"value":4}')
    await inspect(4, previous)
  }
  finally {
    await watcher?.close()
    await rm(dir, { recursive: true, force: true })
  }
}, 30_000)
