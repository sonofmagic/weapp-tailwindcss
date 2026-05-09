import type {
  AddedClassHmrMetrics,
  ClassMutationConfig,
  CliOptions,
  MutationRoundConfig,
  OutputMtime,
  WatchCase,
  WatchSession,
} from '../../types'
import { replaceWxml } from '../../../core/replace-wxml'
import {
  assertContains,
  assertContainsOneOf,
  getMtime,
  readFileIfExists,
  waitFor,
  writeFilePreserveEol,
} from '../../text'
import {
  createClassMutationScenario,
  readJoinedOutputFiles,
  waitForMarkerState,
  waitForOutputsUpdated,
} from '../shared'
import { buildAddedTailwindClassTokens } from '../tokens'

interface RunAddedClassMutationOptions {
  watchCase: WatchCase
  options: CliOptions
  session: WatchSession
  mutationKind: 'template' | 'script'
  mutation: ClassMutationConfig
  sourceOriginal: string
  sourcePath: string
  classVariableName: string
  globalStyleOutputs: string[]
  minRequiredGlobalStyleEscapedClasses: number
  roundConfig: MutationRoundConfig
  baselineMtime: OutputMtime
  verifyClassLiteralIn: Array<'wxml' | 'js'>
}

interface OutputSnapshot { wxml: string, js: string, globalStyle: string }

async function readOutputs(watchCase: WatchCase, globalStyleOutputs: string[]): Promise<OutputSnapshot> {
  const [wxml, js, globalStyle] = await Promise.all([
    readFileIfExists(watchCase.outputWxml),
    readFileIfExists(watchCase.outputJs),
    readJoinedOutputFiles(globalStyleOutputs),
  ])
  return {
    wxml: wxml ?? '',
    js: js ?? '',
    globalStyle,
  }
}

function assertClassOutputs(
  outputs: OutputSnapshot,
  watchCase: WatchCase,
  mutationKind: 'template' | 'script',
  mutation: ClassMutationConfig,
  verifyClassLiteralIn: Array<'wxml' | 'js'>,
  marker: string,
  classTokens: string[],
  escapedClasses: string[],
  minRequiredEscapedClasses: number,
) {
  if (!outputs.wxml.includes(marker) && !outputs.js.includes(marker)) {
    throw new Error(`[${watchCase.label}] added-class ${mutationKind} marker missing: ${marker}`)
  }

  for (const escaped of escapedClasses) {
    if (mutation.verifyEscapedIn.includes('wxml')) {
      assertContains(outputs.wxml, escaped, `[${watchCase.label}] added-class ${mutationKind} wxml`)
    }
    if (mutation.verifyEscapedIn.includes('js')) {
      assertContains(outputs.js, escaped, `[${watchCase.label}] added-class ${mutationKind} js`)
    }
  }

  for (const [index, classToken] of classTokens.entries()) {
    const escapedToken = escapedClasses[index]
    const expectedValues = escapedToken ? [classToken, escapedToken] : [classToken]
    if (verifyClassLiteralIn.includes('wxml')) {
      assertContainsOneOf(outputs.wxml, expectedValues, `[${watchCase.label}] added-class ${mutationKind} wxml literal`)
    }
    if (verifyClassLiteralIn.includes('js')) {
      assertContainsOneOf(outputs.js, expectedValues, `[${watchCase.label}] added-class ${mutationKind} js literal`)
    }
  }

  const verifiedEscapedClasses = escapedClasses.filter(escaped => outputs.globalStyle.includes(escaped))
  if (verifiedEscapedClasses.length < minRequiredEscapedClasses) {
    throw new Error(
      `[${watchCase.label}] added-class ${mutationKind} global style has insufficient transformed classes: required=${minRequiredEscapedClasses}, actual=${verifiedEscapedClasses.length}`,
    )
  }

  return verifiedEscapedClasses
}

function buildFreshAddedClassTokens(
  baselineWxml: string,
  baselineJs: string,
  baselineGlobalStyle: string,
  existingEscapedClasses: string[],
) {
  const maxAttempts = 100
  const existingEscaped = new Set(existingEscapedClasses)

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const seed = `${attempt.toString().padStart(2, '0')}${Date.now().toString().slice(-6)}`
    const addedClassTokens = buildAddedTailwindClassTokens(seed)
    const addedEscapedClasses = addedClassTokens.map(token => replaceWxml(token))
    const freshAddedEscapedClasses = addedEscapedClasses.filter((escaped) => {
      return !existingEscaped.has(escaped)
        && !baselineWxml.includes(escaped)
        && !baselineJs.includes(escaped)
        && !baselineGlobalStyle.includes(escaped)
    })

    if (freshAddedEscapedClasses.length >= 3) {
      return {
        addedClassTokens,
        addedEscapedClasses,
      }
    }
  }

  throw new Error('failed to generate fresh added Tailwind classes for HMR')
}

