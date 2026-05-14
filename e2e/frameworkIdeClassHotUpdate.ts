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

async function readFreshDevToolsPageWxml(projectPath: string, pageUrl: string) {
  const miniProgram = await new Launcher().launch({ projectPath, timeout: 30_000 })
  try {
    const page: any = await miniProgram.reLaunch(pageUrl)
    if (!page) {
      throw new Error(`Failed to relaunch page for IDE hot update: ${pageUrl}`)
    }
    return await readPageWxml(page, pageUrl)
  }
  finally {
    await miniProgram.close()
  }
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
  process.stdout.write(`[e2e:ide] ${watchCase.label} ${mutationKind} HMR verify DevTools visibility\n`)
  const liveHasMarker = await waitFor(
    async () => {
      try {
        return (await readPageWxml(page, pageUrl)).includes(scenario.marker)
      }
      catch {
        return false
      }
    },
    {
      timeoutMs: getDevToolsVisibleTimeoutMs(options),
      pollMs: options.pollMs,
      message: `[${watchCase.label}] DevTools page did not show IDE ${mutationKind} HMR marker: ${scenario.marker}`,
      onTick: session.ensureRunning,
    },
    mutationStartedAt,
  ).then(() => true).catch(() => false)

  if (liveHasMarker) {
    const liveAfter = await readPageWxml(page, pageUrl)
    if (liveBefore != null && liveBefore === liveAfter) {
      throw new Error(`[${watchCase.label}] DevTools live page WXML did not change after ${mutationKind} HMR`)
    }
    devtoolsVisible = 'live'
  }
  else if (mutationKind === 'template') {
    process.stdout.write(`[e2e:ide] ${watchCase.label} template HMR reopen DevTools for visibility fallback\n`)
    const freshWxml = await readFreshDevToolsPageWxml(launchProjectPath, pageUrl)
    if (!freshWxml.includes(scenario.marker)) {
      throw new Error(`[${watchCase.label}] DevTools page did not show template HMR marker after reopening project: ${scenario.marker}`)
    }
    if (liveBefore != null && liveBefore === freshWxml) {
      throw new Error(`[${watchCase.label}] DevTools fresh page WXML did not change after template HMR`)
    }
    devtoolsVisible = 'fresh'
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
