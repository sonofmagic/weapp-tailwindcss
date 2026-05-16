import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { parse } from 'yaml'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildDemoBaseCases,
} from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/demo/base'
import {
  buildDemoExtendedCases,
} from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/demo/extended'
import {
  buildCases,
  filterCasesForPlatform,
  pickCases,
} from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases'
import {
  buildHexScriptRoundConfigs,
  buildIssue33HighRiskRoundConfigs,
  buildTailwindV4JsContentRoundConfigs,
} from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/cases/round-configs'
import {
  resolveReportPath,
  resolveRepositoryRootLabel,
  summarizeMetrics,
  summarizeMetricsByGroup,
  summarizeMetricsByProject,
  summarizeMetricsByRound,
  summarizeMutationKindAcrossCases,
  summarizeMutationMetricsByKind,
  summarizeSamples,
  writeReport,
} from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/summary'
import {
  buildSpeedReport,
  collectSpeedSamplesFromReport,
  renderSpeedReportMarkdown,
  summarizeSpeedSamples,
} from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/speed-report'
import {
  assertHotUpdateBudget,
  assertPluginProcessBudget,
} from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/runner'
import {
  createStyleMutationPayload,
  expandOutputFileEntries,
  createClassMutationScenario,
  hasResolvedOutputFiles,
  readJoinedOutputFiles,
  waitForCompileSettled,
  waitForInitialWarmup,
  waitForOutputsReady,
  waitForOutputsUpdated,
  waitForOutputFilesUpdated,
} from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/mutations/shared'
import {
  ISSUE33_ADD_CLASS_TOKENS,
  ISSUE33_MODIFY_CLASS_TOKENS,
} from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/mutations/tokens'
import {
  alignContentEol,
  appendTrailingSnippet,
  assertContains,
  assertContainsOneOf,
  assertNotContains,
  createStyleRuleSnippet,
  escapeRegExp,
  findCssRuleBody,
  getMtime,
  insertBeforeAnchor,
  insertBeforeClosingTag,
  insertIntoVueTemplateRoot,
  mutateScriptByDataAnchor,
  mutateSfcStyleBlock,
  mutateTsxScriptByReturnAnchor,
  mutateTsxScriptByReturnAnchorWithCommentCarrier,
  mutateVueRefStringLiteral,
  mutateVueScriptSetupObjectKeyByAnchor,
  mutateVueScriptSetupObjectKeyByAnchorWithCommentCarrier,
  mutateVueScriptSetupArrayByAnchor,
  mutateVueScriptSetupArrayByAnchorWithCommentCarrier,
  normalizeCssDeclaration,
  replaceExactSnippet,
  readFileIfExists,
  readFileWithRetry,
  waitFor,
  writeFilePreserveEol,
} from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/text'
import { replaceWxml } from '../src/wxml/shared'
import type {
  CliOptions,
  MutationRoundMetrics,
  WatchCase,
  WatchCaseMetrics,
  WatchCaseMutationMetrics,
} from '../../../tools/weapp-tailwindcss-scripts/src/watch-hmr-regression/types'

const payload = {
  marker: 'tw-watch-20260313',
  classLiteral: 'text-[#123456] bg-[#0f0f0f]',
  classVariableName: '__twWatchClass',
}

const pluginProcessSample = {
  at: 1,
  bundler: 'vite',
  phase: 'generateBundle',
  durationMs: 25,
}

function createRound(roundName: MutationRoundMetrics['roundName'], hotUpdateEffectiveMs: number, rollbackEffectiveMs: number): MutationRoundMetrics {
  return {
    roundName,
    marker: `${roundName}-marker`,
    classLiteral: 'text-[#123456]',
    classTokens: ['text-[#123456]'],
    escapedClasses: ['text-_b_h123456_B'],
    hotUpdateOutputMs: hotUpdateEffectiveMs + 10,
    hotUpdateEffectiveMs,
    hotUpdatePluginProcessMs: 25,
    hotUpdatePluginProcessSamples: [pluginProcessSample],
    rollbackOutputMs: rollbackEffectiveMs + 10,
    rollbackEffectiveMs,
    rollbackPluginProcessMs: 20,
    rollbackPluginProcessSamples: [{ ...pluginProcessSample, durationMs: 20 }],
    totalMs: hotUpdateEffectiveMs + rollbackEffectiveMs,
  }
}

function createClassMutationMetrics(
  mutationKind: 'template' | 'script' | 'content',
  rounds: MutationRoundMetrics[],
): WatchCaseMutationMetrics {
  return {
    mutationKind,
    sourceFile: `${mutationKind}.ts`,
    marker: `${mutationKind}-marker`,
    classLiteral: 'text-[#123456]',
    classTokens: ['text-[#123456]'],
    escapedClasses: ['text-_b_h123456_B'],
    rounds,
    verifyEscapedIn: ['wxml'],
    verifyClassLiteralIn: ['js'],
    globalStyleOutputs: [],
    minRequiredGlobalStyleEscapedClasses: 0,
    verifiedGlobalStyleEscapedClasses: [],
    hotUpdateOutputMs: 40,
    hotUpdateEffectiveMs: 30,
    hotUpdatePluginProcessMs: 25,
    hotUpdatePluginProcessSamples: [pluginProcessSample],
    rollbackOutputMs: 50,
    rollbackEffectiveMs: 35,
    rollbackPluginProcessMs: 20,
    rollbackPluginProcessSamples: [{ ...pluginProcessSample, durationMs: 20 }],
  }
}

function createStyleMutationMetrics(): WatchCaseMutationMetrics {
  return {
    mutationKind: 'style',
    sourceFile: 'style.css',
    outputStyle: 'app.wxss',
    marker: 'style-marker',
    styleNeedle: '.watch-style-marker',
    outputNeedles: ['.watch-style-marker'],
    rollbackNeedles: ['.watch-style-marker'],
    applyUtilities: ['font-bold'],
    expectedApplyDeclarations: ['font-weight:'],
    expectedApplyDeclarationGroups: [],
    functionNeedle: '.watch-style-marker-theme',
    functionDeclarations: ['padding: theme(\'spacing.2\');'],
    expectedFunctionDeclarations: ['padding:'],
    forbiddenFunctionFragments: ['theme('],
    hotUpdateOutputMs: 45,
    hotUpdateEffectiveMs: 32,
    hotUpdatePluginProcessMs: 22,
    hotUpdatePluginProcessSamples: [{ ...pluginProcessSample, durationMs: 22 }],
    rollbackOutputMs: 55,
    rollbackEffectiveMs: 36,
    rollbackPluginProcessMs: 18,
    rollbackPluginProcessSamples: [{ ...pluginProcessSample, durationMs: 18 }],
    rollbackNeedleCleared: true,
  }
}

function createCase(
  name: WatchCaseMetrics['name'],
  projectGroup: WatchCaseMetrics['projectGroup'],
  hotUpdateEffectiveMs: number,
  rollbackEffectiveMs: number,
): WatchCaseMetrics {
  const complexRound = createRound('complex-corpus', hotUpdateEffectiveMs, rollbackEffectiveMs)
  return {
    name,
    label: `${name} label`,
    project: `${projectGroup}-${name}`,
    projectGroup,
    marker: `${name}-marker`,
    classLiteral: 'text-[#123456]',
    classTokens: ['text-[#123456]'],
    escapedClasses: ['text-_b_h123456_B'],
    rounds: [
      createRound('baseline-arbitrary', hotUpdateEffectiveMs + 5, rollbackEffectiveMs + 5),
      complexRound,
      createRound('hex-arbitrary', hotUpdateEffectiveMs + 10, rollbackEffectiveMs + 10),
      createRound('issue33-arbitrary', hotUpdateEffectiveMs + 15, rollbackEffectiveMs + 15),
    ],
    verifyEscapedIn: ['wxml'],
    verifyClassLiteralIn: ['js'],
    globalStyleOutputs: [],
    mutationMetrics: [
      createClassMutationMetrics('template', [complexRound]),
      createClassMutationMetrics('script', [complexRound]),
      createClassMutationMetrics('content', [complexRound]),
      createStyleMutationMetrics(),
    ],
    subPackageMutationMetrics: [],
    summaryByMutationKind: {},
    initialReadyMs: 25,
    hotUpdateOutputMs: hotUpdateEffectiveMs + 10,
    hotUpdateEffectiveMs,
    hotUpdatePluginProcessMs: complexRound.hotUpdatePluginProcessMs,
    hotUpdatePluginProcessSamples: complexRound.hotUpdatePluginProcessSamples,
    rollbackOutputMs: rollbackEffectiveMs + 10,
    rollbackEffectiveMs,
    rollbackPluginProcessMs: complexRound.rollbackPluginProcessMs,
    rollbackPluginProcessSamples: complexRound.rollbackPluginProcessSamples,
    totalMs: hotUpdateEffectiveMs + rollbackEffectiveMs + 25,
  }
}

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
})

