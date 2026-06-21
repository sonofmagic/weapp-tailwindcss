import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { waitForClassMutationBaselineOutputs } from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/mutations/class'
import type {
  CliOptions,
  WatchCase,
  WatchSession,
} from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types'

function createOptions(): CliOptions {
  return {
    caseName: 'all',
    timeoutMs: 1000,
    pollMs: 10,
    skipBuild: true,
    quietSass: true,
    webOnly: false,
    styleOnly: false,
    mainStyleOnly: false,
  }
}

describe('watch-hmr class baseline', () => {
  let tempDir = ''

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true })
    }
  })

  it('waits for temporarily empty baseline outputs before mutating content', async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-class-baseline-'))
    const outputWxml = path.join(tempDir, 'index.wxml')
    const outputJs = path.join(tempDir, 'index.js')
    const outputStyle = path.join(tempDir, 'app.wxss')

    await Promise.all([
      writeFile(outputWxml, '', 'utf8'),
      writeFile(outputJs, '', 'utf8'),
      writeFile(outputStyle, '.ready{}', 'utf8'),
    ])

    const session: WatchSession = {
      child: {} as WatchSession['child'],
      ensureRunning: vi.fn(),
      lastCompileSuccessAt: vi.fn(() => 0),
      logs: vi.fn(() => ''),
      stop: vi.fn(async () => {}),
    }
    const watchCase = {
      label: 'demo/uni-app-vite-tailwindcss-v4',
      outputWxml,
      outputJs,
    } as WatchCase

    const refillOutputs = async () => {
      await Promise.all([
        writeFile(outputWxml, '<view class="ready"></view>', 'utf8'),
        writeFile(outputJs, 'export default {}', 'utf8'),
      ])
    }
    setTimeout(() => {
      void refillOutputs()
    }, 30)

    const outputs = await waitForClassMutationBaselineOutputs(
      watchCase,
      createOptions(),
      session,
      'content',
      [outputStyle],
    )

    expect(outputs.wxml).toContain('ready')
    expect(outputs.js).toContain('export default')
    expect(outputs.globalStyle).toContain('.ready')
    expect(session.ensureRunning).toHaveBeenCalled()
  })

  it('accepts an existing empty global style output as a class mutation baseline', async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-class-empty-style-'))
    const outputWxml = path.join(tempDir, 'index.wxml')
    const outputJs = path.join(tempDir, 'index.js')
    const outputStyle = path.join(tempDir, 'app.wxss')

    await Promise.all([
      writeFile(outputWxml, '<view class="ready"></view>', 'utf8'),
      writeFile(outputJs, 'export default {}', 'utf8'),
      writeFile(outputStyle, '', 'utf8'),
    ])

    const session: WatchSession = {
      child: {} as WatchSession['child'],
      ensureRunning: vi.fn(),
      lastCompileSuccessAt: vi.fn(() => 0),
      logs: vi.fn(() => ''),
      stop: vi.fn(async () => {}),
    }
    const watchCase = {
      label: 'demo/weapp-vite-tailwindcss-v4',
      outputWxml,
      outputJs,
    } as WatchCase

    const outputs = await waitForClassMutationBaselineOutputs(
      watchCase,
      createOptions(),
      session,
      'script',
      [outputStyle],
    )

    expect(outputs.wxml).toContain('ready')
    expect(outputs.js).toContain('export default')
    expect(outputs.globalStyle).toBe('')
  })
})
