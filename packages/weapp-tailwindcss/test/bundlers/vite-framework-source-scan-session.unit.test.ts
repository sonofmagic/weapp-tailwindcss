import { describe, expect, it, vi } from 'vitest'
import { createSourceCandidateCollector } from '@/bundlers/vite/source-candidates'
import { createFrameworkSourceScanSession } from '@/bundlers/vite/shared/framework-source-scan-session'

describe('vite framework source scan session', () => {
  it('serializes explicit source snapshots for the same HMR file', async () => {
    let releaseFirstExtraction!: () => void
    const firstExtractionBlocked = new Promise<void>((resolve) => {
      releaseFirstExtraction = resolve
    })
    const extractedSources: string[] = []
    const sourceCandidateCollector = createSourceCandidateCollector({
      async extractor(source) {
        extractedSources.push(source)
        if (source === 'old-candidate') {
          await firstExtractionBlocked
        }
        return [source]
      },
    })
    const hmrCandidateState = {
      apply: vi.fn(change => change),
      createChange: vi.fn((_file, change) => change),
    }
    const session = createFrameworkSourceScanSession({
      cssMemory: {
        refreshRememberedCssSourceByCurrentFile: vi.fn(async () => {}),
      } as any,
      debug: vi.fn(),
      getResolvedConfig: () => ({ root: '/project' }),
      hmrCandidateState: hmrCandidateState as any,
      isCandidateRequest: () => true,
      isWatchLikeBuild: () => true,
      opts: {},
      runtimeState: {
        tailwindRuntime: {},
      } as any,
      shouldOwnTailwindGeneration: true,
      sourceCandidateCollector,
    })
    const file = '/project/src/pages/index.vue'

    const oldSync = session.syncChangedFile(file, 'old-candidate')
    await vi.waitFor(() => {
      expect(extractedSources).toEqual(['old-candidate'])
    })

    const newSync = session.syncChangedFile(file, 'new-candidate')
    await Promise.resolve()
    expect(extractedSources).toEqual(['old-candidate'])

    releaseFirstExtraction()
    await Promise.all([oldSync, newSync])

    expect(extractedSources).toEqual(['old-candidate', 'new-candidate'])
    expect(sourceCandidateCollector.values()).toEqual(new Set(['new-candidate']))
    expect(hmrCandidateState.apply).toHaveBeenCalledTimes(2)
  })
})
