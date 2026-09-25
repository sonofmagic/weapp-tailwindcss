import fs from 'node:fs'
import { mkdtemp, readFile, realpath, rm, stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, it, vi } from 'vitest'
import { repo } from './catalog.mjs'
import { replaceSourceFile } from './source-file.mjs'

it.each(['cjs', 'esm'])('Taro Rollup 原生监听在原子保存后绑定当前文件身份并继续更新 (%s)', async (format) => {
  const demoRequire = createRequire(path.join(repo, 'demo/taro-vite-react-tailwindcss-v4/package.json'))
  const viteRequire = createRequire(demoRequire.resolve('vite/package.json'))
  const rollup = format === 'cjs'
    ? viteRequire('rollup')
    : await import(pathToFileURL(path.join(path.dirname(viteRequire.resolve('rollup')), 'es/rollup.js')).href)
  const dir = await realpath(await mkdtemp(path.join(tmpdir(), 'rollup-file-identity-')))
  const entry = path.join(dir, 'entry.js')
  const output = path.join(dir, 'bundle.mjs')
  const nativeWatch = fs.watch
  const bindings = new Map()
  const watchSpy = vi.spyOn(fs, 'watch').mockImplementation((file, ...args) => {
    const native = nativeWatch(file, ...args)
    if (path.resolve(String(file)) === entry) {
      bindings.set(native, fs.statSync(entry).ino)
      native.once('close', () => bindings.delete(native))
    }
    return native
  })
  let watcher
  let inspection = 0
  try {
    await replaceSourceFile(entry, 'export const value = 0')
    watcher = rollup.watch({
      input: entry,
      output: { file: output, format: 'es' },
      // 显式使用 fs.watch，避免 macOS 的目录级 fsevents 掩盖 Windows 文件句柄失效。
      watch: { chokidar: { useFsEvents: false, usePolling: false } },
    })
    watcher.on('event', event => event.result?.close())
    for (const value of [0, 1, 2, 3]) {
      if (value > 0) {
        await replaceSourceFile(entry, `export const value = ${value}`)
      }
      await expect.poll(async () => {
        await readFile(output)
        const result = await import(`${pathToFileURL(output).href}?revision=${++inspection}`)
        return result.value
      }, { timeout: 5000 }).toBe(value)
      const current = await stat(entry)
      // 只收到一次 change 不足以证明监听存活；原生句柄必须指向替换后的文件。
      await expect.poll(() => [...bindings.values()], { timeout: 5000 }).toEqual([current.ino])
    }
  }
  finally {
    await watcher?.close()
    watchSpy.mockRestore()
    await rm(dir, { recursive: true, force: true })
  }
}, 30_000)
