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
import {
  getDevToolsBestEffortVisibleTimeoutMs,
  getDevToolsRelaunchTimeoutMs,
  getDevToolsVisibleTimeoutMs,
  readPageLiveContent,
} from './frameworkIdeLivePage'

const IDE_LIVE_PAGE_VISIBILITY_RELAXED_CASES = new Set<WatchCase['name']>([
  'taro-webpack-react-tailwindcss-v4',
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v3',
  'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
  'uni-app-x-hbuilderx-tailwindcss-v3',
  'uni-app-x-hbuilderx-tailwindcss-v4',
])

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

async function readFreshDevToolsPageContent(projectPath: string, options: CliOptions, pageUrl: string) {
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
        return await readPageLiveContent(page, pageUrl)
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

function shouldVerifyLivePageVisibility(watchCase: WatchCase) {
  return !watchCase.outputWxml.includes('/custom-tab-bar/')
}

export function shouldRequireIdeLivePageVisibility(watchCase?: Pick<WatchCase, 'name'>) {
  if (process.env['E2E_IDE_REQUIRE_LIVE_PAGE_VISIBILITY'] === '0') {
    return false
  }
  return !watchCase || !IDE_LIVE_PAGE_VISIBILITY_RELAXED_CASES.has(watchCase.name)
}

function getLivePageVisibilitySkipReason(watchCase: Pick<WatchCase, 'name'>) {
  if (process.env['E2E_IDE_REQUIRE_LIVE_PAGE_VISIBILITY'] === '0') {
    return 'E2E_IDE_REQUIRE_LIVE_PAGE_VISIBILITY=0'
  }
  if (IDE_LIVE_PAGE_VISIBILITY_RELAXED_CASES.has(watchCase.name)) {
    return 'case-level relaxed visibility'
  }
  return 'unknown'
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
  const liveBefore = await readPageLiveContent(page, pageUrl).catch(() => undefined)
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
  const verifyLivePage = shouldVerifyLivePageVisibility(watchCase)
  const requireLivePage = verifyLivePage && shouldRequireIdeLivePageVisibility(watchCase)
  const livePageTimeoutMs = requireLivePage
    ? getDevToolsVisibleTimeoutMs(options)
    : getDevToolsBestEffortVisibleTimeoutMs(options)
  process.stdout.write(`[e2e:ide] ${watchCase.label} ${mutationKind} HMR verify DevTools visibility=${verifyLivePage ? 'page' : 'compile'}\n`)
  let liveHasMarker = false
  let liveAfter: string | undefined
  if (verifyLivePage) {
    liveHasMarker = await waitFor(
      async () => {
        try {
          const content = await readPageLiveContent(page, pageUrl)
          if (content.includes(scenario.marker)) {
            liveAfter = content
            return true
          }
          return false
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
    if (liveAfter != null && liveBefore != null && liveBefore === liveAfter) {
      throw new Error(`[${watchCase.label}] DevTools live page content did not change after ${mutationKind} HMR`)
    }
    devtoolsVisible = 'live'
  }
  else if (verifyLivePage) {
    if (!requireLivePage) {
      process.stdout.write(`[e2e:ide] ${watchCase.label} ${mutationKind} HMR DevTools page visibility skipped by ${getLivePageVisibilitySkipReason(watchCase)}\n`)
      devtoolsVisible = 'artifact'
    }
    else {
      process.stdout.write(`[e2e:ide] ${watchCase.label} ${mutationKind} HMR reLaunch DevTools page for visibility fallback\n`)
      const freshPage: any = await withDevToolsRelaunchTimeout(options, pageUrl, miniProgram.reLaunch(pageUrl)).catch(() => undefined)
      const freshContent = freshPage ? await readPageLiveContent(freshPage, pageUrl).catch(() => undefined) : undefined
      if (freshContent == null || !freshContent.includes(scenario.marker)) {
        process.stdout.write(`[e2e:ide] ${watchCase.label} ${mutationKind} HMR reopen DevTools project for visibility fallback\n`)
        const reopenedContent = await readFreshDevToolsPageContent(launchProjectPath, options, pageUrl).catch(() => undefined)
        if (reopenedContent == null || !reopenedContent.includes(scenario.marker)) {
          throw new Error(`[${watchCase.label}] DevTools page did not show ${mutationKind} HMR marker after reLaunch/reopen: ${scenario.marker}`)
        }
        else if (liveBefore != null && liveBefore === reopenedContent) {
          throw new Error(`[${watchCase.label}] DevTools reopened page content did not change after ${mutationKind} HMR`)
        }
        else {
          devtoolsVisible = 'reopened'
        }
      }
      else if (liveBefore != null && liveBefore === freshContent) {
        throw new Error(`[${watchCase.label}] DevTools fresh page content did not change after ${mutationKind} HMR`)
      }
      else {
        devtoolsVisible = 'relaunch'
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
