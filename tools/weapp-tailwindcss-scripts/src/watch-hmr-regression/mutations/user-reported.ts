import type {
  CliOptions,
  PluginProcessSample,
  UserReportedHotUpdateConfig,
  UserReportedHotUpdateMetrics,
  WatchCase,
  WatchSession,
} from '../types'
import process from 'node:process'
import { replaceWxml } from '../../core/replace-wxml'
import { formatPath } from '../cli'
import {
  assertContainsOneOf,
  assertNotContains,
  getMtime,
  readFileIfExists,
  writeFilePreserveEol,
} from '../text'
import {
  collectPluginProcessMetrics,
  expandOutputFileEntries,
  readJoinedOutputFiles,
  waitForClassOutputBaseline,
  waitForCompileSettled,
  waitForOutputFilesUpdatedResult,
} from './shared'

interface UserReportedOutputs {
  wxml: string
  js: string
  globalStyle: string
}

function htmlEscapeClassToken(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function createClassTokenExpectedValues(classToken: string, escaped: string) {
  return [
    escaped,
    classToken,
    htmlEscapeClassToken(classToken),
  ]
}

async function collectOutputMtimes(files: string[]) {
  const resolvedFiles = await expandOutputFileEntries(files)
  const entries = await Promise.all(
    resolvedFiles.map(async file => [file, await getMtime(file)] as const),
  )
  return new Map(entries)
}

async function loadOutputs(watchCase: WatchCase, globalStyleOutputs: string[]): Promise<UserReportedOutputs> {
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

function assertUserReportedOutputs(
  watchCase: WatchCase,
  config: UserReportedHotUpdateConfig,
  phase: 'hot-update' | 'rollback',
  classTokens: string[],
  escapedClasses: string[],
  outputs: UserReportedOutputs,
) {
  const verifyClassLiteralIn = config.verifyClassLiteralIn ?? []

  for (const [index, classToken] of classTokens.entries()) {
    const escaped = escapedClasses[index]
    if (!escaped) {
      continue
    }
    const expectedValues = createClassTokenExpectedValues(classToken, escaped)
    if (config.verifyEscapedIn.includes('wxml')) {
      assertContainsOneOf(outputs.wxml, expectedValues, `[${watchCase.label}] user reported ${config.label} ${phase} wxml`)
    }
    if (config.verifyEscapedIn.includes('js')) {
      assertContainsOneOf(outputs.js, expectedValues, `[${watchCase.label}] user reported ${config.label} ${phase} js`)
    }
    if (verifyClassLiteralIn.includes('wxml')) {
      assertContainsOneOf(outputs.wxml, expectedValues, `[${watchCase.label}] user reported ${config.label} ${phase} wxml literal`)
    }
    if (verifyClassLiteralIn.includes('js')) {
      assertContainsOneOf(outputs.js, expectedValues, `[${watchCase.label}] user reported ${config.label} ${phase} js literal`)
    }
  }

  const matchedGlobalEscapedClasses = escapedClasses.filter(escaped => outputs.globalStyle.includes(escaped))
  const minRequiredGlobalStyleEscapedClasses = config.minRequiredGlobalStyleEscapedClasses ?? 1
  if (matchedGlobalEscapedClasses.length < minRequiredGlobalStyleEscapedClasses) {
    throw new Error(
      `[${watchCase.label}] user reported ${config.label} ${phase} global style output has insufficient transformed classes: required=${minRequiredGlobalStyleEscapedClasses}, actual=${matchedGlobalEscapedClasses.length}, source=${formatPath(config.sourceFile)}`,
    )
  }

  return matchedGlobalEscapedClasses
}

function resolveReplacementDirection(sourceOriginal: string, config: UserReportedHotUpdateConfig) {
  if (sourceOriginal.includes(config.before)) {
    return {
      from: config.before,
      to: config.after,
      classTokens: config.afterClassTokens,
      rollbackClassTokens: config.beforeClassTokens,
    }
  }
  if (sourceOriginal.includes(config.after)) {
    return {
      from: config.after,
      to: config.before,
      classTokens: config.beforeClassTokens,
      rollbackClassTokens: config.afterClassTokens,
    }
  }
  throw new Error(
    `user reported hot-update anchor not found: ${config.label}, source=${formatPath(config.sourceFile)}`,
  )
}

export async function runUserReportedHotUpdate(
  watchCase: WatchCase,
  options: CliOptions,
  session: WatchSession,
  config: UserReportedHotUpdateConfig,
  sourceOriginal: string,
  globalStyleOutputs: string[],
): Promise<UserReportedHotUpdateMetrics> {
  await waitForClassOutputBaseline(watchCase, options, session, 'content', globalStyleOutputs)

  const {
    from,
    to,
    classTokens,
    rollbackClassTokens,
  } = resolveReplacementDirection(sourceOriginal, config)
  const escapedClasses = classTokens.map(token => replaceWxml(token))
  const rollbackEscapedClasses = rollbackClassTokens.map(token => replaceWxml(token))
  const sourcePath = config.sourceFile
  const outputFiles = [watchCase.outputWxml, watchCase.outputJs, ...globalStyleOutputs]
  let verifiedGlobalStyleEscapedClasses: string[] = []

  const sourceForHotUpdate = sourceOriginal.replace(from, to)
  if (sourceForHotUpdate === sourceOriginal) {
    throw new Error(`[${watchCase.label}] user reported ${config.label} produced no source change`)
  }

  const baselineOutputMtimes = await collectOutputMtimes(outputFiles)
  const hotUpdateStartedAt = Date.now()
  process.stdout.write(
    `[watch-hmr] ${watchCase.label} user-reported=${config.label} phase=hot-update dirty=${formatPath(sourcePath)} tokens=${classTokens.join(' | ')}\n`,
  )
  await writeFilePreserveEol(sourcePath, sourceForHotUpdate, sourceOriginal)
  const hotUpdateResult = await waitForOutputFilesUpdatedResult(
    watchCase,
    outputFiles,
    baselineOutputMtimes,
    options,
    session,
    hotUpdateStartedAt,
    async () => {
      const outputs = await loadOutputs(watchCase, globalStyleOutputs)
      verifiedGlobalStyleEscapedClasses = assertUserReportedOutputs(
        watchCase,
        config,
        'hot-update',
        classTokens,
        escapedClasses,
        outputs,
      )
      return true
    },
  )
  const hotUpdateOutputMs = hotUpdateResult.outputMs
  const hotUpdateEffectiveMs = hotUpdateResult.semanticMs ?? hotUpdateOutputMs
  const hotUpdatePluginMetrics = collectPluginProcessMetrics(
    session,
    hotUpdateStartedAt,
    hotUpdateStartedAt + hotUpdateEffectiveMs,
  )
  await waitForCompileSettled(watchCase, options, session, hotUpdateStartedAt)

  const updatedOutputMtimes = await collectOutputMtimes(outputFiles)
  const rollbackStartedAt = Date.now()
  process.stdout.write(
    `[watch-hmr] ${watchCase.label} user-reported=${config.label} phase=rollback dirty=${formatPath(sourcePath)} tokens=${rollbackClassTokens.join(' | ')}\n`,
  )
  await writeFilePreserveEol(sourcePath, sourceOriginal, sourceOriginal)
  const rollbackResult = await waitForOutputFilesUpdatedResult(
    watchCase,
    outputFiles,
    updatedOutputMtimes,
    options,
    session,
    rollbackStartedAt,
    async () => {
      const outputs = await loadOutputs(watchCase, globalStyleOutputs)
      assertUserReportedOutputs(
        watchCase,
        config,
        'rollback',
        rollbackClassTokens,
        rollbackEscapedClasses,
        outputs,
      )
      for (const escaped of escapedClasses) {
        if (config.verifyEscapedIn.includes('wxml')) {
          assertNotContains(outputs.wxml, escaped, `[${watchCase.label}] user reported ${config.label} rollback wxml`)
        }
        if (config.verifyEscapedIn.includes('js')) {
          assertNotContains(outputs.js, escaped, `[${watchCase.label}] user reported ${config.label} rollback js`)
        }
      }
      return true
    },
  )
  const rollbackOutputMs = rollbackResult.outputMs
  const rollbackEffectiveMs = rollbackResult.semanticMs ?? rollbackOutputMs
  const rollbackPluginMetrics = collectPluginProcessMetrics(
    session,
    rollbackStartedAt,
    rollbackStartedAt + rollbackEffectiveMs,
  )
  await waitForCompileSettled(watchCase, options, session, rollbackStartedAt)

  const minRequiredGlobalStyleEscapedClasses = config.minRequiredGlobalStyleEscapedClasses ?? 1
  return {
    label: config.label,
    sourceFile: sourcePath,
    from,
    to,
    classTokens,
    escapedClasses,
    verifiedGlobalStyleEscapedClasses,
    minRequiredGlobalStyleEscapedClasses,
    hotUpdateOutputMs,
    hotUpdateEffectiveMs,
    hotUpdatePluginProcessMs: hotUpdatePluginMetrics.totalMs,
    hotUpdatePluginProcessSamples: hotUpdatePluginMetrics.samples as PluginProcessSample[],
    rollbackOutputMs,
    rollbackEffectiveMs,
    rollbackPluginProcessMs: rollbackPluginMetrics.totalMs,
    rollbackPluginProcessSamples: rollbackPluginMetrics.samples as PluginProcessSample[],
  }
}
