import type { OutputAsset } from 'rollup'
import { afterEach, describe, expect, it, vi } from 'vitest'

function createAsset(fileName: string, sourceFile: string): OutputAsset {
  return {
    type: 'asset',
    fileName,
    name: undefined,
    names: [],
    needsCodeReference: false,
    originalFileName: sourceFile,
    originalFileNames: [sourceFile],
    source: '.candidate{}',
  }
}

describe('vite removed files port', () => {
  afterEach(() => {
    vi.doUnmock('@/bundlers/vite/generate-bundle-runtime')
    vi.doUnmock('@/bundlers/vite/shared/create-framework-plugins-runtime')
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('routes a watch deletion into the next production snapshot once', async () => {
    const snapshots: Array<{ removedFiles: Set<string> }> = []
    const runtimeCloseBundle = vi.fn()
    vi.doMock('@/bundlers/vite/generate-bundle-runtime', async () => {
      const {
        buildBundleSnapshot,
        createBundleBuildState,
      } = await import('@/bundlers/vite/bundle-state')
      return {
        createGenerateBundleHook: vi.fn(() => {
          const state = createBundleBuildState()
          return async (_options: unknown, bundle: Record<string, OutputAsset>) => {
            snapshots.push(buildBundleSnapshot(bundle, {
              cache: {
                computeHash: (source: string) => source,
              },
              cssMatcher: () => true,
              htmlMatcher: () => true,
              jsMatcher: () => true,
            } as any, '/workspace/dist', state, false, {
              hasOmittedKnownFiles: true,
            }))
          }
        }),
      }
    })
    vi.doMock('@/bundlers/vite/shared/create-framework-plugins-runtime', async () => {
      const { createGenerateBundleHook } = await import('@/bundlers/vite/generate-bundle')
      return {
        createViteFrameworkPlugins: vi.fn(() => [{
          name: 'mock-vite-port',
          generateBundle: createGenerateBundleHook({
            runtimeState: {
              tailwindRuntime: { majorVersion: 4 },
              readyPromise: Promise.resolve(),
            },
          } as any),
          closeBundle: runtimeCloseBundle,
          watchChange: vi.fn(),
        }]),
      }
    })

    const { createViteFrameworkPlugins } = await import('@/bundlers/vite/shared/create-framework-plugins')
    const plugins = createViteFrameworkPlugins({}, {
      frameworkName: 'generic',
      styleInjectorDelegate: vi.fn() as any,
    })
    const plugin = plugins?.[0]
    const generateBundle = plugin?.generateBundle as (this: object, options: unknown, bundle: Record<string, OutputAsset>) => Promise<void>
    const watchChange = plugin?.watchChange as (id: string, change: { event: string }) => Promise<void>
    const sourceFile = '/workspace/src/theme.css'

    await generateBundle.call({}, {}, {
      'styles/theme.acss': createAsset('styles/theme.acss', sourceFile),
      'styles/other.ttss': createAsset('styles/other.ttss', '/workspace/src/other.css'),
    })
    await watchChange(sourceFile, { event: 'delete' })
    await generateBundle.call({}, {}, {})
    await generateBundle.call({}, {}, {})

    expect(snapshots[0]?.removedFiles).toEqual(new Set())
    expect(snapshots[1]?.removedFiles).toEqual(new Set(['styles/theme.acss']))
    expect(snapshots[2]?.removedFiles).toEqual(new Set())
    await plugin?.closeBundle?.()
    expect(runtimeCloseBundle).toHaveBeenCalledOnce()
  })
})
