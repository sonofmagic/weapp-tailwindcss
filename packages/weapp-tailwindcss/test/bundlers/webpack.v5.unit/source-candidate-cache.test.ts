import { mkdtemp, mkdir, realpath, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createWebpackSourceCandidateScanCache } from '@/bundlers/webpack/BaseUnifiedPlugin/v5-assets/source-candidate-cache'
import { createSourceCandidateCollector } from '@/bundlers/vite/source-candidates'

describe('bundlers/webpack source candidate scan cache', () => {
  const createdDirs: string[] = []

  afterEach(async () => {
    await Promise.all(createdDirs.map(dir => rm(dir, { recursive: true, force: true })))
    createdDirs.length = 0
  })

  async function createFixture() {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-webpack-source-cache-'))
    createdDirs.push(root)
    const src = path.join(root, 'src')
    await mkdir(src, { recursive: true })
    const pageA = path.join(src, 'a.tsx')
    const pageB = path.join(src, 'b.tsx')
    await writeFile(pageA, 'export const a = "w-1"', 'utf8')
    await writeFile(pageB, 'export const b = "w-2"', 'utf8')
    return {
      pageA: await realpath(pageA),
      pageB: await realpath(pageB),
      root,
    }
  }

  it('reuses watch scan snapshots and syncs changed source files incrementally', async () => {
    const { pageA, pageB, root } = await createFixture()
    const cache = createWebpackSourceCandidateScanCache()
    const scan = {
      entries: [
        {
          base: path.join(root, 'src'),
          negated: false,
          pattern: '**/*.tsx',
        },
        {
          base: path.join(root, 'src'),
          negated: false,
          pattern: '**/*.tsx',
        },
      ],
      explicit: true,
    }

    const firstCollector = createSourceCandidateCollector()
    const firstSyncFile = vi.spyOn(firstCollector, 'syncFile')
    const first = await cache.resolve({
      collector: firstCollector,
      outDir: path.join(root, 'dist'),
      root,
      sourceScan: scan,
      watchMode: true,
    })
    expect(firstSyncFile).toHaveBeenCalledTimes(2)
    expect(first.signatureHash).toMatch(/^[a-f0-9]{32}$/)
    expect(first.getSourceCandidatesForEntries(scan.entries)).toEqual(new Set(['w-1', 'w-2']))
    expect(cache.getMemoryStats()).toMatchObject({
      files: 2,
      lastHit: false,
      snapshots: 1,
    })
    expect(cache.getMemoryStats().signatureHash).toMatch(/^[a-f0-9]{32}$/)

    const secondCollector = createSourceCandidateCollector()
    const secondSyncFile = vi.spyOn(secondCollector, 'syncFile')
    const second = await cache.resolve({
      collector: secondCollector,
      outDir: path.join(root, 'dist'),
      root,
      sourceScan: scan,
      watchMode: true,
    })
    expect(secondSyncFile).not.toHaveBeenCalled()
    expect(second.getSourceCandidatesForEntries(scan.entries)).toEqual(new Set(['w-1', 'w-2']))
    expect(cache.getMemoryStats()).toMatchObject({
      files: 2,
      lastHit: true,
      snapshots: 1,
    })

    await writeFile(pageA, 'export const a = "w-3"', 'utf8')
    const thirdCollector = createSourceCandidateCollector()
    const thirdSyncFile = vi.spyOn(thirdCollector, 'syncFile')
    const third = await cache.resolve({
      changedFiles: [pageA],
      collector: thirdCollector,
      outDir: path.join(root, 'dist'),
      root,
      sourceScan: scan,
      watchMode: true,
    })
    expect(thirdSyncFile).toHaveBeenCalledTimes(1)
    expect(thirdSyncFile).toHaveBeenCalledWith(pageA)
    expect(thirdSyncFile).not.toHaveBeenCalledWith(pageB)
    expect(third.getSourceCandidatesForEntries(scan.entries)).toEqual(new Set(['w-2', 'w-3']))
    expect(cache.getMemoryStats()).toMatchObject({
      files: 2,
      lastHit: true,
      snapshots: 1,
    })
  })

  it('keeps distinct cache records behind short signature hashes', async () => {
    const { root } = await createFixture()
    const cache = createWebpackSourceCandidateScanCache()
    const sourceScan = {
      entries: [
        {
          base: path.join(root, 'src'),
          negated: false,
          pattern: '**/*.tsx',
        },
      ],
      explicit: true,
    }
    const first = await cache.resolve({
      collector: createSourceCandidateCollector(),
      outDir: path.join(root, 'dist'),
      root,
      sourceScan,
      watchMode: true,
    })
    const second = await cache.resolve({
      collector: createSourceCandidateCollector(),
      outDir: path.join(root, 'dist'),
      root,
      sourceScan: {
        ...sourceScan,
        inlineCandidates: {
          excluded: new Set(),
          included: new Set(['inline-token']),
        },
      },
      watchMode: true,
    })

    expect(first.signatureHash).not.toBe(second.signatureHash)
    expect(cache.getMemoryStats()).toMatchObject({
      snapshots: 2,
    })
  })
})