describe('watch-hmr regression text helpers', () => {
  it('aligns EOLs to match the source file', () => {
    expect(alignContentEol('a\nb\n', 'first\r\nsecond\r\n')).toBe('a\r\nb\r\n')
    expect(alignContentEol('a\r\nb\r\n', 'first\nsecond\n')).toBe('a\nb\n')
  })

  it('reads, writes and probes file metadata', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-watch-text-'))
    tempDirs.push(tempDir)
    const file = path.join(tempDir, 'sample.txt')

    await writeFilePreserveEol(file, 'alpha\nbeta\n', 'one\r\ntwo\r\n')

    expect(await readFileWithRetry(file)).toBe('alpha\r\nbeta\r\n')
    expect(await readFileIfExists(path.join(tempDir, 'missing.txt'))).toBeUndefined()
    expect(await getMtime(file)).toBeGreaterThan(0)
    expect(await getMtime(path.join(tempDir, 'missing.txt'))).toBe(0)
  })

  it('expands wildcard output files so hashed style assets can be re-discovered', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-watch-glob-'))
    tempDirs.push(tempDir)
    const styleDir = path.join(tempDir, 'styles')
    await mkdir(styleDir, { recursive: true })
    await writeFilePreserveEol(path.join(styleDir, 'utilities123.wxss'), '.a{}', '.a{}')
    await writeFilePreserveEol(path.join(styleDir, 'utilities456.wxss'), '.b{}', '.b{}')

    const resolved = await expandOutputFileEntries([
      path.join(styleDir, 'utilities*.wxss'),
    ])
    const joined = await readJoinedOutputFiles([
      path.join(styleDir, 'utilities*.wxss'),
    ])

    expect(resolved).toEqual([
      path.join(styleDir, 'utilities123.wxss'),
      path.join(styleDir, 'utilities456.wxss'),
    ])
    expect(joined).toContain('.a{}')
    expect(joined).toContain('.b{}')
  })

  it('re-reads wildcard output files after hashed style assets change', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-watch-glob-refresh-'))
    tempDirs.push(tempDir)
    const styleDir = path.join(tempDir, 'styles')
    const pattern = path.join(styleDir, 'index*.wxss')
    await mkdir(styleDir, { recursive: true })
    await writeFilePreserveEol(path.join(styleDir, 'index111.wxss'), '.old{}', '.old{}')

    const before = await readJoinedOutputFiles([pattern])
    await rm(path.join(styleDir, 'index111.wxss'))
    await writeFilePreserveEol(path.join(styleDir, 'index222.wxss'), '.fresh{}', '.fresh{}')
    const after = await readJoinedOutputFiles([pattern])

    expect(before).toContain('.old{}')
    expect(after).not.toContain('.old{}')
    expect(after).toContain('.fresh{}')
  })

  it('treats empty generated style files as resolved outputs', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-watch-empty-style-'))
    tempDirs.push(tempDir)
    const outputFile = path.join(tempDir, 'app.wxss')
    await writeFilePreserveEol(outputFile, '', '')

    await expect(hasResolvedOutputFiles([outputFile])).resolves.toBe(true)
    await expect(readJoinedOutputFiles([outputFile])).resolves.toBe('')
  })

  it('waits for predicates and reports timeout failures', async () => {
    let attempt = 0
    let tickCount = 0
    const timeoutMs = 200
    const elapsed = await waitFor(
      () => ++attempt > 2,
      {
        timeoutMs,
        pollMs: 1,
        message: 'waited too long',
        onTick: () => {
          tickCount += 1
        },
      },
    )

    expect(attempt).toBe(3)
    expect(tickCount).toBe(2)
    expect(elapsed).toBeGreaterThanOrEqual(0)
    expect(elapsed).toBeLessThan(timeoutMs)

    await expect(() => {
      return waitFor(
        () => false,
        {
          timeoutMs: 5,
          pollMs: 1,
          message: 'timeout message',
        },
      )
    }).rejects.toThrow('timeout message')
  })

  it('allows output file update waits to pass via semantic fallback when mtimes stay unchanged', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-watch-output-update-'))
    tempDirs.push(tempDir)
    const outputFile = path.join(tempDir, 'app.wxss')
    await writeFilePreserveEol(outputFile, '.base{}', '.base{}')
    const baselineMtime = await getMtime(outputFile)
    let attempts = 0

    const elapsed = await waitForOutputFilesUpdated(
      {
        label: 'demo/fixture-project',
      } as any,
      [outputFile],
      new Map([[outputFile, baselineMtime]]),
      {
        timeoutMs: 100,
        pollMs: 1,
      } as CliOptions,
      {
        ensureRunning() {},
      } as any,
      Date.now(),
      async () => {
        attempts += 1
        return attempts >= 2
      },
    )

    expect(elapsed).toBeGreaterThanOrEqual(0)
    expect(attempts).toBeGreaterThanOrEqual(2)
  })

  it('allows primary output update waits to pass via semantic fallback when mtimes stay unchanged', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-watch-primary-output-update-'))
    tempDirs.push(tempDir)
    const wxmlFile = path.join(tempDir, 'index.wxml')
    const jsFile = path.join(tempDir, 'index.js')
    await writeFilePreserveEol(wxmlFile, '<view class="base"></view>', '<view />')
    await writeFilePreserveEol(jsFile, 'Page({})', 'Page({})')
    const baseline = {
      wxml: await getMtime(wxmlFile),
      js: await getMtime(jsFile),
    }
    let attempts = 0

    const elapsed = await waitForOutputsUpdated(
      {
        label: 'demo/taro-vite-vue3-tailwindcss-v4',
        outputWxml: wxmlFile,
        outputJs: jsFile,
      } as any,
      baseline,
      {
        timeoutMs: 100,
        pollMs: 1,
      } as CliOptions,
      {
        ensureRunning() {},
      } as any,
      Date.now(),
      async () => {
        attempts += 1
        return attempts >= 2
      },
    )

    expect(elapsed).toBeGreaterThanOrEqual(0)
    expect(attempts).toBeGreaterThanOrEqual(2)
  })

  it('allows output file update waits to pass via semantic fallback when optional exact files are missing', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-watch-output-missing-'))
    tempDirs.push(tempDir)
    const outputFile = path.join(tempDir, 'custom-tab-bar.wxss')
    let attempts = 0

    const elapsed = await waitForOutputFilesUpdated(
      {
        label: 'demo/mpx-tailwindcss-v4',
      } as any,
      [outputFile],
      new Map([[outputFile, Date.now()]]),
      {
        timeoutMs: 100,
        pollMs: 1,
      } as CliOptions,
      {
        ensureRunning() {},
      } as any,
      Date.now(),
      async () => {
        attempts += 1
        return attempts >= 2
      },
    )

    expect(elapsed).toBeGreaterThanOrEqual(0)
    expect(attempts).toBeGreaterThanOrEqual(2)
  })

  it('waits for watch compile success to settle before advancing', async () => {
    let lastCompileSuccessAt = 0
    const phaseStartedAt = Date.now()
    setTimeout(() => {
      lastCompileSuccessAt = Date.now()
    }, 5)

    const elapsed = await waitForCompileSettled(
      {
        label: 'demo/taro-vite-react-tailwindcss-v3',
      } as any,
      {
        timeoutMs: 1_200,
        pollMs: 5,
      } as CliOptions,
      {
        ensureRunning() {},
        lastCompileSuccessAt: () => lastCompileSuccessAt,
      } as any,
      phaseStartedAt,
    )

    expect(elapsed).toBeGreaterThanOrEqual(0)
    expect(lastCompileSuccessAt).toBeGreaterThan(phaseStartedAt)
  })

  it('allows compile settle to fall back to stable output mtimes when success logs are missing', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-watch-compile-settle-'))
    tempDirs.push(tempDir)
    const wxmlFile = path.join(tempDir, 'index.wxml')
    const jsFile = path.join(tempDir, 'index.js')
    await writeFilePreserveEol(wxmlFile, '<view />', '<view />')
    await writeFilePreserveEol(jsFile, 'Page({})', 'Page({})')
    const phaseStartedAt = Date.now()

    await new Promise(resolve => setTimeout(resolve, 20))
    await writeFilePreserveEol(wxmlFile, '<view>ready</view>', '<view />')
    await writeFilePreserveEol(jsFile, 'Page({ data: 1 })', 'Page({})')

    const elapsed = await waitForCompileSettled(
      {
        label: 'demo/weapp-vite-tailwindcss-v3',
        outputWxml: wxmlFile,
        outputJs: jsFile,
      } as any,
      {
        timeoutMs: 2_000,
        pollMs: 20,
      } as CliOptions,
      {
        ensureRunning() {},
        lastCompileSuccessAt: () => 0,
      } as any,
      phaseStartedAt,
    )

    expect(elapsed).toBeGreaterThanOrEqual(0)
  })

  it('does not treat stale pre-start outputs as initially ready', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-watch-stale-ready-'))
    tempDirs.push(tempDir)
    const wxmlFile = path.join(tempDir, 'index.wxml')
    const jsFile = path.join(tempDir, 'index.js')
    await writeFilePreserveEol(wxmlFile, '<view>stale</view>', '<view />')
    await writeFilePreserveEol(jsFile, 'Page({ stale: true })', 'Page({})')
    await new Promise(resolve => setTimeout(resolve, 20))
    const sessionStartedAt = Date.now()
    let compileSuccessAt = 0
    setTimeout(async () => {
      await writeFilePreserveEol(wxmlFile, '<view>ready</view>', '<view />')
      await writeFilePreserveEol(jsFile, 'Page({ ready: true })', 'Page({})')
      compileSuccessAt = Date.now()
    }, 20)

    const elapsed = await waitForOutputsReady(
      {
        label: 'demo/weapp-vite-tailwindcss-v3',
        outputWxml: wxmlFile,
        outputJs: jsFile,
      } as any,
      {
        timeoutMs: 2_000,
        pollMs: 20,
      } as CliOptions,
      {
        ensureRunning() {},
        lastCompileSuccessAt: () => compileSuccessAt,
      } as any,
      sessionStartedAt,
    )

    expect(elapsed).toBeGreaterThanOrEqual(20)
  })

  it('requires a stable post-start output update during warmup when compile success is mandatory', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-watch-warmup-'))
    tempDirs.push(tempDir)
    const wxmlFile = path.join(tempDir, 'index.wxml')
    const jsFile = path.join(tempDir, 'index.js')
    await writeFilePreserveEol(wxmlFile, '<view />', '<view />')
    await writeFilePreserveEol(jsFile, 'Page({})', 'Page({})')
    const sessionStartedAt = Date.now()

    await new Promise(resolve => setTimeout(resolve, 20))
    await writeFilePreserveEol(wxmlFile, '<view>ready</view>', '<view />')
    await writeFilePreserveEol(jsFile, 'Page({ data: 1 })', 'Page({})')

    const elapsed = await waitForInitialWarmup(
      {
        label: 'demo/weapp-vite-tailwindcss-v3',
        requireInitialCompileSuccess: true,
        outputWxml: wxmlFile,
        outputJs: jsFile,
      } as any,
      {
        timeoutMs: 2_000,
        pollMs: 20,
      } as CliOptions,
      {
        ensureRunning() {},
        lastCompileSuccessAt: () => 0,
      } as any,
      sessionStartedAt,
    )

    expect(elapsed).toBeGreaterThanOrEqual(0)
  })

  it('asserts text presence and absence', () => {
    expect(() => assertContains('alpha beta', 'alpha', 'contains')).not.toThrow()
    expect(() => assertNotContains('alpha beta', 'gamma', 'not contains')).not.toThrow()
    expect(() => assertContainsOneOf('alpha beta', ['beta', 'gamma'], 'one of')).not.toThrow()
    expect(() => assertContains('alpha beta', 'gamma', 'contains')).toThrow('contains')
    expect(() => assertNotContains('alpha beta', 'beta', 'not contains')).toThrow('not contains')
    expect(() => assertContainsOneOf('alpha beta', ['gamma', 'delta'], 'one of')).toThrow('one of')
  })

  it('handles CSS and anchor based text mutations', () => {
    expect(escapeRegExp('.foo[bar]?')).toBe('\\.foo\\[bar\\]\\?')
    expect(findCssRuleBody('.foo { color: red; }', '.foo')).toContain('color: red;')
    expect(normalizeCssDeclaration(' Color : RGB(1, 2, 3) ; ')).toBe('color:rgb(1,2,3);')

    expect(insertBeforeClosingTag('<view>\n</view>', '</view>', '<text />')).toContain('<text />')
    expect(insertBeforeAnchor('return ()', '()', '<body>')).toBe('return <body>()')
    expect(replaceExactSnippet('const foo = 1', 'foo = 1', 'bar = 2')).toBe('const bar = 2')
    expect(appendTrailingSnippet('const a = 1', 'const b = 2')).toBe('const a = 1\nconst b = 2\n')

    const styleSnippet = createStyleRuleSnippet({
      marker: 'watch-1234567',
      styleNeedle: '.watch-style-marker',
      outputNeedles: ['.watch-style-marker'],
      rollbackNeedles: ['.watch-style-marker'],
      applyUtilities: ['font-bold', 'text-center'],
      expectedApplyDeclarations: [],
      functionNeedle: '.watch-style-marker-theme',
      functionDeclarations: ['padding: theme(\'spacing.2\');'],
      expectedFunctionDeclarations: [],
      forbiddenFunctionFragments: [],
    })

    expect(styleSnippet).toContain('@apply font-bold text-center;')
    expect(styleSnippet).toContain('.watch-style-marker-theme')
    expect(styleSnippet).toContain('padding: theme(\'spacing.2\');')
    expect(styleSnippet).toContain('color: #234567;')
  })

  it('mutates script, tsx and vue sources for watch markers', () => {
    const pageSource = `Page({
  data: {
    count: 1,
  },
})`
    const pageMutated = mutateScriptByDataAnchor(pageSource, '  data: {', payload)
    expect(pageMutated).toContain(`${payload.classVariableName}: '${payload.classLiteral}'`)
    expect(pageMutated).toContain(`__twWatchScriptMarker: '${payload.marker}'`)

    const tsxSource = `export default function Page() {
  return (
    <>
    </>
  )
}`
    expect(mutateTsxScriptByReturnAnchor(tsxSource, payload)).toContain(`<View className={${payload.classVariableName}}>${payload.marker}-script</View>`)
    expect(mutateTsxScriptByReturnAnchorWithCommentCarrier(tsxSource, payload)).toContain(`${payload.marker}-script-comment`)

    const vueSource = `<template>
  <view class="content">
    <view>demo</view>
  </view>
</template>

<script setup lang="ts">
const classArray = [
  'text-sm',
]
const title = ref('demo')
</script>

<style>
.content {}
</style>`

    const arrayMutated = mutateVueScriptSetupArrayByAnchor(vueSource, 'const classArray = [', payload)
    expect(arrayMutated).toContain(`'${payload.classLiteral}'`)
    expect(arrayMutated).toContain(`'${payload.marker}'`)

    const objectSource = `<template>
  <view class="content">
    <view>demo</view>
  </view>
</template>

<script setup lang="ts">
const bgObj = ref({
  'bg-[#999999]':true
})
</script>`
    const objectMutated = mutateVueScriptSetupObjectKeyByAnchor(objectSource, '\'bg-[#999999]\':true', payload)
    expect(objectMutated).toContain('\'text-[#123456]\':true')
    expect(objectMutated).toContain('\'bg-[#0f0f0f]\':true')
    expect(objectMutated).not.toContain('\'bg-[#999999]\':true')

    const commentCarrierMutated = mutateVueScriptSetupArrayByAnchorWithCommentCarrier(vueSource, 'const classArray = [', payload)
    expect(commentCarrierMutated).toContain(`/* ${payload.classLiteral} */`)
    expect(commentCarrierMutated).toContain('<view hidden>{{ __twWatchScriptCommentMarker }}</view>')

    const objectCommentCarrierMutated = mutateVueScriptSetupObjectKeyByAnchorWithCommentCarrier(objectSource, '\'bg-[#999999]\':true', payload)
    expect(objectCommentCarrierMutated).toContain(`/* ${payload.classLiteral} */`)
    expect(objectCommentCarrierMutated).toContain('<view hidden>{{ __twWatchScriptCommentMarker }}</view>')

    const insertedTemplate = insertIntoVueTemplateRoot(vueSource, '    <view class="tail" />')
    expect(insertedTemplate).toContain('<view class="tail" />')

    const refMutated = mutateVueRefStringLiteral(vueSource, 'title', payload)
    expect(refMutated).toContain(`const title = ref('demo ${payload.classLiteral} ${payload.marker}')`)

    const styleMutated = mutateSfcStyleBlock(vueSource, {
      marker: 'watch-123456',
      styleNeedle: '.watch-style-marker',
      outputNeedles: ['.watch-style-marker'],
      rollbackNeedles: ['.watch-style-marker'],
      applyUtilities: ['font-bold'],
      expectedApplyDeclarations: [],
    })
    expect(styleMutated).toContain('.watch-style-marker')
    expect(styleMutated).toContain('@apply font-bold;')
  })

  it('throws clear errors when anchors are missing', () => {
    expect(() => insertBeforeClosingTag('<view />', '</missing>', '<text />')).toThrow('closing tag </missing> not found')
    expect(() => insertBeforeAnchor('alpha', 'beta', 'gamma')).toThrow('anchor beta not found')
    expect(() => insertIntoVueTemplateRoot('<script setup></script>', '<view />')).toThrow('template block not found')
    expect(() => mutateVueRefStringLiteral(`const title = ref('demo')`, 'missing', payload)).toThrow('vue ref string literal not found')
  })
})

