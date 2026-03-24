import type {
  ClassMutationConfig,
  ClassMutationMetrics,
  CliOptions,
  CommentCarrierHmrMetrics,
  MutationRoundConfig,
  MutationRoundMetrics,
  SameClassLiteralHmrMetrics,
  WatchCase,
  WatchSession,
} from '../types'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { replaceWxml } from '../../../src/wxml/shared'
import { formatPath } from '../cli'
import {
  assertContains,
  assertContainsOneOf,
  assertNotContains,
  getMtime,
  readFileIfExists,
  readFileWithRetry,
  waitFor,
  writeFilePreserveEol,
} from '../text'
import { runCommentCarrierMutation } from './class/comment-carrier'
import { runSameClassLiteralMutation } from './class/same-literal'
import {
  buildRoundComparison,
  createClassMutationScenario,
  expandOutputFileEntries,
  readJoinedOutputFiles,
  resolvePreferredRound,
  waitForCompileSettled,
  waitForMarkerState,
  waitForOutputFilesUpdated,
  waitForOutputsUpdated,
} from './shared'
import {
  ISSUE33_MODIFY_CLASS_TOKENS,
  resolveMutationRoundConfigs,
} from './tokens'

const ISSUE33_ROUND_NAME = 'issue33-arbitrary' as const
const BG_HEX_TOKEN_RE = /^bg-\[#([0-9a-fA-F]{3,8})\]$/
const SANITIZE_PATH_SEGMENT_RE = /[^\w.-]/g
const INVALID_BG_HEX_WITH_SPACE_RE = /\bbg-\s+\[#?[0-9a-fA-F]{3,8}\]?/g
const INVALID_BG_UNTERMINATED_RE = /\bbg-\[[^\]]*$/gm
const INVALID_PX_UNTERMINATED_RE = /\bpx-\[[^\]]*$/gm
const INVALID_PX_WITH_SPACE_RE = /\bpx-\s+\[[0-9.]+px\]/g
const INVALID_BG_INNER_SPACE_RE = /\bbg-\[[^\]\s]*\s[^\]\s]*\]/g
const INVALID_PX_INNER_SPACE_RE = /\bpx-\[[^\]\s]*\s[^\]\s]*\]/g

interface RoundOutputs {
  wxml: string
  js: string
  globalStyle: string
}

function collectBgHexTruncationNeedles(classTokens: string[]) {
  const needles: string[] = []
  for (const token of classTokens) {
    const matched = token.match(BG_HEX_TOKEN_RE)
    if (!matched) {
      continue
    }
    needles.push(`bg- ${matched[1]}`)
  }
  return needles
}

function isIssue33Round(roundConfig: MutationRoundConfig) {
  return roundConfig.name === ISSUE33_ROUND_NAME
}

function shouldPersistIssue33Snapshot() {
  return process.env.E2E_WATCH_SAVE_SNAPSHOTS === '1'
    || process.env.E2E_WATCH_ROUND_PROFILE === 'issue33'
}

function sanitizePathSegment(value: string) {
  return value.replace(SANITIZE_PATH_SEGMENT_RE, '-')
}

function asErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function resolveIssue33SnapshotDir(
  watchCase: WatchCase,
  mutationKind: 'template' | 'script',
  phase: 'add' | 'modify' | 'delete',
  stage: 'success' | 'failure',
) {
  const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
  const dirName = `${timestamp}-${sanitizePathSegment(watchCase.name)}-${mutationKind}-${phase}-${stage}`
  return path.resolve(
    watchCase.cwd,
    '../../e2e/benchmark/e2e-watch-hmr/snapshots',
    dirName,
  )
}

function resolveIssue33FailureDir(watchCase: WatchCase) {
  return path.resolve(
    watchCase.cwd,
    '../../e2e/benchmark/e2e-watch-hmr/failures',
  )
}

