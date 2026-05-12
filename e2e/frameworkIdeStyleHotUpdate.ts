import type { createWatchSession } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/session'
import type { CliOptions, WatchCase } from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types'
import type { FrameworkSupportCase } from './frameworkSupportMatrix'
import process from 'node:process'
import {
  waitForCompileSettled,
  waitForOutputFilesUpdated,
} from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/mutations'
import {
  appendTrailingSnippet,
  findCssRuleBody,
  insertBeforeClosingTag,
  normalizeCssDeclaration,
  waitFor,
  writeFilePreserveEol,
} from '../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/text'
import {
  collectArtifactMtimes,
  countChangedArtifacts,
  hasAnyNeedle,
  readArtifacts,
  summarizeChangedArtifacts,
} from './frameworkIdeHotUpdateArtifacts'

function createIdeStyleSnippet(entry: FrameworkSupportCase, marker: string) {
  const selector = `.${marker}`
  const functionSelector = `.${marker}-theme`
  const color = entry.tailwindcss === 'v4' ? '#14532d' : '#1d4ed8'
  const lines = [
    `${selector} { @apply font-bold text-center bg-[#123456] px-[12px]; color: ${color}; }`,
    `${functionSelector} { padding: theme('spacing.2'); margin-left: theme('spacing.3'); }`,
  ]
  if (entry.tailwindcss === 'v4') {
    lines.unshift('@reference "tailwindcss";')
  }
  return lines.join('\n')
}

function mutateStyleSource(source: string, snippet: string) {
  if (source.includes('</style>')) {
    return insertBeforeClosingTag(source, '</style>', snippet)
  }
  return appendTrailingSnippet(source, snippet)
}

function assertStyleOutput(watchCase: WatchCase, content: string, marker: string) {
  const applyRule = findCssRuleBody(content, `.${marker}`)
  if (!applyRule) {
    throw new Error(`[${watchCase.label}] IDE style HMR output is missing @apply rule .${marker}`)
  }
  const normalizedApplyRule = normalizeCssDeclaration(applyRule)
  for (const expected of ['font-weight:', 'text-align:', 'background-color:', 'padding-left:', 'padding-right:']) {
    if (!normalizedApplyRule.includes(normalizeCssDeclaration(expected))) {
      throw new Error(`[${watchCase.label}] IDE style HMR @apply output is missing declaration ${expected}`)
    }
  }

  const functionRule = findCssRuleBody(content, `.${marker}-theme`)
  if (!functionRule) {
    throw new Error(`[${watchCase.label}] IDE style HMR output is missing Tailwind function rule .${marker}-theme`)
  }
  if (functionRule.includes('theme(')) {
    throw new Error(`[${watchCase.label}] IDE style HMR did not resolve Tailwind theme() function`)
  }
  const normalizedFunctionRule = normalizeCssDeclaration(functionRule)
  for (const expected of ['padding', 'margin-left']) {
    if (!normalizedFunctionRule.includes(`${expected}:`)) {
      throw new Error(`[${watchCase.label}] IDE style HMR function output is missing declaration ${expected}`)
    }
  }
}

function resolveUpdatedStyleFiles(watchCase: WatchCase, baselineMtimes: Map<string, number>) {
  return [...watchCase.outputStyleCandidates, ...watchCase.globalStyleCandidates]
    .filter(file => file.includes('*') || baselineMtimes.has(file))
}

export async function runIdeStyleHotUpdate(
  entry: FrameworkSupportCase,
  options: CliOptions,
  watchCase: WatchCase,
  session: ReturnType<typeof createWatchSession>,
  sourceOriginal: string,
) {
  const sourceFile = watchCase.styleMutation.sourceFile
  const marker = `tw-ide-style-${watchCase.name}-${Date.now().toString().slice(-6)}`
  const mutatedSource = mutateStyleSource(sourceOriginal, createIdeStyleSnippet(entry, marker))
  const { artifacts: baselineArtifacts, mtimes: baselineMtimes } = await collectArtifactMtimes(watchCase)
  const mutationStartedAt = Date.now()

  await writeFilePreserveEol(sourceFile, mutatedSource, sourceOriginal)
  await waitForOutputFilesUpdated(
    watchCase,
    resolveUpdatedStyleFiles(watchCase, baselineMtimes),
    baselineMtimes,
    options,
    session,
    mutationStartedAt,
    async () => hasAnyNeedle(await readArtifacts(watchCase), [marker]),
  )

  let changedArtifacts: string[] = []
  await waitFor(
    async () => {
      const currentArtifacts = await readArtifacts(watchCase)
      const styleArtifacts = currentArtifacts.filter(item => item.kind === 'style' && item.content.includes(marker))
      if (styleArtifacts.length === 0 || countChangedArtifacts(baselineArtifacts, currentArtifacts) === 0) {
        return false
      }
      for (const artifact of styleArtifacts) {
        assertStyleOutput(watchCase, artifact.content, marker)
      }
      changedArtifacts = summarizeChangedArtifacts(baselineArtifacts, currentArtifacts)
      return true
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] IDE style HMR output did not contain expanded @apply and theme() declarations`,
      onTick: session.ensureRunning,
    },
    mutationStartedAt,
  )

  process.stdout.write(
    `[e2e:ide] ${watchCase.label} style HMR changed artifacts=${changedArtifacts.length}: ${changedArtifacts.join(', ')}\n`,
  )

  const rollbackStartedAt = Date.now()
  await writeFilePreserveEol(sourceFile, sourceOriginal, sourceOriginal)
  await waitForCompileSettled(watchCase, options, session, rollbackStartedAt)
  await waitFor(
    async () => !hasAnyNeedle(await readArtifacts(watchCase), [marker]),
    {
      timeoutMs: Math.min(options.timeoutMs, 60_000),
      pollMs: options.pollMs,
      message: `[${watchCase.label}] IDE style HMR marker was not removed after rollback: ${marker}`,
      onTick: session.ensureRunning,
    },
    rollbackStartedAt,
  )
}
