import type { CliOptions, StyleMutationConfig, StyleMutationMetrics, WatchCase, WatchSession } from '../types'
import { promises as fs } from 'node:fs'
import process from 'node:process'
import { formatPath } from '../cli'
import {
  assertContains,
  findCssRuleBodies,
  getMtime,
  normalizeCssDeclaration,
  readFileIfExists,
  waitFor,
  writeFilePreserveEol,
} from '../text'
import { collectPluginProcessMetrics, createStyleMutationPayload, expandOutputFileEntries, waitForCompileSettled } from './shared'

export async function runStyleMutation(
  watchCase: WatchCase,
  options: CliOptions,
  session: WatchSession,
  styleMutation: StyleMutationConfig,
  sourceOriginal: string,
  outputStyleCandidates: string[],
): Promise<StyleMutationMetrics> {
  const payload = createStyleMutationPayload(watchCase)
  const sourcePath = styleMutation.sourceFile
  const mutatedSource = styleMutation.mutate(sourceOriginal, payload)
  const verifyOutputCandidates = styleMutation.verifyOutputCandidates ?? outputStyleCandidates
  const validateApply = styleMutation.validateApply !== false
  const validateFunction = styleMutation.validateFunction !== false
  const outputNeedles = styleMutation.outputNeedles?.(payload) ?? payload.outputNeedles
  const rollbackNeedles = styleMutation.rollbackNeedles?.(payload) ?? payload.rollbackNeedles
  const hasExpectedStyleRule = (content: string) => findCssRuleBodies(content, payload.styleNeedle).length > 0
  const hasExpectedOutput = (content: string) =>
    outputNeedles.every(needle => content.includes(needle)) && hasExpectedStyleRule(content)

  if (mutatedSource === sourceOriginal) {
    throw new Error(`[${watchCase.label}] style mutation produced no source change`)
  }
  if (outputNeedles.length === 0) {
    throw new Error(`[${watchCase.label}] style mutation requires at least one output needle`)
  }

  const collectOutputCandidateMtimes = async () => {
    const resolvedCandidates = await expandOutputFileEntries(verifyOutputCandidates)
    const targetCandidates = resolvedCandidates.length > 0 ? resolvedCandidates : verifyOutputCandidates
    const entries = await Promise.all(targetCandidates.map(async candidate => [candidate, await getMtime(candidate)] as const))
    return new Map(entries)
  }

  const waitForOutputCandidateMtimeChanged = async (
    baselineMtimes: Map<string, number>,
    startedAt: number,
    phase: 'hot-update' | 'rollback',
    acceptWhen?: (candidate: string) => Promise<boolean>,
  ) => {
    return waitFor(
      async () => {
        const resolvedCandidates = await expandOutputFileEntries(verifyOutputCandidates)
        const targetCandidates = resolvedCandidates.length > 0 ? resolvedCandidates : verifyOutputCandidates
        for (const candidate of targetCandidates) {
          const baselineMtime = baselineMtimes.get(candidate) ?? 0
          const currentMtime = await getMtime(candidate)
          if (currentMtime > baselineMtime) {
            return true
          }
          if (acceptWhen && await acceptWhen(candidate)) {
            return true
          }
        }
        return false
      },
      {
        timeoutMs: options.timeoutMs,
        pollMs: options.pollMs,
        message: `[${watchCase.label}] style output candidates were not updated during ${phase}: ${verifyOutputCandidates.map(formatPath).join(', ')}`,
        onTick: session.ensureRunning,
      },
      startedAt,
    )
  }

  const baselineOutputCandidateMtimes = await collectOutputCandidateMtimes()
  const hotUpdateStartedAt = Date.now()
  await writeFilePreserveEol(sourcePath, mutatedSource, sourceOriginal)
  const hotUpdateOutputMs = await waitForOutputCandidateMtimeChanged(
    baselineOutputCandidateMtimes,
    hotUpdateStartedAt,
    'hot-update',
    async (candidate) => {
      const content = await readFileIfExists(candidate)
      return content != null && hasExpectedOutput(content)
    },
  )
  let resolvedOutputStyle: string | undefined
  const hotUpdateEffectiveMs = await waitFor(
    async () => {
      const resolvedCandidates = await expandOutputFileEntries(verifyOutputCandidates)
      const targetCandidates = resolvedCandidates.length > 0 ? resolvedCandidates : verifyOutputCandidates
      for (const candidate of targetCandidates) {
        const content = await readFileIfExists(candidate)
        if (content != null && hasExpectedOutput(content)) {
          resolvedOutputStyle = candidate
          return true
        }
      }
      return false
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] style output candidates are missing needles ${outputNeedles.join(', ')}: ${verifyOutputCandidates.map(formatPath).join(', ')}`,
      onTick: session.ensureRunning,
    },
    hotUpdateStartedAt,
  )

  if (!resolvedOutputStyle) {
    throw new Error(`[${watchCase.label}] failed to resolve style output after mutation`)
  }
  const hotUpdatePluginMetrics = collectPluginProcessMetrics(session, hotUpdateStartedAt)

  const updatedStyle = await fs.readFile(resolvedOutputStyle, 'utf8')
  for (const needle of outputNeedles) {
    assertContains(updatedStyle, needle, `[${watchCase.label}] updated style output (${formatPath(resolvedOutputStyle)})`)
  }
  if (validateApply && payload.expectedApplyDeclarations.length > 0) {
    const updatedRuleBodies = findCssRuleBodies(updatedStyle, payload.styleNeedle)
    if (updatedRuleBodies.length === 0) {
      throw new Error(`[${watchCase.label}] failed to locate style rule body for ${payload.styleNeedle}`)
    }
    for (const expectedDeclaration of payload.expectedApplyDeclarations) {
      const normalizedExpectedDeclaration = normalizeCssDeclaration(expectedDeclaration)
      if (!updatedRuleBodies.some(ruleBody => normalizeCssDeclaration(ruleBody).includes(normalizedExpectedDeclaration))) {
        throw new Error(
          `[${watchCase.label}] style @apply declaration missing: ${expectedDeclaration}, rule=${payload.styleNeedle}`,
        )
      }
    }
    for (const expectedDeclarationGroup of payload.expectedApplyDeclarationGroups) {
      if (!expectedDeclarationGroup.some((expectedDeclaration) => {
        const normalizedExpectedDeclaration = normalizeCssDeclaration(expectedDeclaration)
        return updatedRuleBodies.some(ruleBody => normalizeCssDeclaration(ruleBody).includes(normalizedExpectedDeclaration))
      })) {
        throw new Error(
          `[${watchCase.label}] style @apply declaration group missing: ${expectedDeclarationGroup.join(' or ')}, rule=${payload.styleNeedle}`,
        )
      }
    }
  }
  if (validateFunction && payload.functionNeedle && payload.expectedFunctionDeclarations.length > 0) {
    const updatedFunctionRuleBodies = findCssRuleBodies(updatedStyle, payload.functionNeedle)
    if (updatedFunctionRuleBodies.length === 0) {
      throw new Error(`[${watchCase.label}] failed to locate Tailwind function rule body for ${payload.functionNeedle}`)
    }
    for (const forbiddenFragment of payload.forbiddenFunctionFragments) {
      if (updatedFunctionRuleBodies.every(ruleBody => ruleBody.includes(forbiddenFragment))) {
        throw new Error(
          `[${watchCase.label}] style Tailwind function was not resolved: ${forbiddenFragment}, rule=${payload.functionNeedle}`,
        )
      }
    }
    for (const expectedDeclaration of payload.expectedFunctionDeclarations) {
      const normalizedExpectedDeclaration = normalizeCssDeclaration(expectedDeclaration)
      if (!updatedFunctionRuleBodies.some(ruleBody => normalizeCssDeclaration(ruleBody).includes(normalizedExpectedDeclaration))) {
        throw new Error(
          `[${watchCase.label}] style Tailwind function declaration missing: ${expectedDeclaration}, rule=${payload.functionNeedle}`,
        )
      }
    }
  }

  const outputCandidateMtimesAfterHotUpdate = await collectOutputCandidateMtimes()
  const rollbackStartedAt = Date.now()
  await writeFilePreserveEol(sourcePath, sourceOriginal, sourceOriginal)
  const rollbackOutputMs = await waitForOutputCandidateMtimeChanged(
    outputCandidateMtimesAfterHotUpdate,
    rollbackStartedAt,
    'rollback',
    async (candidate) => {
      const content = await readFileIfExists(candidate)
      return content != null && rollbackNeedles.every(needle => !content.includes(needle))
    },
  )
  let rollbackEffectiveMs = rollbackOutputMs
  let rollbackNeedleCleared = false
  const rollbackNeedleCheckTimeoutMs = Math.min(options.timeoutMs, 30_000)
  try {
    process.stdout.write(
      `[watch-hmr] ${watchCase.label} mutation=style waiting rollback marker clear (timeout=${rollbackNeedleCheckTimeoutMs}ms)\n`,
    )
    rollbackEffectiveMs = await waitFor(
      async () => {
        const resolvedCandidates = await expandOutputFileEntries(verifyOutputCandidates)
        const targetCandidates = resolvedCandidates.length > 0 ? resolvedCandidates : verifyOutputCandidates
        for (const candidate of targetCandidates) {
          const content = await readFileIfExists(candidate)
          if (content != null && rollbackNeedles.some(needle => content.includes(needle))) {
            return false
          }
        }
        return true
      },
      {
        timeoutMs: rollbackNeedleCheckTimeoutMs,
        pollMs: options.pollMs,
        message: `[${watchCase.label}] style output candidates still contain rollback needles ${rollbackNeedles.join(', ')}: ${verifyOutputCandidates.map(formatPath).join(', ')}`,
        onTick: session.ensureRunning,
      },
      rollbackStartedAt,
    )
    rollbackNeedleCleared = true
  }
  catch {
    process.stdout.write(
      `[watch-hmr] ${watchCase.label} mutation=style rollback marker still present in candidate outputs, fallback to output latency metric\n`,
    )
  }
  await waitForCompileSettled(watchCase, options, session, rollbackStartedAt)
  const rollbackPluginMetrics = collectPluginProcessMetrics(session, rollbackStartedAt)

  process.stdout.write(
    `[watch-hmr] ${watchCase.label} mutation=style passed (hotUpdate=${hotUpdateEffectiveMs}ms, rollback=${rollbackEffectiveMs}ms)\n`,
  )

  return {
    mutationKind: 'style',
    sourceFile: sourcePath,
    outputStyle: resolvedOutputStyle,
    marker: payload.marker,
    styleNeedle: payload.styleNeedle,
    outputNeedles,
    rollbackNeedles,
    applyUtilities: payload.applyUtilities,
    expectedApplyDeclarations: payload.expectedApplyDeclarations,
    expectedApplyDeclarationGroups: payload.expectedApplyDeclarationGroups,
    ...(payload.functionNeedle ? { functionNeedle: payload.functionNeedle } : {}),
    functionDeclarations: payload.functionDeclarations,
    expectedFunctionDeclarations: payload.expectedFunctionDeclarations,
    forbiddenFunctionFragments: payload.forbiddenFunctionFragments,
    ...(payload.referenceDirective ? { referenceDirective: payload.referenceDirective } : {}),
    hotUpdateOutputMs,
    hotUpdateEffectiveMs,
    hotUpdatePluginProcessMs: hotUpdatePluginMetrics.totalMs,
    hotUpdatePluginProcessSamples: hotUpdatePluginMetrics.samples,
    rollbackOutputMs,
    rollbackEffectiveMs,
    rollbackPluginProcessMs: rollbackPluginMetrics.totalMs,
    rollbackPluginProcessSamples: rollbackPluginMetrics.samples,
    rollbackNeedleCleared,
  }
}