async function writeIssue33FailureLog(
  watchCase: WatchCase,
  mutationKind: 'template' | 'script',
  roundName: string,
  phase: 'add' | 'modify' | 'delete',
  sourceFile: string,
  classTokens: string[],
  error: unknown,
) {
  const dir = resolveIssue33FailureDir(watchCase)
  const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
  const file = path.join(
    dir,
    `${timestamp}-${sanitizePathSegment(watchCase.name)}-${mutationKind}-${roundName}-${phase}.log`,
  )
  const message = asErrorMessage(error)
  const payload = [
    `label=${watchCase.label}`,
    `project=${watchCase.project}`,
    `mutation=${mutationKind}`,
    `round=${roundName}`,
    `phase=${phase}`,
    `source=${formatPath(sourceFile)}`,
    `tokens=${classTokens.join(' | ')}`,
    `error=${message}`,
    '',
  ].join('\n')
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(file, payload, 'utf8')
}

async function writeIssue33Snapshot(
  watchCase: WatchCase,
  mutationKind: 'template' | 'script',
  phase: 'add' | 'modify' | 'delete',
  stage: 'success' | 'failure',
  roundName: string,
  marker: string,
  outputs: RoundOutputs,
  sourceFile: string,
) {
  if (!shouldPersistIssue33Snapshot()) {
    return
  }

  const dir = resolveIssue33SnapshotDir(watchCase, mutationKind, phase, stage)
  await fs.mkdir(dir, { recursive: true })
  await Promise.all([
    fs.writeFile(path.join(dir, 'index.wxml'), outputs.wxml, 'utf8'),
    fs.writeFile(path.join(dir, 'index.js'), outputs.js, 'utf8'),
    fs.writeFile(path.join(dir, 'bundle.wxss'), outputs.globalStyle, 'utf8'),
    fs.writeFile(
      path.join(dir, 'meta.json'),
      `${JSON.stringify({
        label: watchCase.label,
        project: watchCase.project,
        mutationKind,
        roundName,
        phase,
        stage,
        marker,
        sourceFile: formatPath(sourceFile),
      }, null, 2)}\n`,
      'utf8',
    ),
  ])
}

async function loadRoundOutputs(
  watchCase: WatchCase,
  globalStyleOutputs: string[],
): Promise<RoundOutputs> {
  const [wxml, js, globalStyle] = await Promise.all([
    readFileWithRetry(watchCase.outputWxml),
    readFileWithRetry(watchCase.outputJs),
    readJoinedOutputFiles(globalStyleOutputs),
  ])
  return {
    wxml,
    js,
    globalStyle,
  }
}