describe('watch-hmr regression summary helpers', () => {
  it('summarizes samples and cases', () => {
    expect(summarizeSamples([])).toEqual({
      count: 0,
      hotUpdateAvgMs: 0,
      hotUpdateMaxMs: 0,
      hotUpdateMinMs: 0,
      rollbackAvgMs: 0,
      rollbackMaxMs: 0,
      rollbackMinMs: 0,
    })

    const cases = [
      createCase('weapp-vite-tailwindcss-v3', 'demo', 30, 40),
      createCase('weapp-vite-tailwindcss-v4', 'demo', 50, 70),
    ]

    expect(summarizeMetrics(cases)).toEqual({
      count: 2,
      hotUpdateAvgMs: 40,
      hotUpdateMaxMs: 50,
      hotUpdateMinMs: 30,
      rollbackAvgMs: 55,
      rollbackMaxMs: 70,
      rollbackMinMs: 40,
    })

    expect(summarizeMetricsByRound(cases)['complex-corpus']).toMatchObject({
      count: 2,
      hotUpdateAvgMs: 40,
      rollbackAvgMs: 55,
    })
    expect(summarizeMetricsByGroup(cases).demo).toMatchObject({ count: 2, hotUpdateAvgMs: 40 })
    expect(summarizeMetricsByProject(cases)['demo-weapp-vite-tailwindcss-v3']).toMatchObject({ count: 1, rollbackAvgMs: 40 })
  })

  it('summarizes mutation kinds using preferred rounds', () => {
    const cases = [createCase('weapp-vite-tailwindcss-v3', 'demo', 30, 40)]
    const byCase = summarizeMutationKindAcrossCases(cases)
    const byMutation = summarizeMutationMetricsByKind(cases[0].mutationMetrics)

    expect(byCase.template).toMatchObject({ count: 1, hotUpdateAvgMs: 30, rollbackAvgMs: 40 })
    expect(byMutation.script).toMatchObject({ count: 1, hotUpdateAvgMs: 30, rollbackAvgMs: 40 })
    expect(byMutation.style).toMatchObject({ count: 1, hotUpdateAvgMs: 32, rollbackAvgMs: 36 })
    expect(byMutation.content).toMatchObject({ count: 1, hotUpdateAvgMs: 30, rollbackAvgMs: 40 })
  })

  it('resolves report paths and writes report files', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-watch-summary-'))
    tempDirs.push(tempDir)
    const reportFile = 'artifacts/watch-report.json'
    const cases = [createCase('weapp-vite-tailwindcss-v3', 'demo', 30, 40)]
    const options: CliOptions = {
      caseName: 'demo',
      timeoutMs: 2_000,
      pollMs: 20,
      skipBuild: true,
      quietSass: true,
      reportFile,
      maxHotUpdateMs: 100,
    }

    expect(resolveReportPath(tempDir, reportFile)).toBe(path.join(tempDir, reportFile))
    expect(resolveReportPath(tempDir, path.join(tempDir, reportFile))).toBe(path.join(tempDir, reportFile))
    expect(resolveRepositoryRootLabel(tempDir)).toBe(path.basename(tempDir))

    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockReturnValue(true)
    try {
      await writeReport(tempDir, options, cases)
    }
    finally {
      stdoutSpy.mockRestore()
    }

    const reportPath = path.join(tempDir, reportFile)
    const report = JSON.parse(await readFile(reportPath, 'utf8'))

    expect(report.repositoryRoot).toBe(path.basename(tempDir))
    expect(report.options.caseName).toBe('demo')
    expect(report.summary).toMatchObject({ count: 1, hotUpdateAvgMs: 30, rollbackAvgMs: 40 })
    expect(report.summaryByMutationKind.template).toMatchObject({ count: 1, hotUpdateAvgMs: 30 })
  })

  it('builds a CI-facing HMR speed report from watch JSON metrics', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-watch-speed-'))
    tempDirs.push(tempDir)
    const reportFile = 'artifacts/watch-report.json'
    const cases = [createCase('weapp-vite-tailwindcss-v3', 'demo', 30, 40)]
    const options: CliOptions = {
      caseName: 'demo',
      timeoutMs: 2_000,
      pollMs: 20,
      skipBuild: true,
      quietSass: true,
      reportFile,
      maxHotUpdateMs: 100,
    }

    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockReturnValue(true)
    try {
      await writeReport(tempDir, options, cases)
    }
    finally {
      stdoutSpy.mockRestore()
    }

    const reportPath = path.join(tempDir, reportFile)
    const watchReport = JSON.parse(await readFile(reportPath, 'utf8'))
    const samples = collectSpeedSamplesFromReport(watchReport, 'watch-report.json')
    const speedReport = buildSpeedReport([{ file: reportPath, report: watchReport }], '2026-05-14T00:00:00.000Z')
    const markdown = renderSpeedReportMarkdown(speedReport)

    expect(samples.map(item => item.surface)).toEqual(expect.arrayContaining([
      'case-template-preferred',
      'template:complex-corpus',
      'script:complex-corpus',
      'style',
      'content:complex-corpus',
    ]))
    expect(summarizeSpeedSamples(samples)).toMatchObject({
      count: samples.length,
      minMs: 30,
      p50Ms: 30,
      maxMs: 32,
    })
    expect(speedReport.byProject['demo-weapp-vite-tailwindcss-v3']).toMatchObject({ count: samples.length })
    expect(speedReport.bySurface.style).toMatchObject({ count: 1, avgMs: 32 })
    expect(speedReport.slowest[0]).toMatchObject({ surface: 'style', hotUpdateMs: 32 })
    expect(speedReport.maxHotUpdateBudgetMs).toBe(1000)
    expect(speedReport.maxPluginProcessBudgetMs).toBe(500)
    expect(speedReport.preferredHotUpdateTargetMs).toBe(1000)
    expect(speedReport.withinBudgetCount).toBe(samples.length)
    expect(speedReport.withinPluginProcessBudgetCount).toBe(samples.length)
    expect(speedReport.withinPreferredTargetCount).toBe(samples.length)
    expect(markdown).toContain('# e2e-watch HMR 速度报告')
    expect(markdown).toContain('- budget: <=1000ms')
    expect(markdown).toContain('- plugin process budget: <=500ms')
    expect(markdown).toContain('- preferred target: <=1000ms')
    expect(markdown).toContain('Tailwind v3/v4 官方 Vite/Webpack 插件')
  })

  it('applies hot-update budget checks to nested HMR samples', () => {
    const metrics = createCase('weapp-vite-tailwindcss-v3', 'demo', 30, 40)
    const scriptMetric = metrics.mutationMetrics.find(
      mutation => mutation.mutationKind === 'script',
    )
    if (!scriptMetric || scriptMetric.mutationKind === 'style') {
      throw new Error('missing script metric')
    }

    scriptMetric.addedClassHmr = {
      markerBefore: 'before',
      markerAfter: 'after',
      classLiteralBefore: 'text-[#123456]',
      classLiteralAfter: 'text-[#123456] bg-[#654321]',
      addedClassLiteral: 'bg-[#654321]',
      addedClassTokens: ['bg-[#654321]'],
      addedEscapedClasses: ['bg-_b_h654321_B'],
      verifiedAddedEscapedClasses: ['bg-_b_h654321_B'],
      minRequiredEscapedClasses: 1,
      hotUpdateOutputMs: 2600,
      hotUpdateEffectiveMs: 2500,
      hotUpdatePluginProcessMs: 25,
      hotUpdatePluginProcessSamples: [pluginProcessSample],
      rollbackOutputMs: 35,
      rollbackEffectiveMs: 30,
      rollbackPluginProcessMs: 20,
      rollbackPluginProcessSamples: [{ ...pluginProcessSample, durationMs: 20 }],
    }

    expect(() => assertHotUpdateBudget(metrics, {
      caseName: 'demo',
      timeoutMs: 2000,
      pollMs: 20,
      skipBuild: true,
      quietSass: true,
      maxHotUpdateMs: 1000,
    })).toThrow('script:added-class hot update exceeded budget: 2500ms > 1000ms')
  })

  it('applies weapp-tailwindcss processing budget checks to nested HMR samples', () => {
    const metrics = createCase('weapp-vite-tailwindcss-v3', 'demo', 30, 40)
    const scriptMetric = metrics.mutationMetrics.find(
      mutation => mutation.mutationKind === 'script',
    )
    if (!scriptMetric || scriptMetric.mutationKind === 'style') {
      throw new Error('missing script metric')
    }
    scriptMetric.rounds[0].hotUpdatePluginProcessMs = 520

    expect(() => assertPluginProcessBudget(metrics, {
      caseName: 'demo',
      timeoutMs: 2000,
      pollMs: 20,
      skipBuild: true,
      quietSass: true,
      maxPluginProcessMs: 500,
    })).toThrow('template:complex-corpus:hot-update weapp-tailwindcss processing exceeded budget: 520ms > 500ms')
  })

  it('lets Taro Vite cases override the plugin processing budget for restart fallback runs', () => {
    const metrics = createCase('taro-vite-react-tailwindcss-v4', 'demo', 30, 40)
    metrics.maxPluginProcessMs = 800
    const templateMetric = metrics.mutationMetrics.find(
      mutation => mutation.mutationKind === 'template',
    )
    if (!templateMetric || templateMetric.mutationKind === 'style') {
      throw new Error('missing template metric')
    }
    templateMetric.rounds[0].hotUpdatePluginProcessMs = 620

    expect(() => assertPluginProcessBudget(metrics, {
      caseName: 'demo',
      timeoutMs: 2000,
      pollMs: 20,
      skipBuild: true,
      quietSass: true,
      maxPluginProcessMs: 500,
    })).not.toThrow()
  })
})

