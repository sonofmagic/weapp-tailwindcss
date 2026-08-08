import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFrameworkSourceScanSession } from '@/bundlers/vite/shared/framework-source-scan-session'
import { createSourceCandidateCollector } from '@/bundlers/vite/source-candidates'

const createdDirs: string[] = []

async function createTempWorkspace() {
  const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-vite-source-session-'))
  const appRoot = path.join(workspaceRoot, 'packages/app')
  await mkdir(appRoot, { recursive: true })
  createdDirs.push(workspaceRoot)
  return { appRoot, workspaceRoot }
}

function createSession(options: {
  appRoot: string
  extractor: (source: string) => Promise<string[]>
  sources?: Array<{ base: string, pattern: string, negated: boolean }>
}) {
  const sourceCandidateCollector = createSourceCandidateCollector({ extractor: options.extractor })
  const hmrCandidateState = {
    apply: vi.fn(change => change),
    createChange: vi.fn((_file, change) => change),
  }
  return {
    session: createFrameworkSourceScanSession({
      cssMemory: {
        refreshRememberedCssSourceByCurrentFile: vi.fn(async () => {}),
        refreshRememberedCssSourceBySourceFile: vi.fn(async () => {}),
      } as any,
      debug: vi.fn(),
      getResolvedConfig: () => ({ root: options.appRoot }),
      hmrCandidateState: hmrCandidateState as any,
      isCandidateRequest: () => true,
      isWatchLikeBuild: () => true,
      opts: {},
      runtimeState: {
        tailwindRuntime: {
          majorVersion: 4,
          options: {
            projectRoot: options.appRoot,
            tailwindcss: {
              cwd: options.appRoot,
              v4: {
                base: options.appRoot,
                sources: options.sources,
              },
            },
          },
        },
      } as any,
      shouldOwnTailwindGeneration: true,
      sourceCandidateCollector,
    }),
    sourceCandidateCollector,
  }
}

describe('vite framework source scan session', () => {
  afterEach(async () => {
    await Promise.all(createdDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
  })

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

  it('keeps implicit transformed modules inside the source scan roots', async () => {
    const { appRoot, workspaceRoot } = await createTempWorkspace()
    const extractor = vi.fn(async (source: string) => [source])
    const { session, sourceCandidateCollector } = createSession({ appRoot, extractor })
    await session.sync()
    extractor.mockClear()

    const appFile = path.join(appRoot, 'src/App.vue')
    const dependencyFile = path.join(workspaceRoot, 'node_modules/monaco-editor/index.ts')
    await session.syncChangedFile(dependencyFile, 'text-blue-500')
    await session.syncChangedFile(appFile, 'text-green-500')

    expect(extractor).toHaveBeenCalledOnce()
    expect(extractor).toHaveBeenCalledWith('text-green-500', 'vue')
    expect(sourceCandidateCollector.values()).toEqual(new Set(['text-green-500']))
  })

  it('keeps explicitly configured dependency sources eligible outside the vite root', async () => {
    const { appRoot, workspaceRoot } = await createTempWorkspace()
    const dependencyRoot = path.join(workspaceRoot, 'node_modules/example')
    const extractor = vi.fn(async (source: string) => [source])
    const { session, sourceCandidateCollector } = createSession({
      appRoot,
      extractor,
      sources: [{ base: dependencyRoot, pattern: '**/*.ts', negated: false }],
    })
    await session.sync()
    extractor.mockClear()

    const dependencyFile = path.join(dependencyRoot, 'index.ts')
    const unrelatedFile = path.join(workspaceRoot, 'node_modules/other/index.ts')
    await session.syncChangedFile(dependencyFile, 'text-blue-500')
    await session.syncChangedFile(unrelatedFile, 'text-red-500')

    expect(extractor).toHaveBeenCalledOnce()
    expect(extractor).toHaveBeenCalledWith('text-blue-500', 'ts')
    expect(sourceCandidateCollector.values()).toEqual(new Set(['text-blue-500']))
  })
})