export async function runAddedClassMutation(
  options: RunAddedClassMutationOptions,
): Promise<{ baselineMtime: OutputMtime, addedClassHmr: AddedClassHmrMetrics }> {
  const {
    watchCase,
    options: cliOptions,
    session,
    mutationKind,
    mutation,
    sourceOriginal,
    sourcePath,
    classVariableName,
    globalStyleOutputs,
    minRequiredGlobalStyleEscapedClasses,
    roundConfig,
    baselineMtime,
    verifyClassLiteralIn,
  } = options

  const [baselineWxml, baselineJs, baselineGlobalStyle] = await Promise.all([
    readFileIfExists(watchCase.outputWxml),
    readFileIfExists(watchCase.outputJs),
    readJoinedOutputFiles(globalStyleOutputs),
  ])

  if (!baselineWxml || !baselineJs || !baselineGlobalStyle) {
    throw new Error(`[${watchCase.label}] missing baseline outputs for ${mutationKind} added-class mutation`)
  }

  const baseScenario = createClassMutationScenario(
    watchCase,
    mutationKind,
    mutation,
    sourceOriginal,
    baselineWxml,
    baselineJs,
    baselineGlobalStyle,
    classVariableName,
    roundConfig,
  )
  const addedClasses = buildFreshAddedClassTokens(
    baselineWxml,
    baselineJs,
    baselineGlobalStyle,
    baseScenario.escapedClasses,
  )
  const addedClassLiteral = addedClasses.addedClassTokens.join(' ')
  const classLiteralAfter = `${baseScenario.classLiteral} ${addedClassLiteral}`
  const markerAfter = `${baseScenario.marker}-added`
  const sourceAfterAdd = mutation.mutate(sourceOriginal, {
    marker: markerAfter,
    classLiteral: classLiteralAfter,
    classVariableName,
  })

  if (sourceAfterAdd === sourceOriginal || sourceAfterAdd === baseScenario.mutatedSource) {
    throw new Error(`[${watchCase.label}] failed to build ${mutationKind} added-class source`)
  }

  const setupStartedAt = Date.now()
  await writeFilePreserveEol(sourcePath, baseScenario.mutatedSource, sourceOriginal)
  await waitForOutputsUpdated(watchCase, baselineMtime, cliOptions, session, setupStartedAt)
  await waitForMarkerState(
    watchCase,
    baseScenario.marker,
    'present',
    cliOptions,
    session,
    setupStartedAt,
  )

  const baselineBeforeAdd = {
    wxml: await getMtime(watchCase.outputWxml),
    js: await getMtime(watchCase.outputJs),
  }
  const minRequiredEscapedClasses = minRequiredGlobalStyleEscapedClasses === 0
    ? 0
    : Math.max(1, Math.min(minRequiredGlobalStyleEscapedClasses, addedClasses.addedEscapedClasses.length))
  let verifiedAddedEscapedClasses: string[] = []

  const hotUpdateStartedAt = Date.now()
  await writeFilePreserveEol(sourcePath, sourceAfterAdd, sourceOriginal)
  const hotUpdateOutputMs = await waitForOutputsUpdated(watchCase, baselineBeforeAdd, cliOptions, session, hotUpdateStartedAt)
  const hotUpdateEffectiveMs = await waitFor(
    async () => {
      const outputs = await readOutputs(watchCase, globalStyleOutputs)
      try {
        verifiedAddedEscapedClasses = assertClassOutputs(
          outputs,
          watchCase,
          mutationKind,
          mutation,
          verifyClassLiteralIn,
          markerAfter,
          addedClasses.addedClassTokens,
          addedClasses.addedEscapedClasses,
          minRequiredEscapedClasses,
        )
        return true
      }
      catch {
        return false
      }
    },
    {
      timeoutMs: cliOptions.timeoutMs,
      pollMs: cliOptions.pollMs,
      message: `[${watchCase.label}] ${mutationKind} added Tailwind classes were not propagated in time`,
      onTick: session.ensureRunning,
    },
    hotUpdateStartedAt,
  )

  const mtimeAfterAdd = {
    wxml: await getMtime(watchCase.outputWxml),
    js: await getMtime(watchCase.outputJs),
  }

  const rollbackStartedAt = Date.now()
  await writeFilePreserveEol(sourcePath, sourceOriginal, sourceOriginal)
  const rollbackOutputMs = await waitForOutputsUpdated(watchCase, mtimeAfterAdd, cliOptions, session, rollbackStartedAt)
  const rollbackEffectiveMs = await waitForMarkerState(
    watchCase,
    markerAfter,
    'absent',
    cliOptions,
    session,
    rollbackStartedAt,
  )

  return {
    baselineMtime: {
      wxml: await getMtime(watchCase.outputWxml),
      js: await getMtime(watchCase.outputJs),
    },
    addedClassHmr: {
      markerBefore: baseScenario.marker,
      markerAfter,
      classLiteralBefore: baseScenario.classLiteral,
      classLiteralAfter,
      addedClassLiteral,
      addedClassTokens: addedClasses.addedClassTokens,
      addedEscapedClasses: addedClasses.addedEscapedClasses,
      verifiedAddedEscapedClasses,
      minRequiredEscapedClasses,
      hotUpdateOutputMs,
      hotUpdateEffectiveMs,
      rollbackOutputMs,
      rollbackEffectiveMs,
    },
  }
}