describe('watch-hmr regression cases', () => {
  it('defines issue33 high-risk arbitrary CRUD rounds for js literal hot updates', () => {
    const [roundConfig] = buildIssue33HighRiskRoundConfigs()

    expect(roundConfig).toBeDefined()
    expect(roundConfig?.name).toBe('issue33-arbitrary')
    expect(roundConfig?.buildClassTokens('seed')).toEqual([...ISSUE33_ADD_CLASS_TOKENS])
    expect(roundConfig?.buildModifyClassTokens?.('seed')).toEqual([...ISSUE33_MODIFY_CLASS_TOKENS])
  })

  it('keeps the uni-app Vue3 Vite content mutation anchored to the current page fixture', () => {
    const uniAppCase = buildDemoExtendedCases('/repo').find(watchCase => watchCase.name === 'uni-app-vite-tailwindcss-v3')
    const contentMutation = uniAppCase?.contentMutation

    expect(contentMutation).toBeDefined()
    expect(contentMutation?.mutate(
      [
        'const numClassObj = ref({',
        '  \'2xl:text-[red]\': true',
        '})',
      ].join('\n'),
      payload,
    )).toContain('\'text-[#123456]\':true')
  })

  it('keeps enough fresh class candidates after watch mode accumulates earlier classes', () => {
    const [roundConfig] = buildHexScriptRoundConfigs()
    if (!roundConfig) {
      throw new Error('missing hex script round config')
    }

    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1234567890)
    try {
      const staleEscapedClasses: string[] = []
      for (let attempt = 0; attempt < 24; attempt += 1) {
        const seed = `${attempt.toString().padStart(2, '0')}${((attempt * 7) % 100).toString().padStart(2, '0')}90`
        staleEscapedClasses.push(...roundConfig.buildClassTokens(seed).map(token => replaceWxml(token)))
      }

      const scenario = createClassMutationScenario(
        {
          name: 'taro-webpack-react-tailwindcss-v4',
          label: 'demo/taro-webpack-react-tailwindcss-v4',
        } as WatchCase,
        'script',
        {
          sourceFile: 'index.tsx',
          verifyEscapedIn: ['js'],
          mutate(source, payload) {
            return `${source}\nconst ${payload.classVariableName} = '${payload.classLiteral}'\n`
          },
        },
        'export default function Page() {}',
        '',
        '',
        staleEscapedClasses.join('\n'),
        '__twWatchClass',
        roundConfig,
      )

      expect(scenario.classTokens).toEqual(roundConfig.buildClassTokens('246890'))
    }
    finally {
      nowSpy.mockRestore()
    }
  })

  it('uses complex script round tokens for realistic dynamic class hot updates', () => {
    const [baselineRound, complexRound, hexRound] = buildHexScriptRoundConfigs()

    expect(baselineRound?.buildClassTokens('123456').length).toBeGreaterThan(6)
    expect(complexRound?.buildClassTokens('123456')).toEqual(expect.arrayContaining([
      '!mt-2',
      '-translate-y-1',
      'data-[state=open]:opacity-100',
      'supports-[display:grid]:grid',
      '[mask-type:luminance]',
    ]))
    expect(complexRound?.buildClassTokens('123456').some(token => token.startsWith('w-[calc(100%_-_'))).toBe(true)
    expect(complexRound?.buildClassTokens('123456').some(token => token.startsWith('grid-cols-[200rpx_minmax(900rpx,_1fr)_'))).toBe(true)
    expect(hexRound?.buildClassTokens('12345678').some(token => token.startsWith('shadow-[0_'))).toBe(true)
  })

  it('keeps tailwind v4 js content rounds to tokens that produce css from script scanning', () => {
    const [, complexRound] = buildTailwindV4JsContentRoundConfigs()
    const tokens = complexRound?.buildClassTokens('123456') ?? []

    expect(tokens).toEqual(expect.arrayContaining([
      '!mt-2',
      '-translate-y-1',
      'data-[state=open]:opacity-100',
      '[mask-type:luminance]',
    ]))
    expect(tokens).not.toEqual(expect.arrayContaining([
      '[@supports(display:grid)]:grid',
      'supports-[backdrop-filter:blur(2px)]:backdrop-blur-[2px]',
      '[@media(any-hover:hover){&:hover}]:opacity-100',
      'supports-[display:grid]:grid',
    ]))
  })

  it('uses tailwind v4 js content rounds for gulp v4 script mutations', () => {
    const gulpV4Case = buildDemoBaseCases('/repo').find(watchCase => watchCase.name === 'gulp-tailwindcss-v4')
    const [, complexRound] = gulpV4Case?.scriptMutation.roundConfigs ?? []

    expect(complexRound?.name).toBe('complex-corpus')
    expect(complexRound?.buildClassTokens('123456')).not.toContain('[@media(any-hover:hover){&:hover}]:opacity-100')
  })

  it('uses tailwind v4 js content rounds for mpx v4 script mutations', () => {
    const mpxV4Case = buildDemoExtendedCases('/repo').find(watchCase => watchCase.name === 'mpx-tailwindcss-v4')
    const [, complexRound] = mpxV4Case?.scriptMutation.roundConfigs ?? []

    expect(complexRound?.name).toBe('complex-corpus')
    expect(complexRound?.buildClassTokens('123456')).not.toContain('[@media(any-hover:hover){&:hover}]:opacity-100')
    expect(complexRound?.buildClassTokens('123456')).not.toContain('[@supports(display:grid)]:grid')
  })

  it('tracks taro webpack v4 style outputs in both page and app wxss candidates', () => {
    const taroWebpackCase = buildDemoExtendedCases('/repo').find(item => item.name === 'taro-webpack-react-tailwindcss-v4')

    expect(taroWebpackCase?.name).toBe('taro-webpack-react-tailwindcss-v4')
    expect(taroWebpackCase?.outputStyleCandidates).toEqual([
      path.resolve('/repo', 'demo/taro-webpack-react-tailwindcss-v4/dist/pages/index/index.wxss'),
      path.resolve('/repo', 'demo/taro-webpack-react-tailwindcss-v4/dist/app.wxss'),
    ])
    expect(taroWebpackCase?.globalStyleCandidates).toEqual([
      path.resolve('/repo', 'demo/taro-webpack-react-tailwindcss-v4/dist/pages/index/index.wxss'),
      path.resolve('/repo', 'demo/taro-webpack-react-tailwindcss-v4/dist/app.wxss'),
    ])
  })

  it('registers the new tailwindcss v4 watch cases with expected outputs', () => {
    const extendedCases = buildDemoExtendedCases('/repo')
    const baseCases = buildDemoBaseCases('/repo')
    const uniViteCase = extendedCases.find(item => item.name === 'uni-app-vite-tailwindcss-v3')
    const mpxV4Case = extendedCases.find(item => item.name === 'mpx-tailwindcss-v4')
    const viteNativeCase = baseCases.find(item => item.name === 'weapp-vite-tailwindcss-v4')

    expect(uniViteCase?.outputWxml).toBe(
      path.resolve('/repo', 'demo/uni-app-vite-tailwindcss-v3/dist/build/mp-weixin/pages/index/index.wxml'),
    )
    expect(uniViteCase?.globalStyleCandidates).toEqual([
      path.resolve('/repo', 'demo/uni-app-vite-tailwindcss-v3/dist/build/mp-weixin/pages/index/index.wxss'),
      path.resolve('/repo', 'demo/uni-app-vite-tailwindcss-v3/dist/build/mp-weixin/app.wxss'),
    ])

    expect(mpxV4Case?.outputWxml).toBe(
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/custom-tab-bar/index.wxml'),
    )
    expect(mpxV4Case?.devScript).toBe('dev:e2e-watch')
    expect(mpxV4Case?.env).toMatchObject({
      CHOKIDAR_INTERVAL: '50',
      CHOKIDAR_USEPOLLING: '1',
      WATCHPACK_POLLING: '50',
    })
    expect(mpxV4Case?.initialMutationDelayMs).toBe(15_000)
    expect(mpxV4Case?.styleMutation.sourceFile).toBe(
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/src/pages/component/index.mpx'),
    )
    expect(mpxV4Case?.styleMutation.verifyOutputCandidates).toEqual([
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/pages/component/index.wxss'),
    ])
    expect(mpxV4Case?.styleMutation.validateApply).toBe(false)
    const mpxV4SubPackage = mpxV4Case?.subPackageMutations?.find(item => item.root === 'sub-normal')
    expect(mpxV4SubPackage?.styleMutation.validateApply).toBe(false)
    expect(mpxV4SubPackage?.styleMutation.validateFunction).toBe(false)
    expect(mpxV4SubPackage?.outputStyleCandidates).toEqual([
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/sub-normal/pages/index.js'),
    ])
    expect(mpxV4SubPackage?.globalStyleCandidates).toEqual([
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/sub-normal/pages/index.wxss'),
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/sub-normal/styles/*.wxss'),
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/styles/*.wxss'),
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/app.wxss'),
    ])

    expect(mpxV4Case?.outputStyleCandidates).toEqual([
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/app.wxss'),
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/custom-tab-bar/index.wxss'),
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/styles/app*.wxss'),
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/styles/index*.wxss'),
    ])
    expect(mpxV4Case?.globalStyleCandidates).toEqual([
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/app.wxss'),
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/styles/app*.wxss'),
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/styles/index*.wxss'),
    ])

    expect(viteNativeCase?.outputJs).toBe(
      path.resolve('/repo', 'demo/weapp-vite-tailwindcss-v4/dist/pages/index/index.js'),
    )
    expect(viteNativeCase?.outputStyleCandidates).toEqual([
      path.resolve('/repo', 'demo/weapp-vite-tailwindcss-v4/dist/pages/index/index.wxss'),
      path.resolve('/repo', 'demo/weapp-vite-tailwindcss-v4/dist/app.wxss'),
    ])
  })

  it('pins taro-based watch cases to strict taro build mode', () => {
    const cases = [
      ...buildDemoBaseCases('/repo'),
      ...buildDemoExtendedCases('/repo'),
    ].filter(watchCase => watchCase.name.includes('taro'))

    expect(cases.length).toBeGreaterThan(0)

    for (const watchCase of cases) {
      expect(watchCase.env?.TARO_BUILD_STRICT).toBe('1')
    }
  })

  it('keeps Taro Vite watch cases on restart fallback compatible budgets', () => {
    const cases = buildDemoExtendedCases('/repo').filter(watchCase => watchCase.name.startsWith('taro-vite-'))

    expect(cases.map(watchCase => watchCase.name).sort()).toEqual([
      'taro-vite-react-tailwindcss-v3',
      'taro-vite-react-tailwindcss-v4',
      'taro-vite-vue3-tailwindcss-v3',
      'taro-vite-vue3-tailwindcss-v4',
    ])

    for (const watchCase of cases) {
      expect(watchCase.env).not.toHaveProperty('TARO_E2E_WATCH_NATIVE')
      expect(watchCase.maxPluginProcessMs).toBe(800)
    }
  })

  it('covers literal refresh content mutations for every demo case', () => {
    const cases = [
      ...buildDemoBaseCases('/repo'),
      ...buildDemoExtendedCases('/repo'),
    ]
    const contentMutationOptionalCases = new Set(['gulp-tailwindcss-v3', 'gulp-tailwindcss-v4'])

    expect(cases.length).toBeGreaterThan(0)

    for (const watchCase of cases) {
      if (contentMutationOptionalCases.has(watchCase.name)) {
        expect(watchCase.contentMutation, `${watchCase.name} keeps template/script/style hot-update coverage`).toBeUndefined()
        continue
      }

      expect(
        watchCase.contentMutation,
        `${watchCase.name} should define content mutation for existing js class literal refresh`,
      ).toBeDefined()

      const contentMutation = watchCase.contentMutation
      if (!contentMutation) {
        continue
      }

      const expectedCarrier = contentMutation.sourceFile.endsWith('.wxml') ? 'wxml' : 'js'
      expect(contentMutation.verifyClassLiteralIn).toContain(expectedCarrier)
      expect(contentMutation.forbidBgHexTruncationIn).toContain(expectedCarrier)
      expect(contentMutation.roundConfigs?.length).toBe(1)
      expect(contentMutation.roundConfigs?.[0]?.name).toBe('issue33-arbitrary')
      expect(contentMutation.roundConfigs?.[0]?.buildClassTokens('seed')).toEqual([...ISSUE33_ADD_CLASS_TOKENS])
      expect(contentMutation.roundConfigs?.[0]?.buildModifyClassTokens?.('seed')).toEqual([...ISSUE33_MODIFY_CLASS_TOKENS])
      expect(contentMutation.sourceFile).not.toMatch(/index\.html$/)
      expect(contentMutation.sourceFile).toMatch(/\.(?:js|ts|tsx|vue|mpx|wxml)$/)
    }
  })

  it('registers watch hot-update cases for every demo project including Vue3 variants', () => {
    const cases = [
      ...buildDemoBaseCases('/repo'),
      ...buildDemoExtendedCases('/repo'),
    ]

    expect(cases.map(watchCase => watchCase.name)).toEqual([
      'gulp-tailwindcss-v3',
      'gulp-tailwindcss-v4',
      'taro-webpack-react-tailwindcss-v3',
      'taro-webpack-vue3-tailwindcss-v3',
      'mpx-tailwindcss-v3',
      'weapp-vite-tailwindcss-v3',
      'weapp-vite-tailwindcss-v4',
      'uni-app-vite-tailwindcss-v3',
      'uni-app-vite-tailwindcss-v4',
      'mpx-tailwindcss-v4',
      'taro-vite-react-tailwindcss-v4',
      'taro-vite-react-tailwindcss-v3',
      'taro-webpack-react-tailwindcss-v4',
      'taro-vite-vue3-tailwindcss-v3',
      'taro-vite-vue3-tailwindcss-v4',
      'taro-webpack-vue3-tailwindcss-v4',
    ])
  })

  it('covers normal and independent subpackage hot updates for every demo watch case', () => {
    const cases = [
      ...buildDemoBaseCases('/repo'),
      ...buildDemoExtendedCases('/repo'),
    ]

    for (const watchCase of cases) {
      expect(watchCase.subPackageMutations?.map(item => item.root).sort(), watchCase.name).toEqual(['sub-independent', 'sub-normal'])
      for (const subPackageMutation of watchCase.subPackageMutations ?? []) {
        expect(subPackageMutation.templateMutation.sourceFile, watchCase.name).toContain(subPackageMutation.root)
        expect(subPackageMutation.styleMutation.sourceFile, watchCase.name).toContain(subPackageMutation.root)
        expect(subPackageMutation.outputWxml, watchCase.name).toContain(subPackageMutation.root)
        expect(subPackageMutation.outputJs, watchCase.name).toContain(subPackageMutation.root)
        expect(subPackageMutation.globalStyleCandidates.length, watchCase.name).toBeGreaterThan(0)
        expect(subPackageMutation.templateMutation.roundConfigs?.map(item => item.name), watchCase.name).toEqual([
          'baseline-arbitrary',
          'complex-corpus',
          'hex-arbitrary',
        ])
      }
      expect(watchCase.subPackageMutations?.find(item => item.root === 'sub-independent')?.independent, watchCase.name).toBe(true)
      expect(watchCase.subPackageMutations?.find(item => item.root === 'sub-normal')?.independent, watchCase.name).toBe(false)
    }
  })

  it('keeps script read-path HMR checks available for every demo case', () => {
    const cases = [
      ...buildDemoBaseCases('/repo'),
      ...buildDemoExtendedCases('/repo'),
    ]

    expect(cases.length).toBeGreaterThan(0)

    for (const watchCase of cases) {
      expect(
        watchCase.scriptMutation,
        `${watchCase.name} should define script mutation for same-class read checks`,
      ).toBeDefined()
      expect(typeof watchCase.scriptMutation.mutate).toBe('function')
    }
  })

  it('uses wildcard style candidates for mpx utility outputs', () => {
    const mpxCase = buildDemoBaseCases('/repo').find(watchCase => watchCase.name === 'mpx-tailwindcss-v3')
    expect(mpxCase?.globalStyleCandidates).toContain(
      path.resolve('/repo', 'demo/mpx-tailwindcss-v3/dist/wx/styles/utilities*.wxss'),
    )
    expect(mpxCase?.env).toMatchObject({
      CHOKIDAR_INTERVAL: '50',
      CHOKIDAR_USEPOLLING: '1',
      WATCHPACK_POLLING: '50',
    })
  })

  it('uses page style mutation for mpx v4 without unsupported @apply or theme checks', () => {
    const mpxV4Case = buildDemoExtendedCases('/repo').find(watchCase => watchCase.name === 'mpx-tailwindcss-v4')
    expect(mpxV4Case).toBeDefined()

    const payload = createStyleMutationPayload(mpxV4Case!)
    expect(mpxV4Case?.styleMutation.sourceFile).toBe(path.resolve('/repo', 'demo/mpx-tailwindcss-v4/src/pages/component/index.mpx'))
    expect(mpxV4Case?.styleMutation.mutate('<style>\n</style>\n', payload)).toContain(payload.styleNeedle)
    expect(payload.applyUtilities).toEqual([])
    expect(payload.expectedApplyDeclarations).toEqual([])
    expect(payload.functionNeedle).toBeUndefined()
    expect(payload.functionDeclarations).toEqual([])
    expect(payload.expectedFunctionDeclarations).toEqual([])
    expect(payload.forbiddenFunctionFragments).toEqual([])
    expect(payload.referenceDirective).toBe('@reference "tailwindcss";')
  })

  it('keeps style mutation validation policy explicit for every demo watch case', () => {
    const applyUnsupportedCases = new Set([
      'mpx-tailwindcss-v4',
      'uni-app-vite-tailwindcss-v4',
      'taro-vite-react-tailwindcss-v4',
      'taro-webpack-react-tailwindcss-v4',
      'weapp-vite-tailwindcss-v4',
    ])
    const functionUnsupportedCases = new Set([
      'mpx-tailwindcss-v4',
      'taro-vite-react-tailwindcss-v4',
      'taro-webpack-react-tailwindcss-v4',
      'weapp-vite-tailwindcss-v4',
    ])
    const referenceRequiredCases = new Set([
      'gulp-tailwindcss-v4',
      'mpx-tailwindcss-v4',
      'uni-app-vite-tailwindcss-v4',
      'taro-vite-react-tailwindcss-v4',
      'taro-webpack-react-tailwindcss-v4',
      'weapp-vite-tailwindcss-v4',
    ])
    const cases = [
      ...buildDemoBaseCases('/repo'),
      ...buildDemoExtendedCases('/repo'),
    ]

    for (const watchCase of cases) {
      const payload = createStyleMutationPayload(watchCase)

      if (applyUnsupportedCases.has(watchCase.name)) {
        expect(payload.applyUtilities, `${watchCase.name} should skip unsupported @apply validation`).toEqual([])
        expect(payload.expectedApplyDeclarations, `${watchCase.name} should skip unsupported @apply declarations`).toEqual([])
      }
      else {
        expect(payload.applyUtilities.length, `${watchCase.name} should validate @apply utilities`).toBeGreaterThan(0)
        expect(payload.expectedApplyDeclarations.length, `${watchCase.name} should validate expanded @apply declarations`).toBeGreaterThan(0)
      }

      if (functionUnsupportedCases.has(watchCase.name)) {
        expect(payload.functionNeedle, `${watchCase.name} should skip unsupported Tailwind function validation`).toBeUndefined()
        expect(payload.functionDeclarations, `${watchCase.name} should not inject unsupported Tailwind functions`).toEqual([])
        expect(payload.expectedFunctionDeclarations, `${watchCase.name} should not expect unsupported Tailwind function declarations`).toEqual([])
        expect(payload.forbiddenFunctionFragments, `${watchCase.name} should not assert unsupported Tailwind function fragments`).toEqual([])
      }
      else {
        expect(payload.functionNeedle, `${watchCase.name} should validate Tailwind function HMR`).toContain('.tw-watch-style-')
        expect(payload.functionDeclarations.length, `${watchCase.name} should inject Tailwind function declarations`).toBeGreaterThan(0)
        expect(payload.expectedFunctionDeclarations.length, `${watchCase.name} should validate resolved Tailwind function declarations`).toBeGreaterThan(0)
        expect(payload.forbiddenFunctionFragments, `${watchCase.name} should forbid unresolved Tailwind functions`).toContain('theme(')
      }

      if (referenceRequiredCases.has(watchCase.name)) {
        expect(payload.referenceDirective, `${watchCase.name} should include Tailwind v4 @reference`).toBe('@reference "tailwindcss";')
      }
      else {
        expect(payload.referenceDirective, `${watchCase.name} should not need Tailwind v4 @reference`).toBeUndefined()
      }
    }
  })

  it('opts out same-class global-style stability for platform-variant watch cases', () => {
    const demoBaseCases = buildDemoBaseCases('/repo')
    const demoExtendedCases = buildDemoExtendedCases('/repo')
    const weappViteCase = demoBaseCases.find(watchCase => watchCase.name === 'weapp-vite-tailwindcss-v3')
    const uniAppVue3ViteCase = demoExtendedCases.find(watchCase => watchCase.name === 'uni-app-vite-tailwindcss-v3')

    expect(weappViteCase?.requireStableGlobalStyleOnSameClassLiteral).toBe(false)
    expect(uniAppVue3ViteCase?.requireStableGlobalStyleOnSameClassLiteral).toBe(false)
  })

  it('does not require initial compile success for weapp-vite powered watch cases with unstable ready logs', () => {
    const demoBaseCases = buildDemoBaseCases('/repo')

    expect(demoBaseCases.find(watchCase => watchCase.name === 'weapp-vite-tailwindcss-v3')?.requireInitialCompileSuccess).toBe(false)
    expect(demoBaseCases.find(watchCase => watchCase.name === 'weapp-vite-tailwindcss-v4')?.requireInitialCompileSuccess).toBe(false)
  })

  it('prebuilds the weapp-vite demo before watch so dev hot updates start from complete outputs', () => {
    const demoBaseCases = buildDemoBaseCases('/repo')

    expect(demoBaseCases.find(watchCase => watchCase.name === 'weapp-vite-tailwindcss-v3')?.initialBuildScript).toBe('build')
  })

  it('filters platform-specific unstable watch cases from grouped runs', () => {
    const cases = buildCases('/repo')

    const darwinCases = filterCasesForPlatform(cases, 'darwin')
    expect(darwinCases).toEqual(cases)

    const win32Cases = filterCasesForPlatform(cases, 'win32')
    expect(win32Cases).toEqual(cases)

    const win32DemoCases = pickCases(win32Cases, 'demo')
    expect(win32DemoCases.every(watchCase => watchCase.group === 'demo')).toBe(true)
    expect(win32DemoCases.find(watchCase => watchCase.name === 'uni-app-vite-tailwindcss-v3')).toBeDefined()
  })

  it('keeps issue33 and Vue3 watch cases in macOS and Windows CI matrices', async () => {
    const workflowSource = await readFile(
      path.resolve(__dirname, '../../../.github/workflows/e2e-watch.yml'),
      'utf8',
    )
    const workflow = parse(workflowSource) as {
      jobs?: Record<string, {
        strategy?: {
          matrix?: {
            include?: Array<Record<string, unknown>>
          }
        }
      }>
    }

    const matrixEntries = [
      ...(workflow.jobs?.['pr-quick-gate']?.strategy?.matrix?.include ?? []),
      ...(workflow.jobs?.['nightly-full-regression']?.strategy?.matrix?.include ?? []),
    ]

    const requiredMatrixEntries = [
      { os: 'macos-latest', runner_label: 'macos', watch_case: 'uni-app-vite-tailwindcss-v3', round_profile: 'issue33' },
      { os: 'macos-latest', runner_label: 'macos', watch_case: 'weapp-vite-tailwindcss-v3', round_profile: 'issue33' },
      { os: 'macos-latest', runner_label: 'macos', watch_case: 'taro-vite-react-tailwindcss-v4', round_profile: 'default' },
      { os: 'macos-latest', runner_label: 'macos', watch_case: 'taro-vite-vue3-tailwindcss-v3', round_profile: 'default' },
      { os: 'macos-latest', runner_label: 'macos', watch_case: 'taro-vite-vue3-tailwindcss-v4', round_profile: 'default' },
      { os: 'macos-latest', runner_label: 'macos', watch_case: 'taro-webpack-vue3-tailwindcss-v4', round_profile: 'default' },
      { os: 'windows-latest', runner_label: 'windows', watch_case: 'uni-app-vite-tailwindcss-v3', round_profile: 'issue33' },
      { os: 'windows-latest', runner_label: 'windows', watch_case: 'weapp-vite-tailwindcss-v3', round_profile: 'issue33' },
      { os: 'windows-latest', runner_label: 'windows', watch_case: 'taro-vite-vue3-tailwindcss-v4', round_profile: 'default' },
    ]

    for (const entry of requiredMatrixEntries) {
      expect(matrixEntries).toContainEqual(expect.objectContaining(entry))
    }
  })

  it('keeps watch plugin processing budget strict while retry settings stay explicit', async () => {
    const workflowSource = await readFile(
      path.resolve(__dirname, '../../../.github/workflows/e2e-watch.yml'),
      'utf8',
    )
    const workflow = parse(workflowSource) as {
      jobs?: Record<string, {
        steps?: Array<Record<string, unknown>>
      }>
    }

    const runSteps = [
      ...(workflow.jobs?.['pr-quick-gate']?.steps ?? []),
      ...(workflow.jobs?.['nightly-full-regression']?.steps ?? []),
    ].filter(step => typeof step.name === 'string' && step.name.startsWith('Run e2e watch suite'))

    expect(runSteps.length).toBe(2)
    for (const step of runSteps) {
      const env = step.env as Record<string, string> | undefined
      expect(env?.E2E_WATCH_MAX_PLUGIN_PROCESS_MS).toBe("${{ matrix.watch_max_plugin_process_ms || '500' }}")
      expect(env?.E2E_WATCH_MAX_ATTEMPTS).toBe("${{ matrix.watch_max_attempts || '2' }}")
      expect(env?.NODE_OPTIONS).toBe('--max-old-space-size=6144')
    }
  })
})
