import type {
  ClassMutationConfig,
  ClassMutationMetrics,
  CliOptions,
  MutationRoundMetrics,
  SameClassLiteralHmrMetrics,
  WatchCase,
  WatchSession,
} from '../types'
import { promises as fs } from 'node:fs'
import process from 'node:process'
import { formatPath } from '../cli'
import { assertContains, assertContainsOneOf, assertNotContains, getMtime, readFileIfExists } from '../text'
import { runSameClassLiteralMutation } from './class/same-literal'
import {
  buildRoundComparison,
  createClassMutationScenario,
  readJoinedOutputFiles,
  resolvePreferredRound,
  waitForMarkerState,
  waitForOutputsUpdated,
} from './shared'
import { resolveMutationRoundConfigs } from './tokens'

function collectBgHexTruncationNeedles(classTokens: string[]) {
  const needles: string[] = []
  for (const token of classTokens) {
    const matched = token.match(/^bg-\[#([0-9a-fA-F]{3,8})\]$/)
    if (!matched) {
      continue
    }
    needles.push(`bg- ${matched[1]}`)
  }
  return needles
}

export async function runClassMutation(
  watchCase: WatchCase,
  options: CliOptions,
  session: WatchSession,
  mutationKind: 'template' | 'script',
  mutation: ClassMutationConfig,
  sourceOriginal: string,
  globalStyleOutputs: string[],
): Promise<ClassMutationMetrics> {
  const classVariableName = '__twWatchClass'
  const sourcePath = mutation.sourceFile

  const [baselineWxml, baselineJs, baselineGlobalStyle] = await Promise.all([
    readFileIfExists(watchCase.outputWxml),
    readFileIfExists(watchCase.outputJs),
    readJoinedOutputFiles(globalStyleOutputs),
  ])

  if (!baselineWxml || !baselineJs || !baselineGlobalStyle) {
    throw new Error(`[${watchCase.label}] baseline outputs are missing for ${mutationKind}`)
  }

  const verifyClassLiteralIn = mutation.verifyClassLiteralIn ?? []
  const forbidBgHexTruncationIn = mutation.forbidBgHexTruncationIn ?? []
  const minRequiredGlobalStyleEscapedClasses = watchCase.minGlobalStyleEscapedClasses ?? 1
  const roundMetrics: MutationRoundMetrics[] = []
  const verifiedGlobalEscapedClasses = new Set<string>()
  let baselineMtime = {
    wxml: await getMtime(watchCase.outputWxml),
    js: await getMtime(watchCase.outputJs),
  }

  const roundConfigs = mutation.roundConfigs ?? resolveMutationRoundConfigs()

  for (const roundConfig of roundConfigs) {
    const roundStartedAt = Date.now()

    const mutationScenario = createClassMutationScenario(
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

    const {
      marker,
      classLiteral,
      classTokens,
      escapedClasses,
      freshEscapedClasses,
      mutatedSource,
    } = mutationScenario

    for (const escaped of freshEscapedClasses) {
      assertNotContains(baselineWxml, escaped, `[${watchCase.label}] baseline wxml`)
      assertNotContains(baselineJs, escaped, `[${watchCase.label}] baseline js`)
      assertNotContains(baselineGlobalStyle, escaped, `[${watchCase.label}] baseline global style`)
    }

    const hotUpdateStartedAt = Date.now()
    await fs.writeFile(sourcePath, mutatedSource, 'utf8')
    const hotUpdateOutputMs = await waitForOutputsUpdated(
      watchCase,
      baselineMtime,
      options,
      session,
      hotUpdateStartedAt,
    )
    const hotUpdateEffectiveMs = await waitForMarkerState(
      watchCase,
      marker,
      'present',
      options,
      session,
      hotUpdateStartedAt,
    )

    const [updatedWxml, updatedJs, updatedGlobalStyle] = await Promise.all([
      fs.readFile(watchCase.outputWxml, 'utf8'),
      fs.readFile(watchCase.outputJs, 'utf8'),
      readJoinedOutputFiles(globalStyleOutputs),
    ])

    for (const escaped of escapedClasses) {
      if (mutation.verifyEscapedIn.includes('wxml')) {
        assertContains(updatedWxml, escaped, `[${watchCase.label}] updated wxml`)
      }
      if (mutation.verifyEscapedIn.includes('js')) {
        assertContains(updatedJs, escaped, `[${watchCase.label}] updated js`)
      }
    }

    for (const [index, classToken] of classTokens.entries()) {
      const escapedToken = escapedClasses[index]
      const expectedValues = escapedToken ? [classToken, escapedToken] : [classToken]

      if (verifyClassLiteralIn.includes('wxml')) {
        assertContainsOneOf(
          updatedWxml,
          expectedValues,
          `[${watchCase.label}] updated wxml token literal`,
        )
      }
      if (verifyClassLiteralIn.includes('js')) {
        assertContainsOneOf(
          updatedJs,
          expectedValues,
          `[${watchCase.label}] updated js token literal`,
        )
      }
    }

    if (forbidBgHexTruncationIn.length > 0) {
      const truncationNeedles = collectBgHexTruncationNeedles(classTokens)
      for (const truncationNeedle of truncationNeedles) {
        if (forbidBgHexTruncationIn.includes('wxml')) {
          assertNotContains(
            updatedWxml,
            truncationNeedle,
            `[${watchCase.label}] updated wxml should not contain truncated bg hex class`,
          )
        }
        if (forbidBgHexTruncationIn.includes('js')) {
          assertNotContains(
            updatedJs,
            truncationNeedle,
            `[${watchCase.label}] updated js should not contain truncated bg hex class`,
          )
        }
      }
    }

    const matchedGlobalEscapedClasses = freshEscapedClasses.filter(escaped => updatedGlobalStyle.includes(escaped))
    if (matchedGlobalEscapedClasses.length < minRequiredGlobalStyleEscapedClasses) {
      throw new Error(
        `[${watchCase.label}] global style output has insufficient transformed classes: required=${minRequiredGlobalStyleEscapedClasses}, actual=${matchedGlobalEscapedClasses.length}, source=${formatPath(sourcePath)}`,
      )
    }

    for (const escaped of matchedGlobalEscapedClasses.slice(0, 3)) {
      verifiedGlobalEscapedClasses.add(escaped)
    }

    const updatedMtime = {
      wxml: await getMtime(watchCase.outputWxml),
      js: await getMtime(watchCase.outputJs),
    }

    const rollbackStartedAt = Date.now()
    await fs.writeFile(sourcePath, sourceOriginal, 'utf8')
    const rollbackOutputMs = await waitForOutputsUpdated(
      watchCase,
      updatedMtime,
      options,
      session,
      rollbackStartedAt,
    )
    const rollbackEffectiveMs = await waitForMarkerState(
      watchCase,
      marker,
      'absent',
      options,
      session,
      rollbackStartedAt,
    )

    roundMetrics.push({
      roundName: roundConfig.name,
      marker,
      classLiteral,
      classTokens,
      escapedClasses,
      hotUpdateOutputMs,
      hotUpdateEffectiveMs,
      rollbackOutputMs,
      rollbackEffectiveMs,
      totalMs: Date.now() - roundStartedAt,
    })

    process.stdout.write(
      `[watch-hmr] ${watchCase.label} mutation=${mutationKind} round=${roundConfig.name} passed (hotUpdate=${hotUpdateEffectiveMs}ms, rollback=${rollbackEffectiveMs}ms)\n`,
    )

    baselineMtime = {
      wxml: await getMtime(watchCase.outputWxml),
      js: await getMtime(watchCase.outputJs),
    }
  }

  const preferredRound = resolvePreferredRound(roundMetrics)

  if (!preferredRound) {
    throw new Error(`[${watchCase.label}] no round metrics produced for mutation=${mutationKind}`)
  }

  let sameClassLiteralHmr: SameClassLiteralHmrMetrics | undefined
  if (mutationKind === 'script') {
    const result = await runSameClassLiteralMutation({
      watchCase,
      options,
      session,
      mutation,
      sourceOriginal,
      sourcePath,
      classVariableName,
      globalStyleOutputs,
      minRequiredGlobalStyleEscapedClasses,
      preferredRound: {
        classLiteral: preferredRound.classLiteral,
        escapedClasses: preferredRound.escapedClasses,
      },
      baselineMtime,
    })
    baselineMtime = result.baselineMtime
    sameClassLiteralHmr = result.sameClassLiteralHmr
  }

  return {
    mutationKind,
    sourceFile: sourcePath,
    marker: preferredRound.marker,
    classLiteral: preferredRound.classLiteral,
    classTokens: preferredRound.classTokens,
    escapedClasses: preferredRound.escapedClasses,
    rounds: roundMetrics,
    roundComparison: buildRoundComparison(roundMetrics),
    verifyEscapedIn: mutation.verifyEscapedIn,
    verifyClassLiteralIn,
    globalStyleOutputs,
    minRequiredGlobalStyleEscapedClasses,
    verifiedGlobalStyleEscapedClasses: Array.from(verifiedGlobalEscapedClasses),
    hotUpdateOutputMs: preferredRound.hotUpdateOutputMs,
    hotUpdateEffectiveMs: preferredRound.hotUpdateEffectiveMs,
    rollbackOutputMs: preferredRound.rollbackOutputMs,
    rollbackEffectiveMs: preferredRound.rollbackEffectiveMs,
    sameClassLiteralHmr,
  }
}
