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
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { replaceWxml } from '../../core/replace-wxml'
import { formatPath } from '../cli'
import { getMtime, readFileIfExists, waitFor } from '../text'
import {
  DEFAULT_STYLE_APPLY_VALIDATION,
  STYLE_APPLY_UNSUPPORTED_CASES,
  STYLE_FUNCTION_UNSUPPORTED_CASES,
  STYLE_REFERENCE_REQUIRED_CASES,
} from '../types'

const GLOB_TOKEN_RE = /[*?]/
const REGEXP_ESCAPE_RE = /[.*+?^${}()|[\]\\]/g

function escapeRegExp(value: string) {
  return value.replace(REGEXP_ESCAPE_RE, '\\$&')
}

function createGlobRegExp(pattern: string) {
  return new RegExp(`^${pattern.split('*').map(escapeRegExp).join('.*')}$`)
}

export function isOutputFilePattern(file: string) {
  return GLOB_TOKEN_RE.test(path.basename(file))
}

export async function expandOutputFileEntries(files: string[]) {
  const resolved = new Set<string>()

  for (const file of files) {
    if (!isOutputFilePattern(file)) {
      const content = await readFileIfExists(file)
      if (content != null) {
        resolved.add(file)
      }
      continue
    }

    const dir = path.dirname(file)
    const pattern = createGlobRegExp(path.basename(file))
    let entries: string[] = []

    try {
      entries = await readdir(dir)
    }
    catch {
      continue
    }

    for (const entry of entries) {
      if (!pattern.test(entry)) {
        continue
      }
      const matchedFile = path.join(dir, entry)
      const content = await readFileIfExists(matchedFile)
      if (content != null) {
        resolved.add(matchedFile)
      }
    }
  }

  return [...resolved]
}

export async function waitForOutputsReady(
  watchCase: WatchCase,
  options: CliOptions,
  session: WatchSession,
  sessionStartedAt: number,
  outputs: {
    wxml: string
    js: string
    label?: string
  } = {
    wxml: watchCase.outputWxml,
    js: watchCase.outputJs,
  },
) {
  const stableWindowMs = Math.min(Math.max(options.pollMs * 2, 600), 1500)
  const outputLabel = outputs.label ?? watchCase.label
  return waitFor(
    async () => {
      const [wxml, js, wxmlMtime, jsMtime] = await Promise.all([
        readFileIfExists(outputs.wxml),
        readFileIfExists(outputs.js),
        getMtime(outputs.wxml),
        getMtime(outputs.js),
      ])
      if (wxml == null || js == null) {
        return false
      }

      if (Math.max(wxmlMtime, jsMtime) > sessionStartedAt) {
        return true
      }

      const lastCompileSuccessAt = session.lastCompileSuccessAt()
      return lastCompileSuccessAt > sessionStartedAt
        && Date.now() - lastCompileSuccessAt >= stableWindowMs
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${outputLabel}] initial outputs were not generated in time`,
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
  // Taro/Vite watch 在输出首轮 built 日志后，文件监听器偶发还没完全挂好。
  // 这里把稳定窗口放宽到至少 1.5s，避免过早注入 mutation 导致首次改动丢失。
  const warmupStableWindowMs = Math.min(Math.max(options.pollMs * 4, 1500), 3000)
  const requireInitialCompileSuccess = watchCase.requireInitialCompileSuccess === true
  return waitFor(
    async () => {
      const lastCompileSuccessAt = session.lastCompileSuccessAt()
      if (lastCompileSuccessAt > sessionStartedAt) {
        return Date.now() - lastCompileSuccessAt >= warmupStableWindowMs
      }

      const [wxmlMtime, jsMtime] = await Promise.all([
        getMtime(watchCase.outputWxml),
        getMtime(watchCase.outputJs),
      ])
      const latestOutputMtime = Math.max(wxmlMtime, jsMtime)
      if (latestOutputMtime > sessionStartedAt) {
        return Date.now() - latestOutputMtime >= warmupStableWindowMs
      }

      if (requireInitialCompileSuccess) {
        return false
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

export async function waitForCompileSettled(
  watchCase: WatchCase,
  options: CliOptions,
  session: WatchSession,
  phaseStartedAt: number,
) {
  const stableWindowMs = Math.min(Math.max(options.pollMs * 2, 600), 1500)
  const timeoutMs = Math.min(options.timeoutMs, 30_000)
  return waitFor(
    async () => {
      const lastCompileSuccessAt = session.lastCompileSuccessAt()
      if (lastCompileSuccessAt > phaseStartedAt) {
        return Date.now() - lastCompileSuccessAt >= stableWindowMs
      }

      const [wxmlMtime, jsMtime] = await Promise.all([
        getMtime(watchCase.outputWxml),
        getMtime(watchCase.outputJs),
      ])
      const latestOutputMtime = Math.max(wxmlMtime, jsMtime)
      return latestOutputMtime > phaseStartedAt
        && Date.now() - latestOutputMtime >= stableWindowMs
    },
    {
      timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] watch compile did not settle in time`,
      onTick: session.ensureRunning,
    },
  )
}

