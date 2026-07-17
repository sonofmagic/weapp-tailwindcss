import { afterEach, describe, expect, it, vi } from 'vitest'

describe('bundlers/webpack source candidate refresh', () => {
  afterEach(() => {
    vi.doUnmock('@/bundlers/shared/source-scan')
    vi.resetModules()
    vi.restoreAllMocks()
  })

  function createRefreshOptions(sourceScan: unknown) {
    const resolveSourceScanEntries = vi.fn(async () => sourceScan)
    const scanCache = {
      resolve: vi.fn(async () => ({
        getSourceCandidatesForEntries: vi.fn(() => new Set<string>()),
        signatureHash: 'signature',
        tokenSources: new Map(),
      })),
    }

    vi.doMock('@/bundlers/shared/source-scan', async (importOriginal) => ({
      ...(await importOriginal<typeof import('@/bundlers/shared/source-scan')>()),
      resolveSourceScanEntries,
    }))

    return {
      options: {
        compilerOptions: {
          arbitraryValues: {
            bareArbitraryValues: false,
          },
          tailwindcssBasedir: '/demo',
        },
        debug: vi.fn(),
        outputDir: '/demo/dist',
        runtimeState: {
          tailwindRuntime: {
            majorVersion: 4,
          },
        },
        scanCache,
        watchChangedFiles: new Set<string>(),
        watchMode: false,
      },
      resolveSourceScanEntries,
      scanCache,
    }
  }

  it('skips demo dev/build source candidate refresh when cssSources have no effective scan input', async () => {
    const { options, resolveSourceScanEntries, scanCache } = createRefreshOptions({
      explicit: false,
    })
    const { refreshWebpackSourceCandidates } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5-assets/source-candidate-refresh')

    await expect(refreshWebpackSourceCandidates(options as any)).resolves.toBeUndefined()

    expect(resolveSourceScanEntries).toHaveBeenCalledWith(
      options.compilerOptions,
      options.runtimeState.tailwindRuntime,
      {
        outDir: '/demo/dist',
        root: '/demo',
      },
    )
    expect(scanCache.resolve).not.toHaveBeenCalled()
  })

  it('keeps explicit @source and inline candidates on the webpack refresh path', async () => {
    const sourceScan = {
      entries: [{
        base: '/demo/src',
        negated: false,
        pattern: '**/*.{ts,tsx,vue}',
      }],
      explicit: true,
      inlineCandidates: {
        included: new Set(['text-[32rpx]']),
      },
    }
    const { options, scanCache } = createRefreshOptions(sourceScan)
    const { refreshWebpackSourceCandidates } = await import('@/bundlers/webpack/BaseUnifiedPlugin/v5-assets/source-candidate-refresh')

    await refreshWebpackSourceCandidates(options as any)

    expect(scanCache.resolve).toHaveBeenCalledWith(expect.objectContaining({
      changedFiles: options.watchChangedFiles,
      outDir: '/demo/dist',
      root: '/demo',
      sourceScan,
      watchMode: false,
    }))
  })
})