async function loadRoundOutputsSafe(
  watchCase: WatchCase,
  globalStyleOutputs: string[],
): Promise<RoundOutputs> {
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

async function collectOutputMtimes(files: string[]) {
  const resolvedFiles = await expandOutputFileEntries(files)
  const entries = await Promise.all(
    resolvedFiles.map(async file => [file, await getMtime(file)] as const),
  )
  return new Map(entries)
}

async function waitForContentRoundOutputs(
  watchCase: WatchCase,
  globalStyleOutputs: string[],
  options: CliOptions,
  session: WatchSession,
  startedAt: number,
  runAssert: (outputs: RoundOutputs) => string[],
): Promise<{ effectiveMs: number, outputs: RoundOutputs, matchedEscapedClasses: string[] }> {
  let resolvedOutputs: RoundOutputs | undefined
  let matchedEscapedClasses: string[] = []

  const effectiveMs = await waitFor(
    async () => {
      const outputs = await loadRoundOutputs(watchCase, globalStyleOutputs)
      try {
        matchedEscapedClasses = runAssert(outputs)
        resolvedOutputs = outputs
        return true
      }
      catch {
        return false
      }
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] mutation=content global style output did not contain transformed classes in time`,
      onTick: session.ensureRunning,
    },
    startedAt,
  )

  if (!resolvedOutputs) {
    throw new Error(`[${watchCase.label}] mutation=content failed to resolve outputs`)
  }

  return {
    effectiveMs,
    outputs: resolvedOutputs,
    matchedEscapedClasses,
  }
}

function assertIssue33ScriptTokenHealth(
  source: string,
  watchCase: WatchCase,
  sourcePath: string,
  phase: 'add' | 'modify' | 'delete',
) {
  const invalidPatterns: Array<{ pattern: RegExp, hint: string }> = [
    { pattern: INVALID_BG_HEX_WITH_SPACE_RE, hint: 'truncated bg hex token with whitespace' },
    { pattern: INVALID_BG_UNTERMINATED_RE, hint: 'unterminated bg arbitrary token' },
    { pattern: INVALID_PX_UNTERMINATED_RE, hint: 'unterminated px arbitrary token' },
    { pattern: INVALID_PX_WITH_SPACE_RE, hint: 'broken px arbitrary token with whitespace' },
    { pattern: INVALID_BG_INNER_SPACE_RE, hint: 'unexpected whitespace inside bg arbitrary token' },
    { pattern: INVALID_PX_INNER_SPACE_RE, hint: 'unexpected whitespace inside px arbitrary token' },
  ]

  for (const { pattern, hint } of invalidPatterns) {
    const matched = source.match(pattern)
    if (matched?.length) {
      throw new Error(
        `[${watchCase.label}] mutation=script phase=${phase} issue33 token health check failed (${hint}): ${matched[0]}, source=${formatPath(sourcePath)}`,
      )
    }
  }
}

function assertRoundOutputs(
  watchCase: WatchCase,
  mutationKind: 'template' | 'script',
  sourcePath: string,
  phase: 'add' | 'modify',
  mutation: ClassMutationConfig,
  verifyClassLiteralIn: Array<'wxml' | 'js'>,
  forbidBgHexTruncationIn: Array<'wxml' | 'js'>,
  minRequiredGlobalStyleEscapedClasses: number,
  classTokens: string[],
  escapedClasses: string[],
  outputs: RoundOutputs,
) {
  for (const escaped of escapedClasses) {
    if (mutation.verifyEscapedIn.includes('wxml')) {
      assertContains(outputs.wxml, escaped, `[${watchCase.label}] mutation=${mutationKind} phase=${phase} updated wxml`)
    }
    if (mutation.verifyEscapedIn.includes('js')) {
      assertContains(outputs.js, escaped, `[${watchCase.label}] mutation=${mutationKind} phase=${phase} updated js`)
    }
  }

  for (const [index, classToken] of classTokens.entries()) {
    const escapedToken = escapedClasses[index]
    const expectedValues = escapedToken ? [classToken, escapedToken] : [classToken]

    if (verifyClassLiteralIn.includes('wxml')) {
      assertContainsOneOf(
        outputs.wxml,
        expectedValues,
        `[${watchCase.label}] mutation=${mutationKind} phase=${phase} updated wxml token literal`,
      )
    }
    if (verifyClassLiteralIn.includes('js')) {
      assertContainsOneOf(
        outputs.js,
        expectedValues,
        `[${watchCase.label}] mutation=${mutationKind} phase=${phase} updated js token literal`,
      )
    }
  }

  if (forbidBgHexTruncationIn.length > 0) {
    const truncationNeedles = collectBgHexTruncationNeedles(classTokens)
    for (const truncationNeedle of truncationNeedles) {
      if (forbidBgHexTruncationIn.includes('wxml')) {
        assertNotContains(
          outputs.wxml,
          truncationNeedle,
          `[${watchCase.label}] mutation=${mutationKind} phase=${phase} wxml should not contain truncated bg hex class`,
        )
      }
      if (forbidBgHexTruncationIn.includes('js')) {
        assertNotContains(
          outputs.js,
          truncationNeedle,
          `[${watchCase.label}] mutation=${mutationKind} phase=${phase} js should not contain truncated bg hex class`,
        )
      }
    }
  }

  const matchedGlobalEscapedClasses = escapedClasses.filter(escaped => outputs.globalStyle.includes(escaped))
  if (matchedGlobalEscapedClasses.length < minRequiredGlobalStyleEscapedClasses) {
    throw new Error(
      `[${watchCase.label}] mutation=${mutationKind} phase=${phase} global style output has insufficient transformed classes: required=${minRequiredGlobalStyleEscapedClasses}, actual=${matchedGlobalEscapedClasses.length}, source=${formatPath(sourcePath)}`,
    )
  }

  return matchedGlobalEscapedClasses
}

function assertIssue33WxssHit(
  watchCase: WatchCase,
  sourcePath: string,
  phase: 'add' | 'modify',
  escapedClasses: string[],
  globalStyle: string,
) {
  for (const escaped of escapedClasses) {
    if (!globalStyle.includes(escaped)) {
      throw new Error(
        `[${watchCase.label}] mutation=script phase=${phase} missing escaped class in wxss outputs: ${escaped}, source=${formatPath(sourcePath)}`,
      )
    }
  }
}

export async function runClassMutation(
  watchCase: WatchCase,
  options: CliOptions,
  session: WatchSession,
  mutationKind: 'template' | 'script' | 'content',
  mutation: ClassMutationConfig,
  sourceOriginal: string,
  globalStyleOutputs: string[],
): Promise<ClassMutationMetrics> {
  const classVariableName = '__twWatchClass'
  const sourcePath = mutation.sourceFile
  const isContentMutation = mutationKind === 'content'
  const mutationOutputFiles = isContentMutation
    ? globalStyleOutputs
    : [watchCase.outputWxml, watchCase.outputJs]

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
  let baselineOutputMtimes = await collectOutputMtimes(mutationOutputFiles)

  const roundConfigs = mutation.roundConfigs ?? resolveMutationRoundConfigs()

  for (const roundConfig of roundConfigs) {
    const roundStartedAt = Date.now()
    const issue33Round = isIssue33Round(roundConfig)

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

    let effectiveMarker = marker
    let effectiveClassLiteral = classLiteral
    let effectiveClassTokens = classTokens
    let effectiveEscapedClasses = escapedClasses

    let effectiveHotUpdateOutputMs = 0
    let effectiveHotUpdateEffectiveMs = 0
    let phaseOutputs: RoundOutputs | undefined

    try {
      const hotUpdateStartedAt = Date.now()
      process.stdout.write(
        `[watch-hmr] ${watchCase.label} mutation=${mutationKind} round=${roundConfig.name} phase=add dirty=${formatPath(sourcePath)} tokens=${classTokens.join(' | ')}\n`,
      )
      await writeFilePreserveEol(sourcePath, mutatedSource, sourceOriginal)
      const hotUpdateOutputMs = isContentMutation
        ? await waitForOutputFilesUpdated(
            watchCase,
            mutationOutputFiles,
            baselineOutputMtimes,
            options,
            session,
            hotUpdateStartedAt,
          )
        : await waitForOutputsUpdated(
            watchCase,
            baselineMtime,
            options,
            session,
            hotUpdateStartedAt,
          )
      const hotUpdateEffectiveMs = isContentMutation
        ? hotUpdateOutputMs
        : await waitForMarkerState(
            watchCase,
            marker,
            'present',
            options,
            session,
            hotUpdateStartedAt,
          )

      const contentAddResult = isContentMutation
        ? await waitForContentRoundOutputs(
            watchCase,
            globalStyleOutputs,
            options,
            session,
            hotUpdateStartedAt,
            outputs => assertRoundOutputs(
              watchCase,
              mutationKind,
              sourcePath,
              'add',
              mutation,
              verifyClassLiteralIn,
              forbidBgHexTruncationIn,
              minRequiredGlobalStyleEscapedClasses,
              classTokens,
              escapedClasses,
              outputs,
            ),
          )
        : undefined
      const outputs = contentAddResult?.outputs ?? await loadRoundOutputs(watchCase, globalStyleOutputs)
      phaseOutputs = outputs
      const matchedEscapedClasses = contentAddResult?.matchedEscapedClasses ?? assertRoundOutputs(
        watchCase,
        mutationKind,
        sourcePath,
        'add',
        mutation,
        verifyClassLiteralIn,
        forbidBgHexTruncationIn,
        minRequiredGlobalStyleEscapedClasses,
        classTokens,
        escapedClasses,
        outputs,
      )

      for (const escaped of matchedEscapedClasses.slice(0, 3)) {
        verifiedGlobalEscapedClasses.add(escaped)
      }

      if (mutationKind === 'script' && issue33Round) {
        assertIssue33ScriptTokenHealth(outputs.js, watchCase, sourcePath, 'add')
        assertIssue33WxssHit(watchCase, sourcePath, 'add', escapedClasses, outputs.globalStyle)
      }

      if (issue33Round) {
        await writeIssue33Snapshot(
          watchCase,
          mutationKind,
          'add',
          'success',
          roundConfig.name,
          marker,
          outputs,
          sourcePath,
        )
      }

      effectiveHotUpdateOutputMs = hotUpdateOutputMs
      effectiveHotUpdateEffectiveMs = contentAddResult?.effectiveMs ?? hotUpdateEffectiveMs
      await waitForCompileSettled(watchCase, options, session, hotUpdateStartedAt)
    }
    catch (error) {
      if (issue33Round) {
        await writeIssue33FailureLog(
          watchCase,
          mutationKind,
          roundConfig.name,
          'add',
          sourcePath,
          classTokens,
          error,
        )
        const outputs = await loadRoundOutputsSafe(watchCase, globalStyleOutputs)
        await writeIssue33Snapshot(
          watchCase,
          mutationKind,
          'add',
          'failure',
          roundConfig.name,
          marker,
          outputs,
          sourcePath,
        )
      }
      throw new Error(
        `[${watchCase.label}] mutation=${mutationKind} round=${roundConfig.name} phase=add failed: ${asErrorMessage(error)}`,
      )
    }

    const modifyClassTokensForRound = roundConfig.buildModifyClassTokens?.(`${Date.now()}`)
      ?? (issue33Round ? [...ISSUE33_MODIFY_CLASS_TOKENS] : undefined)

    if (modifyClassTokensForRound) {
      const modifyMarker = `tw-watch-${watchCase.name}-${mutationKind}-issue33-modify-${Date.now()}`
      const modifyClassTokens = [...modifyClassTokensForRound]
      const modifyEscapedClasses = modifyClassTokens.map(token => replaceWxml(token))
      const modifyClassLiteral = modifyClassTokens.join(' ')
      const sourceForModify = mutation.mutate(sourceOriginal, {
        marker: modifyMarker,
        classLiteral: modifyClassLiteral,
        classVariableName,
      })

      if (sourceForModify === sourceOriginal) {
        throw new Error(
          `[${watchCase.label}] mutation=${mutationKind} round=${roundConfig.name} phase=modify failed: mutation produced no source change`,
        )
      }

      try {
        const baselineBeforeModify = {
          wxml: await getMtime(watchCase.outputWxml),
          js: await getMtime(watchCase.outputJs),
        }
        const baselineOutputMtimesBeforeModify = await collectOutputMtimes(mutationOutputFiles)
        const modifyStartedAt = Date.now()
        process.stdout.write(
          `[watch-hmr] ${watchCase.label} mutation=${mutationKind} round=${roundConfig.name} phase=modify dirty=${formatPath(sourcePath)} tokens=${modifyClassTokens.join(' | ')}\n`,
        )
        await writeFilePreserveEol(sourcePath, sourceForModify, sourceOriginal)
        const modifyOutputMs = isContentMutation
          ? await waitForOutputFilesUpdated(
              watchCase,
              mutationOutputFiles,
              baselineOutputMtimesBeforeModify,
              options,
              session,
              modifyStartedAt,
            )
          : await waitForOutputsUpdated(
              watchCase,
              baselineBeforeModify,
              options,
              session,
              modifyStartedAt,
            )
        const modifyEffectiveMs = isContentMutation
          ? modifyOutputMs
          : await waitForMarkerState(
              watchCase,
              modifyMarker,
              'present',
              options,
              session,
              modifyStartedAt,
            )

        const contentModifyResult = isContentMutation
          ? await waitForContentRoundOutputs(
              watchCase,
              globalStyleOutputs,
              options,
              session,
              modifyStartedAt,
              outputs => assertRoundOutputs(
                watchCase,
                mutationKind,
                sourcePath,
                'modify',
                mutation,
                verifyClassLiteralIn,
                forbidBgHexTruncationIn,
                minRequiredGlobalStyleEscapedClasses,
                modifyClassTokens,
                modifyEscapedClasses,
                outputs,
              ),
            )
          : undefined
        const outputs = contentModifyResult?.outputs ?? await loadRoundOutputs(watchCase, globalStyleOutputs)
        phaseOutputs = outputs
        const matchedEscapedClasses = contentModifyResult?.matchedEscapedClasses ?? assertRoundOutputs(
          watchCase,
          mutationKind,
          sourcePath,
          'modify',
          mutation,
          verifyClassLiteralIn,
          forbidBgHexTruncationIn,
          minRequiredGlobalStyleEscapedClasses,
          modifyClassTokens,
          modifyEscapedClasses,
          outputs,
        )

        for (const escaped of matchedEscapedClasses.slice(0, 3)) {
          verifiedGlobalEscapedClasses.add(escaped)
        }

        if (mutationKind === 'script' && issue33Round) {
          assertIssue33ScriptTokenHealth(outputs.js, watchCase, sourcePath, 'modify')
          assertIssue33WxssHit(watchCase, sourcePath, 'modify', modifyEscapedClasses, outputs.globalStyle)
        }

        if (issue33Round) {
          await writeIssue33Snapshot(
            watchCase,
            mutationKind,
            'modify',
            'success',
            roundConfig.name,
            modifyMarker,
            outputs,
            sourcePath,
          )
        }

        effectiveMarker = modifyMarker
        effectiveClassLiteral = modifyClassLiteral
        effectiveClassTokens = modifyClassTokens
        effectiveEscapedClasses = modifyEscapedClasses
        effectiveHotUpdateOutputMs = modifyOutputMs
        effectiveHotUpdateEffectiveMs = contentModifyResult?.effectiveMs ?? modifyEffectiveMs
        await waitForCompileSettled(watchCase, options, session, modifyStartedAt)
      }
      catch (error) {
        if (issue33Round) {
          await writeIssue33FailureLog(
            watchCase,
            mutationKind,
            roundConfig.name,
            'modify',
            sourcePath,
            modifyClassTokens,
            error,
          )
          const outputs = await loadRoundOutputsSafe(watchCase, globalStyleOutputs)
          await writeIssue33Snapshot(
            watchCase,
            mutationKind,
            'modify',
            'failure',
            roundConfig.name,
            modifyMarker,
            outputs,
            sourcePath,
          )
        }
        throw new Error(
          `[${watchCase.label}] mutation=${mutationKind} round=${roundConfig.name} phase=modify failed: ${asErrorMessage(error)}`,
        )
      }
    }

    let rollbackOutputMs = 0
    let rollbackEffectiveMs = 0
    try {
      const updatedMtime = {
        wxml: await getMtime(watchCase.outputWxml),
        js: await getMtime(watchCase.outputJs),
      }
      const updatedOutputMtimes = await collectOutputMtimes(mutationOutputFiles)
      const rollbackStartedAt = Date.now()
      process.stdout.write(
        `[watch-hmr] ${watchCase.label} mutation=${mutationKind} round=${roundConfig.name} phase=delete dirty=${formatPath(sourcePath)}\n`,
      )
      await writeFilePreserveEol(sourcePath, sourceOriginal, sourceOriginal)
      rollbackOutputMs = isContentMutation
        ? await waitFor(
            async () => {
              const resolvedMutationOutputFiles = await expandOutputFileEntries(mutationOutputFiles)
              for (const file of resolvedMutationOutputFiles) {
                const baselineMtime = updatedOutputMtimes.get(file) ?? 0
                const currentMtime = await getMtime(file)
                if (baselineMtime === 0 || currentMtime > baselineMtime) {
                  return true
                }
              }
              const outputs = await loadRoundOutputs(watchCase, globalStyleOutputs)
              return effectiveEscapedClasses.every(escaped => !outputs.js.includes(escaped))
            },
            {
              timeoutMs: options.timeoutMs,
              pollMs: options.pollMs,
              message: `[${watchCase.label}] output files were not updated after source change: ${mutationOutputFiles.map(formatPath).join(', ')}`,
              onTick: session.ensureRunning,
            },
            rollbackStartedAt,
          )
        : await waitForOutputsUpdated(
            watchCase,
            updatedMtime,
            options,
            session,
            rollbackStartedAt,
          )
      rollbackEffectiveMs = isContentMutation
        ? rollbackOutputMs
        : await waitForMarkerState(
            watchCase,
            effectiveMarker,
            'absent',
            options,
            session,
            rollbackStartedAt,
          )

      if (issue33Round) {
        const outputs = await loadRoundOutputs(watchCase, globalStyleOutputs)
        await writeIssue33Snapshot(
          watchCase,
          mutationKind,
          'delete',
          'success',
          roundConfig.name,
          effectiveMarker,
          outputs,
          sourcePath,
        )
      }
      await waitForCompileSettled(watchCase, options, session, rollbackStartedAt)
    }
    catch (error) {
      if (issue33Round) {
        await writeIssue33FailureLog(
          watchCase,
          mutationKind,
          roundConfig.name,
          'delete',
          sourcePath,
          effectiveClassTokens,
          error,
        )
        const outputs = await loadRoundOutputsSafe(watchCase, globalStyleOutputs)
        await writeIssue33Snapshot(
          watchCase,
          mutationKind,
          'delete',
          'failure',
          roundConfig.name,
          effectiveMarker,
          outputs,
          sourcePath,
        )
      }
      throw new Error(
        `[${watchCase.label}] mutation=${mutationKind} round=${roundConfig.name} phase=delete failed: ${asErrorMessage(error)}`,
      )
    }

    roundMetrics.push({
      roundName: roundConfig.name,
      marker: effectiveMarker,
      classLiteral: effectiveClassLiteral,
      classTokens: effectiveClassTokens,
      escapedClasses: effectiveEscapedClasses,
      hotUpdateOutputMs: effectiveHotUpdateOutputMs,
      hotUpdateEffectiveMs: effectiveHotUpdateEffectiveMs,
      rollbackOutputMs,
      rollbackEffectiveMs,
      totalMs: Date.now() - roundStartedAt,
    })

    process.stdout.write(
      `[watch-hmr] ${watchCase.label} mutation=${mutationKind} round=${roundConfig.name} passed (hotUpdate=${effectiveHotUpdateEffectiveMs}ms, rollback=${rollbackEffectiveMs}ms)\n`,
    )

    baselineMtime = {
      wxml: await getMtime(watchCase.outputWxml),
      js: await getMtime(watchCase.outputJs),
    }
    baselineOutputMtimes = await collectOutputMtimes(mutationOutputFiles)

    if (!phaseOutputs) {
      process.stdout.write(
        `[watch-hmr] ${watchCase.label} mutation=${mutationKind} round=${roundConfig.name} produced no output snapshot in memory\n`,
      )
    }
  }

  const preferredRound = resolvePreferredRound(roundMetrics)

  if (!preferredRound) {
    throw new Error(`[${watchCase.label}] no round metrics produced for mutation=${mutationKind}`)
  }

  let sameClassLiteralHmr: SameClassLiteralHmrMetrics | undefined
  let commentCarrierHmr: CommentCarrierHmrMetrics | undefined
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

    if (mutation.mutateCommentCarrier) {
      const commentCarrierResult = await runCommentCarrierMutation({
        watchCase,
        options,
        session,
        mutation,
        sourceOriginal,
        sourcePath,
        classVariableName,
        globalStyleOutputs,
        minRequiredGlobalStyleEscapedClasses,
        roundConfig: roundConfigs[0],
        baselineMtime,
      })
      baselineMtime = commentCarrierResult.baselineMtime
      commentCarrierHmr = commentCarrierResult.commentCarrierHmr
    }
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
    verifiedGlobalStyleEscapedClasses: [...verifiedGlobalEscapedClasses],
    hotUpdateOutputMs: preferredRound.hotUpdateOutputMs,
    hotUpdateEffectiveMs: preferredRound.hotUpdateEffectiveMs,
    rollbackOutputMs: preferredRound.rollbackOutputMs,
    rollbackEffectiveMs: preferredRound.rollbackEffectiveMs,
    sameClassLiteralHmr,
    commentCarrierHmr,
  }
}
