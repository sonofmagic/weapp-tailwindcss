import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import { expect, it } from 'vitest'
import { repo } from './catalog.mjs'
import { developmentEnvironment } from './process.mjs'

it('keeps the default virtual-module watcher idle and accepts genuine module updates', async () => {
  const { stdout } = await execa(process.execPath, [path.join(repo, 'scripts/ci/demo-matrix/fixtures/virtual-watch.cjs')], {
    cwd: repo,
    env: developmentEnvironment({}),
  })
  const result = JSON.parse(stdout)
  expect(result.initialBuilds).toBeGreaterThan(0)
  expect(result.updatedBuilds).toBeGreaterThan(result.initialBuilds)
}, 20_000)
