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
import { getMtime, readFileIfExists, writeFilePreserveEol } from '../../text'
import {
  createClassMutationScenario,
  readJoinedOutputFiles,
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

  const [baselineWxml, baselineJs, baselineGlobalStyle] = await Promise.all([
    readFileIfExists(watchCase.outputWxml),
    readFileIfExists(watchCase.outputJs),
    readJoinedOutputFiles(globalStyleOutputs),
  ])

  if (!baselineWxml || !baselineJs || !baselineGlobalStyle) {
    throw new Error(`[${watchCase.label}] missing baseline outputs for script comment-carrier mutation`)
  }

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
      rollbackOutputMs,
      rollbackEffectiveMs,
    },
  }
}
