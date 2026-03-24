import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { parse } from 'yaml'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildDemoBaseCases,
} from '../scripts/watch-hmr-regression/cases/demo/base'
import {
  buildDemoExtendedCases,
} from '../scripts/watch-hmr-regression/cases/demo/extended'
import {
  buildAppCases,
} from '../scripts/watch-hmr-regression/cases/apps'
import {
  buildIssue33HighRiskRoundConfigs,
} from '../scripts/watch-hmr-regression/cases/round-configs'
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
} from '../scripts/watch-hmr-regression/summary'
import {
  expandOutputFileEntries,
  readJoinedOutputFiles,
  waitForOutputFilesUpdated,
} from '../scripts/watch-hmr-regression/mutations/shared'
import {
  ISSUE33_ADD_CLASS_TOKENS,
  ISSUE33_MODIFY_CLASS_TOKENS,
} from '../scripts/watch-hmr-regression/mutations/tokens'
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
} from '../scripts/watch-hmr-regression/text'
import type {
  CliOptions,
  MutationRoundMetrics,
  WatchCaseMetrics,
  WatchCaseMutationMetrics,
} from '../scripts/watch-hmr-regression/types'

const payload = {
  marker: 'tw-watch-20260313',
  classLiteral: 'text-[#123456] bg-[#0f0f0f]',
  classVariableName: '__twWatchClass',
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
    rollbackOutputMs: rollbackEffectiveMs + 10,
    rollbackEffectiveMs,
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
    rollbackOutputMs: 50,
    rollbackEffectiveMs: 35,
  }
}

function createStyleMutationMetrics(): WatchCaseMutationMetrics {
  return {
    mutationKind: 'style',
    sourceFile: 'style.css',
    outputStyle: 'app.wxss',
    marker: 'style-marker',
    styleNeedle: '.watch-style-marker',
    applyUtilities: ['font-bold'],
    expectedApplyDeclarations: ['font-weight:'],
    hotUpdateOutputMs: 45,
    hotUpdateEffectiveMs: 32,
    rollbackOutputMs: 55,
    rollbackEffectiveMs: 36,
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
    summaryByMutationKind: {},
    initialReadyMs: 25,
    hotUpdateOutputMs: hotUpdateEffectiveMs + 10,
    hotUpdateEffectiveMs,
    rollbackOutputMs: rollbackEffectiveMs + 10,
    rollbackEffectiveMs,
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

  it('waits for predicates and reports timeout failures', async () => {
    let attempt = 0
    const elapsed = await waitFor(
      () => ++attempt > 2,
      {
        timeoutMs: 200,
        pollMs: 1,
        message: 'waited too long',
      },
    )

    expect(attempt).toBe(3)
    expect(elapsed).toBeGreaterThanOrEqual(0)

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
      applyUtilities: ['font-bold', 'text-center'],
      expectedApplyDeclarations: [],
    })

    expect(styleSnippet).toContain('@apply font-bold text-center;')
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
      createCase('weapp-vite', 'demo', 30, 40),
      createCase('vite-native-ts', 'apps', 50, 70),
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
    expect(summarizeMetricsByGroup(cases).demo).toMatchObject({ count: 1, hotUpdateAvgMs: 30 })
    expect(summarizeMetricsByProject(cases)['demo-weapp-vite']).toMatchObject({ count: 1, rollbackAvgMs: 40 })
  })

  it('summarizes mutation kinds using preferred rounds', () => {
    const cases = [createCase('weapp-vite', 'demo', 30, 40)]
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
    const cases = [createCase('weapp-vite', 'demo', 30, 40)]
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
})

