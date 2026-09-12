import { mkdir, mkdtemp, readFile, realpath, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, it } from 'vitest'
import { repo } from './catalog.mjs'
import { replaceSourceFile } from './source-file.mjs'

const demoRequire = createRequire(path.join(repo, 'demo/uni-app-vite-tailwindcss-v4/package.json'))
const viteRequire = createRequire(demoRequire.resolve('vite/package.json'))
const rollupDist = path.dirname(viteRequire.resolve('rollup'))

it.each(['uni-app-vite-tailwindcss-v4', 'issue-uview-plus-cssentries'])('deduplicates identical notifications without dropping new file states (%s)', async (demo) => {
  const requireDemo = createRequire(path.join(repo, 'demo', demo, 'package.json'))
  const requireVite = createRequire(requireDemo.resolve('vite/package.json'))
  const { chokidar } = requireVite(path.join(path.dirname(requireVite.resolve('rollup')), 'shared/index.js'))
  const watcher = chokidar.watch([], { ignoreInitial: true })
  const file = path.join(tmpdir(), 'rollup-change-probe.json')
  const events = []
  watcher.on('change', (_, stats) => events.push(stats))
  const initial = { dev: 1, ino: 1, size: 10, mtimeMs: 1, ctimeMs: 1 }
  try {
    await watcher._emit('change', file, initial)
    await watcher._emit('change', file, { ...initial })
    expect(events).toEqual([initial])
    for (const key of ['dev', 'ino', 'size', 'mtimeMs', 'ctimeMs']) {
      const changed = { ...events.at(-1), [key]: events.at(-1)[key] + 1 }
      await watcher._emit('change', file, changed)
      expect(events.at(-1)).toEqual(changed)
      const count = events.length
      await watcher._emit('change', file, { ...changed })
      expect(events).toHaveLength(count)
    }
    expect(events).toHaveLength(6)
  }
  finally { await watcher.close() }
})

it.each(['cjs', 'esm'])('preserves transform invalidation received during an unfinished build (%s)', async (format) => {
  const rollup = format === 'cjs'
    ? viteRequire('rollup')
    : await import(pathToFileURL(path.join(rollupDist, 'es/rollup.js')).href)
  const dir = await realpath(await mkdtemp(path.join(tmpdir(), 'rollup-inflight-')))
  const entry = path.join(dir, 'entry.js')
  const dataDir = path.join(dir, 'data')
  const data = path.join(dataDir, 'value.json')
  const output = path.join(dir, 'bundle.mjs')
  let reached = false
  const release = Promise.withResolvers()
  const invalidated = []
  let watcher
  let inspection = 0
  try {
    await mkdir(dataDir)
    await replaceSourceFile(entry, 'export { default } from "virtual:derived"')
    await replaceSourceFile(data, '{"value":0}')
    watcher = rollup.watch({
      input: entry,
      output: { file: output, format: 'es' },
      watch: { onInvalidate(id) { invalidated.push(id) } },
      plugins: [{
        name: 'inflight-transform-dependency',
        resolveId(id) { return id === 'virtual:derived' ? id : null },
        load(id) { return id === 'virtual:derived' ? 'export default null' : null },
        async transform(_, id) {
          if (id !== 'virtual:derived') {
            return
          }
          this.addWatchFile(data)
          const { value } = JSON.parse(await readFile(data, 'utf8'))
          if (value === 1) {
            reached = true
            await release.promise
          }
          return `export default ${value * 2}`
        },
      }],
    })
    watcher.on('event', event => event.result?.close())
    const inspect = value => expect.poll(async () => {
      const module = await import(`${pathToFileURL(output).href}?inspection=${++inspection}`)
      return module.default
    }, { timeout: 5000, interval: 1 }).toBe(value)
    await inspect(0)
    await replaceSourceFile(data, '{"value":1}')
    await expect.poll(() => reached, { timeout: 5000, interval: 1 }).toBe(true)
    const previous = invalidated.length
    await replaceSourceFile(data, '{"value":2}')
    await expect.poll(() => invalidated.slice(previous), { timeout: 5000, interval: 1 }).toContain(data)
    release.resolve()
    await inspect(4)
    await replaceSourceFile(data, '{"value":3}')
    await inspect(6)
  }
  finally {
    release.resolve()
    await watcher?.close()
    await rm(dir, { recursive: true, force: true })
  }
}, 15_000)
