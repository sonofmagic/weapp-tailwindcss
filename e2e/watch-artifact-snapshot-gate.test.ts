import type { WatchArtifactEntry, WatchCaseArtifacts } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { diffWatchArtifactSnapshots } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/artifacts'
import { assertDevHmrArtifactSnapshotGate } from './watchArtifactSnapshotGate'

function entry(file: string, content: string): WatchArtifactEntry {
  return {
    file,
    absoluteFile: `/repo/${file}`,
    exists: true,
    size: Buffer.byteLength(content),
    sha256: createHash('sha256').update(content).digest('hex'),
    kind: 'text',
    content,
  }
}

function artifacts(options: {
  devApp?: string
  devMain?: string
  hmrApp?: string
  hmrMain?: string
} = {}): WatchCaseArtifacts {
  const dev = {
    phase: 'dev' as const,
    capturedAt: '2026-07-10T00:00:00.000Z',
    files: [
      entry('dist/mp/app.wxss', options.devApp ?? '@import "./main.wxss";\n'),
      entry('dist/mp/main.wxss', options.devMain ?? '.dev-tailwind{display:block}\n'),
    ],
  }
  const hmr = {
    phase: 'hmr' as const,
    capturedAt: '2026-07-10T00:00:01.000Z',
    requestedHmrCount: 5,
    capturedAfterHmrCount: 6,
    files: [
      entry('dist/mp/app.wxss', options.hmrApp ?? '@import "./main.wxss";\n'),
      entry('dist/mp/main.wxss', options.hmrMain ?? '.hmr-tailwind{display:block}\n'),
    ],
  }
  return {
    requestedHmrCount: 5,
    capturedAfterHmrCount: 6,
    dev,
    hmr,
    diff: diffWatchArtifactSnapshots(dev, hmr, 5, 6),
  }
}

describe('dev/HMR artifact snapshot gate', () => {
  it('accepts a preserved import shell and non-empty generated target', () => {
    expect(() => assertDevHmrArtifactSnapshotGate('uni-app', artifacts())).not.toThrow()
  })

  it('rejects an import shell overwritten by generated css after HMR', () => {
    expect(() => assertDevHmrArtifactSnapshotGate('uni-app', artifacts({
      hmrApp: '.hmr-tailwind{display:block}\n',
    }))).toThrow('HMR replaced local import shell output')
  })

  it('rejects an empty imported style target after HMR', () => {
    expect(() => assertDevHmrArtifactSnapshotGate('uni-app', artifacts({
      hmrMain: '',
    }))).toThrow('HMR import shell target is missing or empty')
  })
})
