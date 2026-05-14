import type { createWatchSession } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/session'
import type { CliOptions, WatchCase } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types'
import process from 'node:process'
import { Launcher } from '@weapp-vite/miniprogram-automator'
import { buildHexScriptRoundConfigs } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/round-configs'
import {
  createClassMutationScenario,
  waitForCompileSettled,
  waitForMarkerState,
  waitForOutputFilesUpdated,
} from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/mutations'
import { waitFor, writeFilePreserveEol } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/text'
import {
  collectArtifactMtimes,
  countChangedArtifacts,
  hasAnyNeedle,
  joinArtifactContent,
  readArtifacts,
  summarizeChangedArtifacts,
} from './frameworkIdeHotUpdateArtifacts'

function readNumberEnv(name: string, fallback: number) {
  const raw = process.env[name]
  if (!raw) {
    return fallback
  }
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

function getDevToolsReadTimeoutMs() {
  return readNumberEnv(
    'E2E_IDE_DEVTOOLS_READ_TIMEOUT_MS',
    Math.min(readNumberEnv('E2E_AUTOMATOR_TIMEOUT_MS', 20_000), 5000),
  )
}

function getDevToolsVisibleTimeoutMs(options: CliOptions) {
  return Math.min(options.timeoutMs, readNumberEnv('E2E_IDE_VISIBLE_TIMEOUT_MS', 30_000))
}

function getDevToolsBestEffortVisibleTimeoutMs(options: CliOptions) {
  return Math.min(getDevToolsVisibleTimeoutMs(options), readNumberEnv('E2E_IDE_BEST_EFFORT_VISIBLE_TIMEOUT_MS', 3000))
}

function getDevToolsRelaunchTimeoutMs(options: CliOptions) {
  return Math.min(options.timeoutMs, readNumberEnv('E2E_IDE_RELAUNCH_TIMEOUT_MS', 20_000))
}

async function withDevToolsReadTimeout<T>(pageUrl: string, task: Promise<T>) {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      task,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`DevTools page WXML read timed out after ${getDevToolsReadTimeoutMs()}ms: ${pageUrl}`))
        }, getDevToolsReadTimeoutMs())
      }),
    ])
  }
  finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
}

async function readPageWxml(page: any, pageUrl: string) {
  return await withDevToolsReadTimeout(pageUrl, readPageWxmlRaw(page, pageUrl))
}

async function readPageWxmlRaw(page: any, pageUrl: string) {
  const pageRoot: any = await page.$('page')
  const wxml = await pageRoot?.wxml()
  if (typeof wxml !== 'string') {
    throw new TypeError(`Failed to read live page WXML for IDE hot update: ${pageUrl}`)
  }
  return wxml
}

async function withDevToolsRelaunchTimeout<T>(options: CliOptions, pageUrl: string, task: Promise<T>) {
  const timeoutMs = getDevToolsRelaunchTimeoutMs(options)
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      task,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`DevTools reLaunch timed out after ${timeoutMs}ms: ${pageUrl}`))
        }, timeoutMs)
      }),
    ])
  }
  finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
}

async function readFreshDevToolsPageWxml(projectPath: string, options: CliOptions, pageUrl: string) {
  const launcher = new Launcher()
  let freshMiniProgram: any
  return await waitFor(
    async () => {
      try {
        if (!freshMiniProgram) {
          freshMiniProgram = await withDevToolsRelaunchTimeout(
            options,
            pageUrl,
            launcher.launch({ projectPath, timeout: getDevToolsRelaunchTimeoutMs(options) }),
          )
        }
        const page: any = await withDevToolsRelaunchTimeout(options, pageUrl, freshMiniProgram.reLaunch(pageUrl))
        if (!page) {
          return undefined
        }
        return await readPageWxml(page, pageUrl)
      }
      catch {
        return undefined
      }
    },
    {
      timeoutMs: getDevToolsVisibleTimeoutMs(options),
      pollMs: options.pollMs,
      message: `DevTools page did not recover after reopening project for IDE hot update: ${pageUrl}`,
    },
  ).finally(async () => {
    await freshMiniProgram?.close?.().catch(() => undefined)
  })
}

