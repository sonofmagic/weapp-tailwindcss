import type {
  ClassMutationConfig,
  ClassMutationKind,
  CliOptions,
  MainStyleHotUpdateMetrics,
  PluginProcessSample,
  WatchCase,
  WatchSession,
} from '../types'
import process from 'node:process'
import { replaceWxml } from '../../core/replace-wxml'
import { formatPath } from '../cli'
import {
  assertContainsOneOf,
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
  waitForOutputFilesUpdated,
} from './shared'

const FROM_CLASS_TOKEN = 'text-[102.43rpx]'
const TO_CLASS_TOKEN = 'text-[103.43rpx]'
const CLASS_LITERAL = `${FROM_CLASS_TOKEN} font-bold`
const LABEL = `${FROM_CLASS_TOKEN} to ${TO_CLASS_TOKEN}`

interface MainStyleOutputs {
  wxml: string
  js: string
  globalStyle: string
}

async function collectOutputMtimes(files: string[]) {
  const resolvedFiles = await expandOutputFileEntries(files)
  const entries = await Promise.all(
    resolvedFiles.map(async file => [file, await getMtime(file)] as const),
  )
  return new Map(entries)
}

async function loadOutputs(watchCase: WatchCase, globalStyleOutputs: string[]): Promise<MainStyleOutputs> {
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

function createExpectedValues(classToken: string, escaped: string) {
  return [escaped, classToken]
}

function assertMainStyleOutputs(
  watchCase: WatchCase,
  mutation: ClassMutationConfig,
  phase: 'setup' | 'hot-update' | 'rollback',
  classToken: string,
  escapedClass: string,
  outputs: MainStyleOutputs,
) {
  const expectedValues = createExpectedValues(classToken, escapedClass)

  if (mutation.verifyEscapedIn.includes('wxml')) {
    assertContainsOneOf(outputs.wxml, expectedValues, `[${watchCase.label}] main-style ${phase} wxml`)
  }
  if (mutation.verifyEscapedIn.includes('js')) {
    assertContainsOneOf(outputs.js, expectedValues, `[${watchCase.label}] main-style ${phase} js`)
  }

  if (!outputs.globalStyle.includes(escapedClass)) {
    throw new Error(
      `[${watchCase.label}] main-style ${phase} global style output is missing transformed class: ${escapedClass}`,
    )
  }

  return [escapedClass]
}

export async function runMainStyleHotUpdate(
  watchCase: WatchCase,
  options: CliOptions,
  session: WatchSession,
  mutationKind: ClassMutationKind,
  mutation: ClassMutationConfig,
  sourceOriginal: string,
  globalStyleOutputs: string[],
): Promise<MainStyleHotUpdateMetrics> {
  await waitForClassOutputBaseline(watchCase, options, session, 'template', globalStyleOutputs)

  const marker = `tw-watch-main-style-${watchCase.name}`
  const fromEscapedClass = replaceWxml(FROM_CLASS_TOKEN)
  const toEscapedClass = replaceWxml(TO_CLASS_TOKEN)
  const sourcePath = mutation.sourceFile
  const setupSource = mutation.mutate(sourceOriginal, {
    marker,
    classLiteral: CLASS_LITERAL,
    classVariableName: '__twMainStyleClass',
  })
  if (setupSource === sourceOriginal) {
    throw new Error(`[${watchCase.label}] main-style setup produced no source change`)
  }

  const hotUpdateSource = setupSource.replaceAll(FROM_CLASS_TOKEN, TO_CLASS_TOKEN)
  if (hotUpdateSource === setupSource) {
    throw new Error(`[${watchCase.label}] main-style hot update produced no source change`)
  }

  const outputFiles = [watchCase.outputWxml, watchCase.outputJs, ...globalStyleOutputs]
  const setupBaselineMtimes = await collectOutputMtimes(outputFiles)
  const setupStartedAt = Date.now()
  process.stdout.write(
    `[watch-hmr] ${watchCase.label} main-style=${LABEL} carrier=${mutationKind} phase=setup dirty=${formatPath(sourcePath)} token=${FROM_CLASS_TOKEN}\n`,
  )
  await writeFilePreserveEol(sourcePath, setupSource, sourceOriginal)
  await waitForOutputFilesUpdated(
    watchCase,
    outputFiles,
    setupBaselineMtimes,
    options,
    session,
    setupStartedAt,
    async () => {
      const outputs = await loadOutputs(watchCase, globalStyleOutputs)
      assertMainStyleOutputs(watchCase, mutation, 'setup', FROM_CLASS_TOKEN, fromEscapedClass, outputs)
      return true
    },
  )
  await waitForCompileSettled(watchCase, options, session, setupStartedAt)

  let verifiedGlobalStyleEscapedClasses: string[] = []
  let rollbackVerifiedGlobalStyleRemovedClasses: string[] = []
  const hotUpdateBaselineMtimes = await collectOutputMtimes(outputFiles)
  const hotUpdateStartedAt = Date.now()
  process.stdout.write(
    `[watch-hmr] ${watchCase.label} main-style=${LABEL} carrier=${mutationKind} phase=hot-update dirty=${formatPath(sourcePath)} token=${TO_CLASS_TOKEN}\n`,
  )
  await writeFilePreserveEol(sourcePath, hotUpdateSource, sourceOriginal)
  const hotUpdateOutputMs = await waitForOutputFilesUpdated(
    watchCase,
    outputFiles,
    hotUpdateBaselineMtimes,
    options,
    session,
    hotUpdateStartedAt,
    async () => {
      const outputs = await loadOutputs(watchCase, globalStyleOutputs)
      verifiedGlobalStyleEscapedClasses = assertMainStyleOutputs(watchCase, mutation, 'hot-update', TO_CLASS_TOKEN, toEscapedClass, outputs)
      return true
    },
  )
  const hotUpdateEffectiveMs = hotUpdateOutputMs
  await waitForCompileSettled(watchCase, options, session, hotUpdateStartedAt)
  const hotUpdatePluginMetrics = collectPluginProcessMetrics(session, hotUpdateStartedAt)

  const rollbackBaselineMtimes = await collectOutputMtimes(outputFiles)
  const rollbackStartedAt = Date.now()
  process.stdout.write(
    `[watch-hmr] ${watchCase.label} main-style=${LABEL} carrier=${mutationKind} phase=rollback dirty=${formatPath(sourcePath)} token=${FROM_CLASS_TOKEN}\n`,
  )
  await writeFilePreserveEol(sourcePath, sourceOriginal, sourceOriginal)
  const rollbackOutputMs = await waitForOutputFilesUpdated(
    watchCase,
    outputFiles,
    rollbackBaselineMtimes,
    options,
    session,
    rollbackStartedAt,
    async () => {
      const outputs = await loadOutputs(watchCase, globalStyleOutputs)
      const sourceOriginalHasFromClass = sourceOriginal.includes(FROM_CLASS_TOKEN)
      const removedEscapedClasses = sourceOriginalHasFromClass
        ? [toEscapedClass]
        : [fromEscapedClass, toEscapedClass]
      const removedFromCodeOutputs = !outputs.wxml.includes(marker) && !outputs.js.includes(marker)
      if (removedFromCodeOutputs) {
        rollbackVerifiedGlobalStyleRemovedClasses = removedEscapedClasses.filter(escapedClass => !outputs.globalStyle.includes(escapedClass))
        return true
      }
      return false
    },
  )
  const rollbackEffectiveMs = rollbackOutputMs
  await waitForCompileSettled(watchCase, options, session, rollbackStartedAt)
  const rollbackPluginMetrics = collectPluginProcessMetrics(session, rollbackStartedAt)

  return {
    label: LABEL,
    mutationKind,
    sourceFile: sourcePath,
    verifyEscapedIn: mutation.verifyEscapedIn,
    verifyClassLiteralIn: mutation.verifyClassLiteralIn ?? [],
    fromClassToken: FROM_CLASS_TOKEN,
    toClassToken: TO_CLASS_TOKEN,
    fromEscapedClass,
    toEscapedClass,
    verifiedGlobalStyleEscapedClasses,
    minRequiredGlobalStyleEscapedClasses: 1,
    rollbackVerifiedGlobalStyleRemovedClasses,
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
