import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import { expect, it } from 'vitest'
import { repo } from './catalog.mjs'
import { assertTaroWatchBuildComplete, assertUniWatchBuildComplete, assertViteWatchBuildComplete, developmentEnvironment } from './process.mjs'

it('waits for uni-app startup and the current incremental compilation', () => {
  const initial = 'Compiling...\nDONE  Build complete. Watching for changes...\n'
  expect(() => assertUniWatchBuildComplete(initial)).toThrow()
  expect(() => assertUniWatchBuildComplete(`${initial}ready in 1000ms.`)).not.toThrow()
  expect(() => assertUniWatchBuildComplete(initial, initial.length)).toThrow()
  expect(() => assertUniWatchBuildComplete(`${initial}Incremental Compiling...`, initial.length)).toThrow()
  expect(() => assertUniWatchBuildComplete(`${initial}Incremental Compiling...\nDONE  Build complete. Watching for changes...`, initial.length)).not.toThrow()
})

it('waits for Taro to resume watching before another source update', () => {
  const initial = 'Compiled successfully in 3s\nWatching...'
  expect(() => assertTaroWatchBuildComplete(initial)).not.toThrow()
  expect(() => assertTaroWatchBuildComplete(initial, initial.length)).toThrow()
  expect(() => assertTaroWatchBuildComplete(`${initial}\nWebpack sealing (92%)`)).toThrow()
  expect(() => assertTaroWatchBuildComplete(`${initial}\nCompiled successfully in 1s`, initial.length)).toThrow()
  expect(() => assertTaroWatchBuildComplete(`${initial}\nCompiled successfully in 1s\nWatching...`, initial.length)).not.toThrow()
})

it('requires this Vite build to finish before reading its output', () => {
  const initial = 'build started...\nbuilt in 500ms.\n'
  expect(() => assertViteWatchBuildComplete(initial)).not.toThrow()
  expect(() => assertViteWatchBuildComplete(initial, initial.length)).toThrow()
  expect(() => assertViteWatchBuildComplete(`${initial}build started...\n`)).toThrow()
  expect(() => assertViteWatchBuildComplete(`${initial}build started...\nEBUSY: locked`)).toThrow()
  expect(() => assertViteWatchBuildComplete(`${initial}build started...\nbuilt in 400ms.\n`, initial.length)).not.toThrow()
})

it('keeps the default virtual-module watcher idle and accepts genuine module updates', async () => {
  const { stdout } = await execa(process.execPath, [path.join(repo, 'scripts/ci/demo-matrix/fixtures/virtual-watch.cjs')], {
    cwd: repo,
    env: developmentEnvironment({}),
  })
  const result = JSON.parse(stdout)
  expect(result.initialBuilds).toBeGreaterThan(0)
  expect(result.updatedBuilds).toBeGreaterThan(result.initialBuilds)
}, 20_000)