describe('watch-hmr regression cases', () => {
  it('defines issue33 high-risk arbitrary CRUD rounds for js literal hot updates', () => {
    const [roundConfig] = buildIssue33HighRiskRoundConfigs()

    expect(roundConfig).toBeDefined()
    expect(roundConfig?.name).toBe('issue33-arbitrary')
    expect(roundConfig?.buildClassTokens('seed')).toEqual([...ISSUE33_ADD_CLASS_TOKENS])
    expect(roundConfig?.buildModifyClassTokens?.('seed')).toEqual([...ISSUE33_MODIFY_CLASS_TOKENS])
  })

  it('tracks taro webpack app style outputs in both page and app wxss candidates', () => {
    const taroWebpackCase = buildAppCases('/repo').find(item => item.name === 'taro-webpack')

    expect(taroWebpackCase?.name).toBe('taro-webpack')
    expect(taroWebpackCase?.outputStyleCandidates).toEqual([
      path.resolve('/repo', 'apps/taro-webpack-tailwindcss-v4/dist/pages/index/index.wxss'),
      path.resolve('/repo', 'apps/taro-webpack-tailwindcss-v4/dist/app.wxss'),
    ])
    expect(taroWebpackCase?.globalStyleCandidates).toEqual([
      path.resolve('/repo', 'apps/taro-webpack-tailwindcss-v4/dist/app.wxss'),
    ])
  })

  it('registers the new tailwindcss v4 watch cases with expected outputs', () => {
    const extendedCases = buildDemoExtendedCases('/repo')
    const appCases = buildAppCases('/repo')
    const uniWebpackCase = extendedCases.find(item => item.name === 'uni-app-webpack-tailwindcss-v4')
    const uniWebpack5Case = extendedCases.find(item => item.name === 'uni-app-webpack5')
    const mpxV4Case = extendedCases.find(item => item.name === 'mpx-tailwindcss-v4')
    const viteNativeCase = appCases.find(item => item.name === 'vite-native')
    const viteNativeSkylineCase = appCases.find(item => item.name === 'vite-native-skyline')
    const viteNativeTsSkylineCase = appCases.find(item => item.name === 'vite-native-ts-skyline')

    expect(uniWebpackCase?.outputWxml).toBe(
      path.resolve('/repo', 'demo/uni-app-webpack-tailwindcss-v4/dist/dev/mp-weixin/pages/index/index.wxml'),
    )
    expect(uniWebpackCase?.outputStyleCandidates).toContain(
      path.resolve('/repo', 'demo/uni-app-webpack-tailwindcss-v4/dist/dev/mp-weixin/common/main.wxss'),
    )

    expect(uniWebpack5Case?.outputWxml).toBe(
      path.resolve('/repo', 'demo/uni-app-webpack5/dist/dev/mp-weixin/pages/index/index.wxml'),
    )
    expect(uniWebpack5Case?.globalStyleCandidates).toEqual([
      path.resolve('/repo', 'demo/uni-app-webpack5/dist/dev/mp-weixin/common/main.wxss'),
      path.resolve('/repo', 'demo/uni-app-webpack5/dist/dev/mp-weixin/app.wxss'),
    ])

    expect(mpxV4Case?.outputWxml).toBe(
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/custom-tab-bar/index.wxml'),
    )
    expect(mpxV4Case?.globalStyleCandidates).toEqual([
      path.resolve('/repo', 'demo/mpx-tailwindcss-v4/dist/wx/styles/app*.wxss'),
    ])

    expect(viteNativeCase?.outputJs).toBe(
      path.resolve('/repo', 'apps/vite-native/dist/pages/index/index.js'),
    )
    expect(viteNativeCase?.outputStyleCandidates).toEqual([
      path.resolve('/repo', 'apps/vite-native/dist/pages/index/index.wxss'),
      path.resolve('/repo', 'apps/vite-native/dist/app.wxss'),
    ])

    expect(viteNativeSkylineCase?.outputWxml).toBe(
      path.resolve('/repo', 'apps/vite-native-skyline/dist/pages/index/index.wxml'),
    )
    expect(viteNativeSkylineCase?.outputStyleCandidates).toEqual([
      path.resolve('/repo', 'apps/vite-native-skyline/dist/pages/index/index.wxss'),
      path.resolve('/repo', 'apps/vite-native-skyline/dist/app.wxss'),
    ])

    expect(viteNativeTsSkylineCase?.outputJs).toBe(
      path.resolve('/repo', 'apps/vite-native-ts-skyline/dist/pages/index/index.js'),
    )
    expect(viteNativeTsSkylineCase?.globalStyleCandidates).toEqual([
      path.resolve('/repo', 'apps/vite-native-ts-skyline/dist/pages/index/index.wxss'),
      path.resolve('/repo', 'apps/vite-native-ts-skyline/dist/app.wxss'),
    ])
  })

  it('pins taro-based watch cases to strict taro build mode', () => {
    const cases = [
      ...buildDemoBaseCases('/repo'),
      ...buildDemoExtendedCases('/repo'),
      ...buildAppCases('/repo'),
    ].filter(watchCase => watchCase.name.includes('taro'))

    expect(cases.length).toBeGreaterThan(0)

    for (const watchCase of cases) {
      expect(watchCase.env?.TARO_BUILD_STRICT).toBe('1')
    }
  })

  it('covers js literal refresh content mutations for every demo and app case', () => {
    const cases = [
      ...buildDemoBaseCases('/repo'),
      ...buildDemoExtendedCases('/repo'),
      ...buildAppCases('/repo'),
    ]

    expect(cases.length).toBeGreaterThan(0)

    for (const watchCase of cases) {
      expect(
        watchCase.contentMutation,
        `${watchCase.name} should define content mutation for existing js class literal refresh`,
      ).toBeDefined()

      const contentMutation = watchCase.contentMutation
      if (!contentMutation) {
        continue
      }

      expect(contentMutation.verifyClassLiteralIn).toContain('js')
      expect(contentMutation.forbidBgHexTruncationIn).toContain('js')
      expect(contentMutation.roundConfigs?.length).toBe(1)
      expect(contentMutation.roundConfigs?.[0]?.name).toBe('issue33-arbitrary')
      expect(contentMutation.roundConfigs?.[0]?.buildClassTokens('seed')).toEqual([...ISSUE33_ADD_CLASS_TOKENS])
      expect(contentMutation.roundConfigs?.[0]?.buildModifyClassTokens?.('seed')).toEqual([...ISSUE33_MODIFY_CLASS_TOKENS])
      expect(contentMutation.sourceFile).not.toMatch(/index\.html$/)
      expect(contentMutation.sourceFile).toMatch(/\.(?:js|ts|tsx|vue|mpx)$/)
    }
  })

  it('keeps script read-path HMR checks available for every demo and app case', () => {
    const cases = [
      ...buildDemoBaseCases('/repo'),
      ...buildDemoExtendedCases('/repo'),
      ...buildAppCases('/repo'),
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
    const mpxCase = buildDemoBaseCases('/repo').find(watchCase => watchCase.name === 'mpx')
    expect(mpxCase?.globalStyleCandidates).toContain(
      path.resolve('/repo', 'demo/mpx-app/dist/wx/styles/utilities*.wxss'),
    )
  })

  it('keeps issue33 watch cases in macOS and Windows CI matrices', async () => {
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
      { os: 'macos-latest', runner_label: 'macos', watch_case: 'uni-app-vue3-vite', round_profile: 'issue33' },
      { os: 'macos-latest', runner_label: 'macos', watch_case: 'weapp-vite', round_profile: 'issue33' },
      { os: 'windows-latest', runner_label: 'windows', watch_case: 'uni-app-vue3-vite', round_profile: 'issue33' },
      { os: 'windows-latest', runner_label: 'windows', watch_case: 'weapp-vite', round_profile: 'issue33' },
    ]

    for (const entry of requiredMatrixEntries) {
      expect(matrixEntries).toContainEqual(expect.objectContaining(entry))
    }
  })
})
