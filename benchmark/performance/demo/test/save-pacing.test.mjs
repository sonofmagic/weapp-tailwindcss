import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { once } from 'node:events'
import { watch } from 'chokidar'
import { expect, it } from 'vitest'
import { replaceSourceFile } from '../../../../scripts/ci/demo-matrix/source-file.mjs'
import { createSavePacer, interSaveQuietMs } from '../save-pacing.mjs'

it('真实 watcher 连续原子保存逐次收到当前内容，保存间隔发生在计时开始之前', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cost-save-pacing-'))
  const file = path.join(root, 'entry.js')
  await writeFile(file, 'initial')
  const watcher = watch(root, { ignoreInitial: true, useFsEvents: false })
  try {
    await once(watcher, 'ready')
    let settledAt = performance.now()
    const pacer = createSavePacer()
    for (let round = 0; round < 4; round++) {
      await pacer.beforeSave()
      expect(performance.now() - settledAt).toBeGreaterThanOrEqual(interSaveQuietMs)
      const changed = once(watcher, 'change', { signal: AbortSignal.timeout(2000) })
      const began = performance.now()
      await replaceSourceFile(file, `marker-${round}`)
      const [updated] = await changed
      expect(path.resolve(updated)).toBe(file)
      expect(await readFile(file, 'utf8')).toBe(`marker-${round}`)
      expect(performance.now()).toBeGreaterThanOrEqual(began)
      settledAt = performance.now()
      pacer.settled()
    }
  }
  finally { await watcher.close(); await rm(root, { recursive: true, force: true }) }
})
