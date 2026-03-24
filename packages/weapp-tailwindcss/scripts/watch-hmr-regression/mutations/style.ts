import type { CliOptions, StyleMutationConfig, StyleMutationMetrics, WatchCase, WatchSession } from '../types'
import { promises as fs } from 'node:fs'
import process from 'node:process'
import { formatPath } from '../cli'
import {
  assertContains,
  findCssRuleBody,
  getMtime,
  normalizeCssDeclaration,
  readFileIfExists,
  waitFor,
  writeFilePreserveEol,
} from '../text'
import { createStyleMutationPayload, expandOutputFileEntries } from './shared'

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

  if (mutatedSource === sourceOriginal) {
    throw new Error(`[${watchCase.label}] style mutation produced no source change`)
  }

  const collectOutputCandidateMtimes = async () => {
    const resolvedCandidates = await expandOutputFileEntries(outputStyleCandidates)
    const targetCandidates = resolvedCandidates.length > 0 ? resolvedCandidates : outputStyleCandidates
    const entries = await Promise.all(targetCandidates.map(async candidate => [candidate, await getMtime(candidate)] as const))
    return new Map(entries)
  }

  const waitForOutputCandidateMtimeChanged = async (
    baselineMtimes: Map<string, number>,
    startedAt: number,
    phase: 'hot-update' | 'rollback',
  ) => {
    return waitFor(
      async () => {
        const resolvedCandidates = await expandOutputFileEntries(outputStyleCandidates)
        const targetCandidates = resolvedCandidates.length > 0 ? resolvedCandidates : outputStyleCandidates
        for (const candidate of targetCandidates) {
          const baselineMtime = baselineMtimes.get(candidate) ?? 0
          const currentMtime = await getMtime(candidate)
          if (currentMtime > baselineMtime) {
            return true
          }
        }
        return false
      },
      {
        timeoutMs: options.timeoutMs,
        pollMs: options.pollMs,
        message: `[${watchCase.label}] style output candidates were not updated during ${phase}: ${outputStyleCandidates.map(formatPath).join(', ')}`,
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
  )
  let resolvedOutputStyle: string | undefined
  const hotUpdateEffectiveMs = await waitFor(
    async () => {
      const resolvedCandidates = await expandOutputFileEntries(outputStyleCandidates)
      const targetCandidates = resolvedCandidates.length > 0 ? resolvedCandidates : outputStyleCandidates
      for (const candidate of targetCandidates) {
        const content = await readFileIfExists(candidate)
        if (content?.includes(payload.styleNeedle)) {
          resolvedOutputStyle = candidate
          return true
        }
      }
      return false
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] style output candidates are missing needle ${payload.styleNeedle}: ${outputStyleCandidates.map(formatPath).join(', ')}`,
      onTick: session.ensureRunning,
    },
    hotUpdateStartedAt,
  )

  if (!resolvedOutputStyle) {
    throw new Error(`[${watchCase.label}] failed to resolve style output after mutation`)
  }

  const updatedStyle = await fs.readFile(resolvedOutputStyle, 'utf8')
  assertContains(updatedStyle, payload.styleNeedle, `[${watchCase.label}] updated style output (${formatPath(resolvedOutputStyle)})`)
  if (payload.expectedApplyDeclarations.length > 0) {
    const updatedRuleBody = findCssRuleBody(updatedStyle, payload.styleNeedle)
    if (!updatedRuleBody) {
      throw new Error(`[${watchCase.label}] failed to locate style rule body for ${payload.styleNeedle}`)
    }
    const normalizedRuleBody = normalizeCssDeclaration(updatedRuleBody)
    for (const expectedDeclaration of payload.expectedApplyDeclarations) {
      if (!normalizedRuleBody.includes(normalizeCssDeclaration(expectedDeclaration))) {
        throw new Error(
          `[${watchCase.label}] style @apply declaration missing: ${expectedDeclaration}, rule=${payload.styleNeedle}`,
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
        const resolvedCandidates = await expandOutputFileEntries(outputStyleCandidates)
        const targetCandidates = resolvedCandidates.length > 0 ? resolvedCandidates : outputStyleCandidates
        for (const candidate of targetCandidates) {
          const content = await readFileIfExists(candidate)
          if (content?.includes(payload.styleNeedle)) {
            return false
          }
        }
        return true
      },
      {
        timeoutMs: rollbackNeedleCheckTimeoutMs,
        pollMs: options.pollMs,
        message: `[${watchCase.label}] style output candidates still contain needle ${payload.styleNeedle}: ${outputStyleCandidates.map(formatPath).join(', ')}`,
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

  process.stdout.write(
    `[watch-hmr] ${watchCase.label} mutation=style passed (hotUpdate=${hotUpdateEffectiveMs}ms, rollback=${rollbackEffectiveMs}ms)\n`,
  )

  return {
    mutationKind: 'style',
    sourceFile: sourcePath,
    outputStyle: resolvedOutputStyle,
    marker: payload.marker,
    styleNeedle: payload.styleNeedle,
    applyUtilities: payload.applyUtilities,
    expectedApplyDeclarations: payload.expectedApplyDeclarations,
    hotUpdateOutputMs,
    hotUpdateEffectiveMs,
    rollbackOutputMs,
    rollbackEffectiveMs,
    rollbackNeedleCleared,
  }
}