export function collectPluginProcessMetrics(session: WatchSession, startedAt: number) {
  const samples = session.pluginProcessSamplesSince(startedAt)
  const totalSamples = samples.filter(sample => sample.metric === 'total' || sample.phase === 'total')
  const budgetSamples = totalSamples.length > 0 ? totalSamples : samples
  return {
    samples,
    totalMs: Math.max(0, ...budgetSamples.map(sample => sample.durationMs)),
  }
}

export async function waitForOutputsUpdated(
  watchCase: WatchCase,
  baseline: OutputMtime,
  options: CliOptions,
  session: WatchSession,
  startedAt = Date.now(),
  acceptWhen?: () => Promise<boolean>,
) {
  const acceptsSemanticOutput = async () => {
    if (!acceptWhen) {
      return false
    }

    try {
      return await acceptWhen()
    }
    catch {
      return false
    }
  }

  return waitFor(
    async () => {
      const [wxmlMtime, jsMtime] = await Promise.all([
        getMtime(watchCase.outputWxml),
        getMtime(watchCase.outputJs),
      ])
      if (await acceptsSemanticOutput()) {
        return true
      }
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

export async function waitForClassOutputBaseline(
  watchCase: WatchCase,
  options: CliOptions,
  session: WatchSession,
  mutationKind: 'template' | 'script' | 'content',
  globalStyleOutputs: string[],
) {
  let resolvedOutputs: {
    wxml: string
    js: string
    globalStyle: string
  } | undefined
  let lastReason = 'outputs are not ready'
  const waitStartedAt = Date.now()

  await waitFor(
    async () => {
      const [wxml, js, globalStyle, hasGlobalStyleOutputs] = await Promise.all([
        readFileIfExists(watchCase.outputWxml),
        readFileIfExists(watchCase.outputJs),
        readJoinedOutputFiles(globalStyleOutputs),
        hasResolvedOutputFiles(globalStyleOutputs),
      ])

      if (wxml && js && hasGlobalStyleOutputs) {
        resolvedOutputs = {
          wxml,
          js,
          globalStyle,
        }
        return true
      }

      lastReason = [
        wxml ? undefined : 'wxml',
        js ? undefined : 'js',
        hasGlobalStyleOutputs ? undefined : 'global style',
      ].filter(Boolean).join(', ')
      return false
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] baseline outputs are missing for ${mutationKind}: ${lastReason}`,
      onTick: session.ensureRunning,
    },
    waitStartedAt,
  )

  if (!resolvedOutputs) {
    throw new Error(`[${watchCase.label}] baseline outputs failed to resolve for ${mutationKind}`)
  }

  return resolvedOutputs
}

export async function waitForOutputFilesUpdated(
  watchCase: WatchCase,
  files: string[],
  baselineMtimes: Map<string, number>,
  options: CliOptions,
  session: WatchSession,
  startedAt = Date.now(),
  acceptWhen?: () => Promise<boolean>,
) {
  const acceptsSemanticOutput = async () => {
    if (!acceptWhen) {
      return false
    }

    try {
      return await acceptWhen()
    }
    catch {
      return false
    }
  }

  return waitFor(
    async () => {
      let exactFileUpdated = false
      for (const file of files) {
        if (isOutputFilePattern(file)) {
          continue
        }

        const currentMtime = await getMtime(file)
        if (currentMtime === 0) {
          if (await acceptsSemanticOutput()) {
            return true
          }
          continue
        }

        const baselineMtime = baselineMtimes.get(file) ?? 0
        if (baselineMtime === 0 || currentMtime > baselineMtime) {
          exactFileUpdated = true
        }
      }

      if (exactFileUpdated && !acceptWhen) {
        return true
      }

      const resolvedFiles = await expandOutputFileEntries(files)
      for (const file of resolvedFiles) {
        const baselineMtime = baselineMtimes.get(file) ?? 0
        const currentMtime = await getMtime(file)
        if (baselineMtime === 0 || currentMtime > baselineMtime) {
          if (acceptWhen) {
            break
          }
          return true
        }
      }
      if (await acceptsSemanticOutput()) {
        return true
      }
      return false
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] output files were not updated after source change: ${files.map(formatPath).join(', ')}`,
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
  outputs: {
    wxml: string
    js: string
    label?: string
  } = {
    wxml: watchCase.outputWxml,
    js: watchCase.outputJs,
  },
) {
  const outputLabel = outputs.label ?? watchCase.label
  return waitFor(
    async () => {
      const [wxml, js] = await Promise.all([
        readFileIfExists(outputs.wxml),
        readFileIfExists(outputs.js),
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
        ? `[${outputLabel}] marker was not propagated to outputs`
        : `[${outputLabel}] marker was not removed from outputs`,
      onTick: session.ensureRunning,
    },
    startedAt,
  )
}

export function createClassMutationScenario(
  watchCase: WatchCase,
  mutationKind: 'template' | 'script' | 'content',
  mutation: ClassMutationConfig,
  original: string,
  baselineWxml: string,
  baselineJs: string,
  baselineGlobalStyle: string,
  classVariableName: string,
  roundConfig: MutationRoundConfig,
): MutationScenario {
  const maxAttempts = 100
  const minFreshEscapedClasses = roundConfig.name === 'issue33-arbitrary' ? 0 : 3
  const markerPrefix = mutationKind === 'template' && watchCase.label.includes('/sub-')
    ? `tw-watch-subpackage-${watchCase.name}`
    : `tw-watch-${watchCase.name}`

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    // Keep attempt-specific digits at the front because some round configs
    // only read the first few digits from seed.
    const attemptHead = attempt.toString().padStart(2, '0')
    const attemptTail = ((attempt * 7) % 100).toString().padStart(2, '0')
    const seed = `${attemptHead}${attemptTail}${Date.now().toString().slice(-2).padStart(2, '0')}`
    const classTokens = roundConfig.buildClassTokens(seed)
    const escapedClasses = classTokens.map(item => replaceWxml(item))
    const marker = `${markerPrefix}-${mutationKind}-${roundConfig.name}-${seed}`
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
  const functionNeedle = STYLE_FUNCTION_UNSUPPORTED_CASES.has(watchCase.name)
    ? undefined
    : `.${marker}-theme`
  const styleNeedle = `.${marker}`
  return {
    marker,
    styleNeedle,
    outputNeedles: [styleNeedle],
    rollbackNeedles: [styleNeedle],
    applyUtilities: applyValidation?.utilities ?? [],
    expectedApplyDeclarations: applyValidation?.expectedDeclarations ?? [],
    expectedApplyDeclarationGroups: applyValidation?.expectedDeclarationGroups ?? [],
    ...(functionNeedle ? { functionNeedle } : {}),
    functionDeclarations: functionNeedle
      ? ['padding: theme(\'spacing.2\');', 'margin-left: theme(\'spacing.3\');']
      : [],
    expectedFunctionDeclarations: functionNeedle ? ['padding:', 'margin-left:'] : [],
    forbiddenFunctionFragments: functionNeedle ? ['theme('] : [],
    ...(STYLE_REFERENCE_REQUIRED_CASES.has(watchCase.name)
      ? { referenceDirective: '@reference "tailwindcss";' }
      : {}),
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
      resolved = await expandOutputFileEntries(candidates)
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

  return [...new Set(resolved)]
}

export async function readJoinedOutputFiles(files: string[]) {
  const resolvedFiles = await expandOutputFileEntries(files)
  const parts = await Promise.all(resolvedFiles.map(file => readFileIfExists(file)))
  return parts.filter((item): item is string => item != null).join('\n')
}

export async function hasResolvedOutputFiles(files: string[]) {
  return (await expandOutputFileEntries(files)).length > 0
}

export function resolvePreferredRound(rounds: MutationRoundMetrics[]) {
  return rounds.find(item => item.roundName === 'complex-corpus')
    ?? rounds.at(-1)
}
