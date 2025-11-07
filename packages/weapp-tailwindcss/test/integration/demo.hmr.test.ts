import type { AppType, UserDefinedOptions } from '@/types'
import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { getCompilerContext } from '@/context'
import { collectRuntimeClassSet, createTailwindPatchPromise } from '@/tailwindcss/runtime'

interface DemoCase {
  title: string
  project: string
  entry: string
  marker: string
  closingTag: string
  appType?: AppType
  resolveOptions?: (projectRoot: string) => Partial<UserDefinedOptions>
  makeSnippet: (marker: string) => string
}

const demoRoot = path.resolve(__dirname, '../../../../demo')

const cases: DemoCase[] = [
  {
    title: 'uni-app',
    project: 'uni-app',
    entry: 'src/pages/index/index.vue',
    marker: 'text-[#aa1101]',
    closingTag: '</template>',
    appType: 'uni-app',
    makeSnippet: marker => `  <view class="${marker}">hmr-test</view>\n`,
  },
  {
    title: 'uni-app-tailwindcss-v4',
    project: 'uni-app-tailwindcss-v4',
    entry: 'src/pages/index/index.vue',
    marker: 'text-[#aa1102]',
    closingTag: '</template>',
    appType: 'uni-app-vite',
    resolveOptions: root => ({
      cssEntries: [
        path.resolve(root, 'src/main.css'),
        path.resolve(root, 'src/common.css'),
      ],
    }),
    makeSnippet: marker => `  <view class="${marker}">hmr-test</view>\n`,
  },
  {
    title: 'uni-app-vue3-vite',
    project: 'uni-app-vue3-vite',
    entry: 'src/pages/index/index.vue',
    marker: 'text-[#0f835c]',
    closingTag: '</template>',
    appType: 'uni-app-vite',
    makeSnippet: marker => `  <view class="${marker}">hmr-test</view>\n`,
  },
  {
    title: 'uni-app-webpack-tailwindcss-v4',
    project: 'uni-app-webpack-tailwindcss-v4',
    entry: 'src/pages/index/index.vue',
    marker: 'text-[#aa1103]',
    closingTag: '</template>',
    appType: 'uni-app',
    makeSnippet: marker => `  <view class="${marker}">hmr-test</view>\n`,
  },
  {
    title: 'uni-app-webpack5',
    project: 'uni-app-webpack5',
    entry: 'src/pages/index/index.vue',
    marker: 'text-[#aa1104]',
    closingTag: '</template>',
    appType: 'uni-app',
    makeSnippet: marker => `  <view class="${marker}">hmr-test</view>\n`,
  },
  {
    title: 'uni-app-x-hbuilderx-tailwindcss4',
    project: 'uni-app-x-hbuilderx-tailwindcss4',
    entry: 'pages/index/index.uvue',
    marker: 'text-[#aa1105]',
    closingTag: '</template>',
    appType: 'uni-app-vite',
    resolveOptions: root => ({
      uniAppX: true,
      cssEntries: [path.resolve(root, 'main.css')],
    }),
    makeSnippet: marker => `  <view class="${marker}">hmr-test</view>\n`,
  },
  {
    title: 'uni-app-x-hbuilderx-tailwindcss3',
    project: 'uni-app-x-hbuilderx-tailwindcss3',
    entry: 'pages/index/index.uvue',
    marker: 'text-[#aa1106]',
    closingTag: '</template>',
    appType: 'uni-app-vite',
    resolveOptions: () => ({
      uniAppX: true,
    }),
    makeSnippet: marker => `  <view class="${marker}">hmr-test</view>\n`,
  },
  {
    title: 'taro-app',
    project: 'taro-app',
    entry: 'src/pages/index/index.tsx',
    marker: 'text-[#aa1107]',
    closingTag: '</>',
    appType: 'taro',
    makeSnippet: marker => `      <View className='${marker}'>hmr-test</View>\n`,
  },
  {
    title: 'taro-app-vite',
    project: 'taro-app-vite',
    entry: 'src/pages/index/index.tsx',
    marker: 'text-[#aa1108]',
    closingTag: '</View>',
    appType: 'taro',
    makeSnippet: marker => `      <View className='${marker}'>hmr-test</View>\n`,
  },
  {
    title: 'taro-vite-tailwindcss-v4',
    project: 'taro-vite-tailwindcss-v4',
    entry: 'src/pages/index/index.tsx',
    marker: 'text-[#aa1109]',
    closingTag: '</View>',
    appType: 'taro',
    makeSnippet: marker => `      <View className='${marker}'>hmr-test</View>\n`,
  },
  {
    title: 'taro-vue3-app',
    project: 'taro-vue3-app',
    entry: 'src/pages/index/index.vue',
    marker: 'text-[#aa1110]',
    closingTag: '</template>',
    appType: 'taro',
    makeSnippet: marker => `  <view class="${marker}">hmr-test</view>\n`,
  },
  {
    title: 'taro-webpack-tailwindcss-v4',
    project: 'taro-webpack-tailwindcss-v4',
    entry: 'src/pages/index/index.tsx',
    marker: 'text-[#aa1111]',
    closingTag: '</>',
    appType: 'taro',
    makeSnippet: marker => `      <View className='${marker}'>hmr-test</View>\n`,
  },
  {
    title: 'mpx-app',
    project: 'mpx-app',
    entry: 'src/pages/index.mpx',
    marker: 'text-[#aa1112]',
    closingTag: '</template>',
    appType: 'mpx',
    makeSnippet: marker => `  <view class="${marker}">hmr-test</view>\n`,
  },
  {
    title: 'mpx-tailwindcss-v4',
    project: 'mpx-tailwindcss-v4',
    entry: 'src/pages/index.mpx',
    marker: 'text-[#aa1113]',
    closingTag: '</template>',
    appType: 'mpx',
    makeSnippet: marker => `  <view class="${marker}">hmr-test</view>\n`,
  },
  {
    title: 'native',
    project: 'native',
    entry: 'pages/index/index.wxml',
    marker: 'text-[#aa1114]',
    closingTag: '</scroll-view>',
    appType: 'native',
    makeSnippet: marker => `    <view class="${marker}">hmr-test</view>\n`,
  },
  {
    title: 'native-mina',
    project: 'native-mina',
    entry: 'src/pages/index/index.wxml',
    marker: 'text-[#aa1115]',
    closingTag: '</view>',
    appType: 'native',
    makeSnippet: marker => `  <view class="${marker}">hmr-test</view>\n`,
  },
  {
    title: 'native-ts',
    project: 'native-ts',
    entry: 'miniprogram/pages/index/index.wxml',
    marker: 'text-[#aa1116]',
    closingTag: '</view>',
    appType: 'native',
    makeSnippet: marker => `  <view class="${marker}">hmr-test</view>\n`,
  },
  {
    title: 'rax-app',
    project: 'rax-app',
    entry: 'src/pages/index/index.tsx',
    marker: 'text-[#aa1117]',
    closingTag: '</>',
    appType: 'rax',
    makeSnippet: marker => `      <View className='${marker}'>hmr-test</View>\n`,
  },
  {
    title: 'gulp-app',
    project: 'gulp-app',
    entry: 'src/pages/index/index.wxml',
    marker: 'text-[#aa1118]',
    closingTag: '</view>',
    appType: 'native',
    makeSnippet: marker => `  <view class="${marker}">hmr-test</view>\n`,
  },
]

