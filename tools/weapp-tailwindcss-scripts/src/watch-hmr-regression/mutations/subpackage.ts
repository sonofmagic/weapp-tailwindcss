import type {
  ClassMutationMetrics,
  CliOptions,
  SubPackageMutationConfig,
  SubPackageMutationMetrics,
  WatchCase,
  WatchSession,
} from '../types'
import { promises as fs } from 'node:fs'
import process from 'node:process'
import { writeFilePreserveEol } from '../text'
import { runClassMutation } from './class'
import { waitForOutputsReady } from './shared'
import { runStyleMutation } from './style'

function createSubPackageWatchCase(watchCase: WatchCase, mutation: SubPackageMutationConfig): WatchCase {
  return {
    ...watchCase,
    label: `${watchCase.label}/${mutation.root}${mutation.independent ? ':independent' : ''}`,
    minGlobalStyleEscapedClasses: mutation.minGlobalStyleEscapedClasses ?? watchCase.minGlobalStyleEscapedClasses,
    outputWxml: mutation.outputWxml,
    outputJs: mutation.outputJs,
    outputStyleCandidates: mutation.outputStyleCandidates,
    globalStyleCandidates: mutation.globalStyleCandidates,
    templateMutation: mutation.templateMutation,
    scriptMutation: mutation.templateMutation,
    styleMutation: mutation.styleMutation,
    contentMutation: undefined,
    subPackageMutations: undefined,
  }
}

function assertSubPackageTemplateMetric(
  watchCase: WatchCase,
  mutation: SubPackageMutationConfig,
  metric: ClassMutationMetrics,
) {
  expectMetric(
    metric.rounds.length > 0,
    `[${watchCase.label}] ${mutation.root} should produce template HMR rounds`,
  )
  for (const round of metric.rounds) {
    expectMetric(
      round.escapedClasses.some(escaped => metric.verifiedGlobalStyleEscapedClasses.includes(escaped)),
      `[${watchCase.label}] ${mutation.root} should verify generated wxss for ${round.roundName}`,
    )
  }

  if (mutation.independent) {
    expectMetric(
      metric.sourceFile.includes('sub-independent'),
      `[${watchCase.label}] independent subpackage mutation should use sub-independent source`,
    )
  }
}

function expectMetric(value: boolean, message: string) {
  if (!value) {
    throw new Error(message)
  }
}

export async function runSubPackageMutation(
  watchCase: WatchCase,
  options: CliOptions,
  session: WatchSession,
  mutation: SubPackageMutationConfig,
  sourceOriginals: Map<string, string>,
): Promise<SubPackageMutationMetrics> {
  const subWatchCase = createSubPackageWatchCase(watchCase, mutation)

  const templateSourceOriginal = sourceOriginals.get(mutation.templateMutation.sourceFile)
    ?? await fs.readFile(mutation.templateMutation.sourceFile, 'utf8')
  sourceOriginals.set(mutation.templateMutation.sourceFile, templateSourceOriginal)

  const styleSourceOriginal = sourceOriginals.get(mutation.styleMutation.sourceFile)
    ?? (
      mutation.skipStyleMutation
        ? undefined
        : await fs.readFile(mutation.styleMutation.sourceFile, 'utf8')
    )
  if (!mutation.skipStyleMutation && styleSourceOriginal == null) {
    throw new Error(`[${subWatchCase.label}] missing style mutation source original`)
  }
  if (styleSourceOriginal != null) {
    sourceOriginals.set(mutation.styleMutation.sourceFile, styleSourceOriginal)
  }

  const attachStartedAt = Date.now()
  const attachWrites = [
    writeFilePreserveEol(mutation.templateMutation.sourceFile, templateSourceOriginal, templateSourceOriginal),
  ]
  if (!mutation.skipStyleMutation && styleSourceOriginal != null) {
    attachWrites.push(
      writeFilePreserveEol(mutation.styleMutation.sourceFile, styleSourceOriginal, styleSourceOriginal),
    )
  }
  await Promise.all(attachWrites)

  await waitForOutputsReady(watchCase, options, session, attachStartedAt, {
    wxml: mutation.outputWxml,
    js: mutation.outputJs,
    label: subWatchCase.label,
  })

  const globalStyleOutputs = [...new Set([
    ...mutation.outputStyleCandidates,
    ...mutation.globalStyleCandidates,
  ])]

  const template = await runClassMutation(
    subWatchCase,
    options,
    session,
    'template',
    mutation.templateMutation,
    templateSourceOriginal,
    globalStyleOutputs,
  )
  assertSubPackageTemplateMetric(watchCase, mutation, template)

  const style = mutation.skipStyleMutation
    ? undefined
    : await runStyleMutation(
        subWatchCase,
        options,
        session,
        mutation.styleMutation,
        styleSourceOriginal!,
        [...new Set([
          ...mutation.outputStyleCandidates,
          ...mutation.globalStyleCandidates,
        ])],
      )

  process.stdout.write(
    `[watch-hmr] ${subWatchCase.label} mutation=subpackage passed (template=${template.hotUpdateEffectiveMs}ms${style ? `, style=${style.hotUpdateEffectiveMs}ms` : ''})\n`,
  )

  return {
    root: mutation.root,
    independent: mutation.independent,
    outputWxml: mutation.outputWxml,
    outputJs: mutation.outputJs,
    globalStyleOutputs,
    template,
    style,
  }
}