function resolveRoundConfig(watchCase: WatchCase) {
  const roundConfigs = watchCase.templateMutation.roundConfigs ?? buildHexScriptRoundConfigs()
  return roundConfigs.find(item => item.name === 'complex-corpus')
    ?? roundConfigs.find(item => item.name === 'baseline-arbitrary')
    ?? roundConfigs[0]!
}

function resolveUpdatedArtifactFiles(files: string[], baselineMtimes: Map<string, number>) {
  return files.filter(file => file.includes('*') || baselineMtimes.has(file))
}

function shouldVerifyLivePageVisibility(watchCase: WatchCase, mutationKind: 'template' | 'script') {
  return mutationKind === 'template'
    && !watchCase.outputWxml.includes('/custom-tab-bar/')
}

export function shouldRequireIdeLivePageVisibility(watchCase: Pick<WatchCase, 'name'>) {
  return process.env['E2E_IDE_REQUIRE_LIVE_PAGE_VISIBILITY'] === '1'
    && watchCase.name !== 'taro-webpack-react-tailwindcss-v4'
}

export async function runIdeClassHotUpdate(
  options: CliOptions,
  watchCase: WatchCase,
  session: ReturnType<typeof createWatchSession>,
  mutationKind: 'template' | 'script',
  sourceOriginal: string,
  miniProgram: any,
  page: any,
  pageUrl: string,
  launchProjectPath: string,
) {
  const mutation = mutationKind === 'template' ? watchCase.templateMutation : watchCase.scriptMutation
  const sourceFile = mutation.sourceFile
  process.stdout.write(`[e2e:ide] ${watchCase.label} ${mutationKind} HMR mutate ${sourceFile}\n`)
  const { artifacts: baselineArtifacts, mtimes: baselineMtimes } = await collectArtifactMtimes(watchCase)
  const liveBefore = await readPageWxml(page, pageUrl).catch(() => undefined)
  const scenario = createClassMutationScenario(
    watchCase,
    mutationKind,
    mutation,
    sourceOriginal,
    joinArtifactContent(baselineArtifacts, 'wxml'),
    joinArtifactContent(baselineArtifacts, 'js'),
    joinArtifactContent(baselineArtifacts, 'style'),
    '__twIdeWatchClass',
    resolveRoundConfig(watchCase),
  )
  const mutationStartedAt = Date.now()

  await writeFilePreserveEol(sourceFile, scenario.mutatedSource, sourceOriginal)
  await waitForOutputFilesUpdated(
    watchCase,
    resolveUpdatedArtifactFiles([
      watchCase.outputWxml,
      watchCase.outputJs,
      ...watchCase.outputStyleCandidates,
      ...watchCase.globalStyleCandidates,
    ], baselineMtimes),
    baselineMtimes,
    options,
    session,
    mutationStartedAt,
    async () => hasAnyNeedle(await readArtifacts(watchCase), [scenario.marker, ...scenario.freshEscapedClasses]),
  )
  await waitForMarkerState(watchCase, scenario.marker, 'present', options, session, mutationStartedAt)

  let changedArtifacts: string[] = []
  const afterArtifacts = await waitFor(
    async () => {
      const currentArtifacts = await readArtifacts(watchCase)
      const changedCount = countChangedArtifacts(baselineArtifacts, currentArtifacts)
      const hasMarker = hasAnyNeedle(currentArtifacts, [scenario.marker])
      const hasEscapedClass = hasAnyNeedle(currentArtifacts, scenario.freshEscapedClasses)
      if (changedCount > 0 && hasMarker && hasEscapedClass) {
        changedArtifacts = summarizeChangedArtifacts(baselineArtifacts, currentArtifacts)
        return true
      }
      return false
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] IDE ${mutationKind} HMR artifacts did not contain marker and transformed classes in time`,
      onTick: session.ensureRunning,
    },
    mutationStartedAt,
  ).then(async () => readArtifacts(watchCase))

  if (!hasAnyNeedle(afterArtifacts, scenario.freshEscapedClasses)) {
    throw new Error(`[${watchCase.label}] IDE ${mutationKind} HMR artifacts missed transformed classes`)
  }

  await miniProgram.clearCache?.({ clean: 'compile' }).catch(() => undefined)
  await miniProgram.compile({ force: true }).catch(() => undefined)
  let devtoolsVisible = 'false'
  const verifyLivePage = shouldVerifyLivePageVisibility(watchCase, mutationKind)
  const requireLivePage = verifyLivePage && shouldRequireIdeLivePageVisibility(watchCase)
  const livePageTimeoutMs = requireLivePage
    ? getDevToolsVisibleTimeoutMs(options)
    : getDevToolsBestEffortVisibleTimeoutMs(options)
  process.stdout.write(`[e2e:ide] ${watchCase.label} ${mutationKind} HMR verify DevTools visibility=${verifyLivePage ? 'page' : 'compile'}\n`)
  let liveHasMarker = false
  if (verifyLivePage) {
    liveHasMarker = await waitFor(
      async () => {
        try {
          return (await readPageWxml(page, pageUrl)).includes(scenario.marker)
        }
        catch {
          return false
        }
      },
      {
        timeoutMs: livePageTimeoutMs,
        pollMs: options.pollMs,
        message: `[${watchCase.label}] DevTools page did not show IDE ${mutationKind} HMR marker: ${scenario.marker}`,
        onTick: session.ensureRunning,
      },
      mutationStartedAt,
    ).then(() => true).catch(() => false)
  }

  if (liveHasMarker) {
    const liveAfter = await readPageWxml(page, pageUrl)
    if (liveBefore != null && liveBefore === liveAfter) {
      throw new Error(`[${watchCase.label}] DevTools live page WXML did not change after ${mutationKind} HMR`)
    }
    devtoolsVisible = 'live'
  }
  else if (verifyLivePage && mutationKind === 'template') {
    if (!requireLivePage) {
      process.stdout.write(`[e2e:ide] ${watchCase.label} template HMR DevTools page visibility skipped after artifact verification\n`)
      devtoolsVisible = 'artifact'
    }
    else {
      process.stdout.write(`[e2e:ide] ${watchCase.label} template HMR reopen DevTools for visibility fallback\n`)
      const freshWxml = await readFreshDevToolsPageWxml(launchProjectPath, options, pageUrl).catch(() => undefined)
      if (freshWxml == null || !freshWxml.includes(scenario.marker)) {
        throw new Error(`[${watchCase.label}] DevTools page did not show template HMR marker after reopening project: ${scenario.marker}`)
      }
      else if (liveBefore != null && liveBefore === freshWxml) {
        throw new Error(`[${watchCase.label}] DevTools fresh page WXML did not change after template HMR`)
      }
      else {
        devtoolsVisible = 'fresh'
      }
    }
  }
  else {
    devtoolsVisible = 'compile'
  }

  process.stdout.write(
    `[e2e:ide] ${watchCase.label} ${mutationKind} HMR changed artifacts=${changedArtifacts.length}, devtoolsVisible=${devtoolsVisible}: ${changedArtifacts.join(', ')}\n`,
  )

  const rollbackStartedAt = Date.now()
  await writeFilePreserveEol(sourceFile, sourceOriginal, sourceOriginal)
  await waitForCompileSettled(watchCase, options, session, rollbackStartedAt)
  await waitForMarkerState(watchCase, scenario.marker, 'absent', options, session, rollbackStartedAt)
  await miniProgram.clearCache?.({ clean: 'compile' }).catch(() => undefined)
  await miniProgram.compile({ force: true }).catch(() => undefined)
}
