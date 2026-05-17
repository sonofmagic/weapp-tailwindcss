import type {
  ClassMutationConfig,
  CliOptions,
  CommentCarrierHmrMetrics,
  MutationRoundConfig,
  OutputMtime,
  WatchCase,
  WatchSession,
} from '../../types'
import { formatPath } from '../../cli'
import { getMtime, writeFilePreserveEol } from '../../text'
import {
  collectPluginProcessMetrics,
  createClassMutationScenario,
  readJoinedOutputFiles,
  waitForClassOutputBaseline,
  waitForMarkerState,
  waitForOutputsUpdated,
} from '../shared'

interface RunCommentCarrierMutationOptions {
  watchCase: WatchCase
  options: CliOptions
  session: WatchSession
  mutation: ClassMutationConfig
  sourceOriginal: string
  sourcePath: string
  classVariableName: string
  globalStyleOutputs: string[]
  minRequiredGlobalStyleEscapedClasses: number
  roundConfig: MutationRoundConfig
  baselineMtime: OutputMtime
}

export async function runCommentCarrierMutation(
  options: RunCommentCarrierMutationOptions,
): Promise<{
  baselineMtime: OutputMtime
  commentCarrierHmr: CommentCarrierHmrMetrics
}> {
  const {
    watchCase,
    options: cliOptions,
    session,
    mutation,
    sourceOriginal,
    sourcePath,
    classVariableName,
    globalStyleOutputs,
    minRequiredGlobalStyleEscapedClasses,
    roundConfig,
    baselineMtime,
  } = options

  const {
    wxml: baselineWxml,
    js: baselineJs,
    globalStyle: baselineGlobalStyle,
  } = await waitForClassOutputBaseline(
    watchCase,
    cliOptions,
    session,
    'script',
    globalStyleOutputs,
  )

  const mutateCommentCarrier = mutation.mutateCommentCarrier
  if (!mutateCommentCarrier) {
    throw new Error(`[${watchCase.label}] missing mutateCommentCarrier for script mutation`)
  }

  const scenario = createClassMutationScenario(
    watchCase,
    'script',
    {
      ...mutation,
      mutate: mutateCommentCarrier,
    },
    sourceOriginal,
    baselineWxml,
    baselineJs,
    baselineGlobalStyle,
    classVariableName,
    roundConfig,
  )

  const hotUpdateStartedAt = Date.now()
  await writeFilePreserveEol(sourcePath, scenario.mutatedSource, sourceOriginal)
  const hotUpdateOutputMs = await waitForOutputsUpdated(
    watchCase,
    baselineMtime,
    cliOptions,
    session,
    hotUpdateStartedAt,
  )
  const hotUpdateEffectiveMs = await waitForMarkerState(
    watchCase,
    scenario.marker,
    'present',
    cliOptions,
    session,
    hotUpdateStartedAt,
  )
  const hotUpdatePluginMetrics = collectPluginProcessMetrics(session, hotUpdateStartedAt)

  const updatedGlobalStyle = await readJoinedOutputFiles(globalStyleOutputs)
  const verifiedEscapedClasses = scenario.escapedClasses.filter(escaped =>
    updatedGlobalStyle.includes(escaped),
  )
  if (verifiedEscapedClasses.length < minRequiredGlobalStyleEscapedClasses) {
    throw new Error(
      `[${watchCase.label}] script comment-carrier mutation lost transformed global style classes: required=${minRequiredGlobalStyleEscapedClasses}, actual=${verifiedEscapedClasses.length}, source=${formatPath(sourcePath)}`,
    )
  }

  const updatedMtime = {
    wxml: await getMtime(watchCase.outputWxml),
    js: await getMtime(watchCase.outputJs),
  }

  const rollbackStartedAt = Date.now()
  await writeFilePreserveEol(sourcePath, sourceOriginal, sourceOriginal)
  const rollbackOutputMs = await waitForOutputsUpdated(
    watchCase,
    updatedMtime,
    cliOptions,
    session,
    rollbackStartedAt,
  )
  const rollbackEffectiveMs = await waitForMarkerState(
    watchCase,
    scenario.marker,
    'absent',
    cliOptions,
    session,
    rollbackStartedAt,
  )
  const rollbackPluginMetrics = collectPluginProcessMetrics(session, rollbackStartedAt)

  return {
    baselineMtime: {
      wxml: await getMtime(watchCase.outputWxml),
      js: await getMtime(watchCase.outputJs),
    },
    commentCarrierHmr: {
      marker: scenario.marker,
      classLiteral: scenario.classLiteral,
      escapedClasses: scenario.escapedClasses,
      verifiedEscapedClasses,
      minRequiredEscapedClasses: minRequiredGlobalStyleEscapedClasses,
      hotUpdateOutputMs,
      hotUpdateEffectiveMs,
      hotUpdatePluginProcessMs: hotUpdatePluginMetrics.totalMs,
      hotUpdatePluginProcessSamples: hotUpdatePluginMetrics.samples,
      rollbackOutputMs,
      rollbackEffectiveMs,
      rollbackPluginProcessMs: rollbackPluginMetrics.totalMs,
      rollbackPluginProcessSamples: rollbackPluginMetrics.samples,
    },
  }
}
