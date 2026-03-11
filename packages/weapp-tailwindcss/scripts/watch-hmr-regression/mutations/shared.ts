import type {
  ClassMutationConfig,
  CliOptions,
  MutationRoundConfig,
  MutationRoundMetrics,
  MutationScenario,
  OutputMtime,
  StyleMutationPayload,
  WatchCase,
  WatchCaseRoundComparison,
  WatchSession,
} from '../types'
import { replaceWxml } from '../../../src/wxml/shared'
import { formatPath } from '../cli'
import { getMtime, readFileIfExists, waitFor } from '../text'
import { DEFAULT_STYLE_APPLY_VALIDATION, STYLE_APPLY_UNSUPPORTED_CASES } from '../types'

export async function waitForOutputsReady(watchCase: WatchCase, options: CliOptions, session: WatchSession) {
  return waitFor(
    async () => {
      const [wxml, js] = await Promise.all([
        readFileIfExists(watchCase.outputWxml),
        readFileIfExists(watchCase.outputJs),
      ])
      return Boolean(wxml && js)
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] initial outputs were not generated in time`,
      onTick: session.ensureRunning,
    },
  )
}

export async function waitForInitialWarmup(
  watchCase: WatchCase,
  options: CliOptions,
  session: WatchSession,
  sessionStartedAt: number,
) {
  const warmupGraceMs = Math.min(5000, options.timeoutMs)
  return waitFor(
    async () => {
      if (session.lastCompileSuccessAt() > sessionStartedAt) {
        return true
      }

      const [wxmlMtime, jsMtime] = await Promise.all([
        getMtime(watchCase.outputWxml),
        getMtime(watchCase.outputJs),
      ])
      if (wxmlMtime > sessionStartedAt || jsMtime > sessionStartedAt) {
        return true
      }

      // Some watch toolchains reuse existing outputs without touching mtimes on initial attach.
      // If both outputs exist and the watcher has stayed alive for a short grace period,
      // proceed and let later mutation checks enforce real hot-update behavior.
      return wxmlMtime > 0 && jsMtime > 0 && Date.now() - sessionStartedAt >= warmupGraceMs
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] initial watch warmup did not finish in time`,
      onTick: session.ensureRunning,
    },
  )
}