function insertBeforeClosingTag(source: string, closingTag: string, snippet: string) {
  const index = source.lastIndexOf(closingTag)
  if (index === -1) {
    throw new Error(`closing tag "${closingTag}" not found`)
  }
  const head = source.slice(0, index)
  const tail = source.slice(index)
  const needsNewline = head.length > 0 && !head.endsWith('\n')
  return `${head}${needsNewline ? '\n' : ''}${snippet}${tail}`
}

async function runHotUpdateCase(testCase: DemoCase) {
  const projectRoot = path.resolve(demoRoot, testCase.project)
  const entryPath = path.resolve(projectRoot, testCase.entry)
  const original = await fs.readFile(entryPath, 'utf8')
  if (original.includes(testCase.marker)) {
    throw new Error(`expected ${testCase.marker} to be absent before the test`)
  }

  const extraOptions = testCase.resolveOptions?.(projectRoot) ?? {}
  const options: UserDefinedOptions = {
    tailwindcssBasedir: projectRoot,
    ...(testCase.appType ? { appType: testCase.appType } : {}),
    ...extraOptions,
  }

  const ctx = getCompilerContext(options)

  await createTailwindPatchPromise(ctx.twPatcher)
  const baseline = await collectRuntimeClassSet(ctx.twPatcher, { force: true, skipRefresh: true })
  expect(baseline.has(testCase.marker)).toBe(false)

  const mutated = insertBeforeClosingTag(
    original,
    testCase.closingTag,
    testCase.makeSnippet(testCase.marker),
  )
  await fs.writeFile(entryPath, mutated, 'utf8')

  try {
    await ctx.refreshTailwindcssPatcher({ clearCache: true })
    await createTailwindPatchPromise(ctx.twPatcher)
    const refreshed = await collectRuntimeClassSet(ctx.twPatcher, { force: true, skipRefresh: true })
    expect(refreshed.has(testCase.marker)).toBe(true)
  }
  finally {
    await fs.writeFile(entryPath, original, 'utf8')
    await ctx.refreshTailwindcssPatcher({ clearCache: true })
    await createTailwindPatchPromise(ctx.twPatcher)
    const restored = await collectRuntimeClassSet(ctx.twPatcher, { force: true, skipRefresh: true })
    expect(restored.has(testCase.marker)).toBe(false)
  }
}

describe.skip.sequential('demo hot update integration', () => {
  for (const testCase of cases) {
    it(testCase.title, async () => {
      await runHotUpdateCase(testCase)
    })
  }
})