export async function waitForOutputsUpdated(
  watchCase: WatchCase,
  baseline: OutputMtime,
  options: CliOptions,
  session: WatchSession,
  startedAt = Date.now(),
) {
  return waitFor(
    async () => {
      const [wxmlMtime, jsMtime] = await Promise.all([
        getMtime(watchCase.outputWxml),
        getMtime(watchCase.outputJs),
      ])
      return wxmlMtime > baseline.wxml || jsMtime > baseline.js
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] outputs were not updated after source change`,
      onTick: session.ensureRunning,
    },
    startedAt,
  )
}

export async function waitForMarkerState(
  watchCase: WatchCase,
  marker: string,
  expected: 'present' | 'absent',
  options: CliOptions,
  session: WatchSession,
  startedAt = Date.now(),
) {
  return waitFor(
    async () => {
      const [wxml, js] = await Promise.all([
        readFileIfExists(watchCase.outputWxml),
        readFileIfExists(watchCase.outputJs),
      ])
      if (!wxml || !js) {
        return false
      }
      const hasMarker = wxml.includes(marker) || js.includes(marker)
      return expected === 'present' ? hasMarker : !hasMarker
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: expected === 'present'
        ? `[${watchCase.label}] marker was not propagated to outputs`
        : `[${watchCase.label}] marker was not removed from outputs`,
      onTick: session.ensureRunning,
    },
    startedAt,
  )
}

export function createClassMutationScenario(
  watchCase: WatchCase,
  mutationKind: 'template' | 'script',
  mutation: ClassMutationConfig,
  original: string,
  baselineWxml: string,
  baselineJs: string,
  baselineGlobalStyle: string,
  classVariableName: string,
  roundConfig: MutationRoundConfig,
): MutationScenario {
  const maxAttempts = 24
  const minFreshEscapedClasses = roundConfig.name === 'issue33-arbitrary' ? 0 : 3

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    // Keep attempt-specific digits at the front because some round configs
    // only read the first few digits from seed.
    const seed = `${attempt.toString().padStart(2, '0')}${Date.now().toString().slice(-4).padStart(4, '0')}`
    const classTokens = roundConfig.buildClassTokens(seed)
    const escapedClasses = classTokens.map(item => replaceWxml(item))
    const marker = `tw-watch-${watchCase.name}-${mutationKind}-${roundConfig.name}-${seed}`
    const classLiteral = classTokens.join(' ')

    const freshEscapedClasses = escapedClasses.filter((escaped) => {
      return !baselineWxml.includes(escaped) && !baselineJs.includes(escaped) && !baselineGlobalStyle.includes(escaped)
    })

    if (freshEscapedClasses.length < minFreshEscapedClasses) {
      continue
    }

    if (baselineWxml.includes(marker) || baselineJs.includes(marker) || baselineGlobalStyle.includes(marker)) {
      continue
    }

    const mutatedSource = mutation.mutate(original, {
      marker,
      classLiteral,
      classVariableName,
    })

    if (mutatedSource === original) {
      continue
    }

    return {
      roundName: roundConfig.name,
      marker,
      classLiteral,
      classVariableName,
      classTokens,
      escapedClasses,
      freshEscapedClasses,
      mutatedSource,
    }
  }

  throw new Error(`[${watchCase.label}] failed to generate fresh mutation classes for ${mutationKind}/${roundConfig.name}`)
}

export function createStyleMutationPayload(watchCase: WatchCase): StyleMutationPayload {
  const seed = `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  const marker = `tw-watch-style-${watchCase.name}-${seed}`
  const applyValidation = STYLE_APPLY_UNSUPPORTED_CASES.has(watchCase.name)
    ? undefined
    : DEFAULT_STYLE_APPLY_VALIDATION
  return {
    marker,
    styleNeedle: `.${marker}`,
    applyUtilities: applyValidation?.utilities ?? [],
    expectedApplyDeclarations: applyValidation?.expectedDeclarations ?? [],
  }
}

export function buildRoundComparison(rounds: MutationRoundMetrics[]): WatchCaseRoundComparison | undefined {
  const baseline = rounds.find(item => item.roundName === 'baseline-arbitrary')
  const candidate = rounds.find(item => item.roundName === 'complex-corpus')

  if (!baseline || !candidate) {
    return undefined
  }

  return {
    baselineRoundName: baseline.roundName,
    candidateRoundName: candidate.roundName,
    hotUpdateDeltaMs: candidate.hotUpdateEffectiveMs - baseline.hotUpdateEffectiveMs,
    rollbackDeltaMs: candidate.rollbackEffectiveMs - baseline.rollbackEffectiveMs,
    hotUpdateRatio: Number((candidate.hotUpdateEffectiveMs / baseline.hotUpdateEffectiveMs).toFixed(3)),
    rollbackRatio: Number((candidate.rollbackEffectiveMs / baseline.rollbackEffectiveMs).toFixed(3)),
  }
}

export async function resolveOutputFiles(
  watchCase: WatchCase,
  candidates: string[],
  label: string,
  options: CliOptions,
  session: WatchSession,
) {
  let resolved: string[] = []

  await waitFor(
    async () => {
      const nextResolved: string[] = []
      for (const file of candidates) {
        const content = await readFileIfExists(file)
        if (content != null) {
          nextResolved.push(file)
        }
      }
      resolved = nextResolved
      return resolved.length > 0
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] could not resolve ${label} output from candidates: ${candidates.map(formatPath).join(', ')}`,
      onTick: session.ensureRunning,
    },
  )

  if (resolved.length === 0) {
    throw new Error(`[${watchCase.label}] no resolved ${label} output`)
  }

  return resolved
}

export async function readJoinedOutputFiles(files: string[]) {
  const parts = await Promise.all(files.map(file => readFileIfExists(file)))
  return parts.filter((item): item is string => item != null).join('\n')
}

export function resolvePreferredRound(rounds: MutationRoundMetrics[]) {
  return rounds.find(item => item.roundName === 'complex-corpus')
    ?? rounds.at(-1)
}
