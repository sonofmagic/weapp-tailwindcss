import type { AppType, UserDefinedOptions } from '@/types'
import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { getCompilerContext } from '@/context'
import { collectRuntimeClassSet, createTailwindPatchPromise } from '@/tailwindcss/runtime'

interface SourceMutationCase {
  title: string
  projectRoot: string
  appType: AppType
  resolveOptions?: (projectRoot: string) => Partial<UserDefinedOptions>
  template: {
    entry: string
    closingTag: string
    makeSnippet: (classLiteral: string, marker: string) => string
  }
  script: {
    entry: string
    applyClassLiteral: (source: string, classLiteral: string) => string
  }
}

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

function replaceExact(source: string, anchor: string, replacement: string, label: string) {
  if (!source.includes(anchor)) {
    throw new Error(`${label} not found: ${anchor}`)
  }
  return source.replace(anchor, replacement)
}

function createClassLiteral(seed: string) {
  return `text-[#${seed}] bg-[#${seed.split('').reverse().join('')}]`
}

function getClassTokens(classLiteral: string) {
  return classLiteral.split(/\s+/).filter(Boolean)
}

function assertHasAllTokens(classSet: Set<string>, classLiteral: string, label: string) {
  for (const token of getClassTokens(classLiteral)) {
    expect(classSet.has(token), `${label} should contain ${token}`).toBe(true)
  }
}

function assertMissingAllTokens(classSet: Set<string>, classLiteral: string, label: string) {
  for (const token of getClassTokens(classLiteral)) {
    expect(classSet.has(token), `${label} should not contain ${token}`).toBe(false)
  }
}

async function refreshRuntimeClassSet(options: UserDefinedOptions) {
  const ctx = getCompilerContext(options)
  await ctx.refreshTailwindcssPatcher({ clearCache: true })
  await createTailwindPatchPromise(ctx.twPatcher)
  const classSet = await collectRuntimeClassSet(ctx.twPatcher, {
    force: true,
    skipRefresh: true,
  })
  return { ctx, classSet }
}

async function runMutationLifecycle(
  testCase: SourceMutationCase,
  mutationKind: 'template' | 'script',
) {
  const mutationConfig = testCase[mutationKind]
  const entryPath = path.resolve(testCase.projectRoot, mutationConfig.entry)
  const original = await fs.readFile(entryPath, 'utf8')
  const addClassLiteral = createClassLiteral('aa11bb')
  const modifyClassLiteral = createClassLiteral('cc22dd')
  const addMarker = `${testCase.title}-${mutationKind}-add`
  const modifyMarker = `${testCase.title}-${mutationKind}-modify`
  const extraOptions = testCase.resolveOptions?.(testCase.projectRoot) ?? {}
  const options: UserDefinedOptions = {
    tailwindcssBasedir: testCase.projectRoot,
    appType: testCase.appType,
    ...extraOptions,
  }

  const writeAndCollect = async (nextSource: string) => {
    await fs.writeFile(entryPath, nextSource, 'utf8')
    const { classSet } = await refreshRuntimeClassSet(options)
    return classSet
  }

  const createMutatedSource = (classLiteral: string, marker: string) => {
    if (mutationKind === 'template') {
      return insertBeforeClosingTag(
        original,
        testCase.template.closingTag,
        testCase.template.makeSnippet(classLiteral, marker),
      )
    }
    return testCase.script.applyClassLiteral(original, classLiteral)
  }

  try {
    const baseline = await refreshRuntimeClassSet(options)
    assertMissingAllTokens(baseline.classSet, addClassLiteral, `${testCase.title} ${mutationKind} baseline add`)
    assertMissingAllTokens(baseline.classSet, modifyClassLiteral, `${testCase.title} ${mutationKind} baseline modify`)

    const addedSet = await writeAndCollect(createMutatedSource(addClassLiteral, addMarker))
    assertHasAllTokens(addedSet, addClassLiteral, `${testCase.title} ${mutationKind} add`)

    const modifiedSet = await writeAndCollect(createMutatedSource(modifyClassLiteral, modifyMarker))
    assertHasAllTokens(modifiedSet, modifyClassLiteral, `${testCase.title} ${mutationKind} modify`)
    assertMissingAllTokens(modifiedSet, addClassLiteral, `${testCase.title} ${mutationKind} modify cleanup`)

    const deletedSet = await writeAndCollect(original)
    assertMissingAllTokens(deletedSet, addClassLiteral, `${testCase.title} ${mutationKind} delete add`)
    assertMissingAllTokens(deletedSet, modifyClassLiteral, `${testCase.title} ${mutationKind} delete modify`)

    const rollbackAddedSet = await writeAndCollect(createMutatedSource(addClassLiteral, addMarker))
    assertHasAllTokens(rollbackAddedSet, addClassLiteral, `${testCase.title} ${mutationKind} rollback re-add`)

    const rolledBackSet = await writeAndCollect(original)
    assertMissingAllTokens(rolledBackSet, addClassLiteral, `${testCase.title} ${mutationKind} rollback add`)
    assertMissingAllTokens(rolledBackSet, modifyClassLiteral, `${testCase.title} ${mutationKind} rollback modify`)
  }
  finally {
    await fs.writeFile(entryPath, original, 'utf8')
  }
}

const repositoryRoot = path.resolve(__dirname, '../../../..')

const cases: SourceMutationCase[] = [
  {
    title: 'demo/uni-app-tailwindcss-v4',
    projectRoot: path.resolve(repositoryRoot, 'demo/uni-app-tailwindcss-v4'),
    appType: 'uni-app-vite',
    resolveOptions: root => ({
      cssEntries: [
        path.resolve(root, 'src/main.css'),
        path.resolve(root, 'src/common.css'),
      ],
    }),
    template: {
      entry: 'src/pages/index/index.vue',
      closingTag: '</template>',
      makeSnippet: (classLiteral, marker) => `  <view class="${classLiteral}">${marker}</view>\n`,
    },
    script: {
      entry: 'src/pages/index/index.vue',
      applyClassLiteral(source, classLiteral) {
        return replaceExact(
          source,
          'const className = ref(\'bg-[#0000ff] text-[45rpx] text-white\')',
          `const className = ref('${classLiteral}')`,
          'demo/uni-app-tailwindcss-v4 script anchor',
        )
      },
    },
  },
  {
    title: 'demo/uni-app-x-hbuilderx-tailwindcss4',
    projectRoot: path.resolve(repositoryRoot, 'demo/uni-app-x-hbuilderx-tailwindcss4'),
    appType: 'uni-app-x',
    resolveOptions: root => ({
      uniAppX: true,
      cssEntries: [path.resolve(root, 'main.css')],
    }),
    template: {
      entry: 'pages/index/index.uvue',
      closingTag: '</template>',
      makeSnippet: (classLiteral, marker) => `\t<text class="${classLiteral}">${marker}</text>\n`,
    },
    script: {
      entry: 'pages/index/index.uvue',
      applyClassLiteral(source, classLiteral) {
        return replaceExact(
          source,
          "\t\t\t\taaa:'text-[90px]'",
          `\t\t\t\taaa:'${classLiteral}'`,
          'demo/uni-app-x-hbuilderx-tailwindcss4 script anchor',
        )
      },
    },
  },
  {
    title: 'demo/taro-vite-tailwindcss-v4',
    projectRoot: path.resolve(repositoryRoot, 'demo/taro-vite-tailwindcss-v4'),
    appType: 'taro',
    template: {
      entry: 'src/pages/index/index.tsx',
      closingTag: '</View>',
      makeSnippet: (classLiteral, marker) => `      <View className='${classLiteral}'>${marker}</View>\n`,
    },
    script: {
      entry: 'src/pages/index/index.tsx',
      applyClassLiteral(source, classLiteral) {
        return replaceExact(
          source,
          "<Text className='text-[55rpx] text-[#fff] bg-purple-300'>Hello world!</Text>",
          `<Text className='${classLiteral}'>Hello world!</Text>`,
          'demo/taro-vite-tailwindcss-v4 script anchor',
        )
      },
    },
  },
  {
    title: 'demo/taro-webpack-tailwindcss-v4',
    projectRoot: path.resolve(repositoryRoot, 'demo/taro-webpack-tailwindcss-v4'),
    appType: 'taro',
    template: {
      entry: 'src/pages/index/index.tsx',
      closingTag: '</>',
      makeSnippet: (classLiteral, marker) => `      <View className='${classLiteral}'>${marker}</View>\n`,
    },
    script: {
      entry: 'src/pages/index/index.tsx',
      applyClassLiteral(source, classLiteral) {
        return replaceExact(
          source,
          "<View className='bg-[#534312] text-[#fff] text-[100rpx]'>",
          `<View className='${classLiteral}'>`,
          'demo/taro-webpack-tailwindcss-v4 script anchor',
        )
      },
    },
  },
  {
    title: 'demo/mpx-tailwindcss-v4',
    projectRoot: path.resolve(repositoryRoot, 'demo/mpx-tailwindcss-v4'),
    appType: 'mpx',
    template: {
      entry: 'src/pages/index.mpx',
      closingTag: '</template>',
      makeSnippet: (classLiteral, marker) => `  <view class="${classLiteral}">${marker}</view>\n`,
    },
    script: {
      entry: 'src/custom-tab-bar/index.mpx',
      applyClassLiteral(source, classLiteral) {
        return replaceExact(
          source,
          "    clsnm: 'bg-[#010101] active:bg-[#989898]'",
          `    clsnm: '${classLiteral}'`,
          'demo/mpx-tailwindcss-v4 script anchor',
        )
      },
    },
  },
  {
    title: 'apps/vite-native',
    projectRoot: path.resolve(repositoryRoot, 'apps/vite-native'),
    appType: 'native',
    template: {
      entry: 'pages/index/index.wxml',
      closingTag: '</scroll-view>',
      makeSnippet: (classLiteral, marker) => `  <view class="${classLiteral}">${marker}</view>\n`,
    },
    script: {
      entry: 'pages/index/index.ts',
      applyClassLiteral(source, classLiteral) {
        return replaceExact(
          source,
          '    message: \'Hello MINA!\',',
          `    message: '${classLiteral}',`,
          'apps/vite-native script anchor',
        )
      },
    },
  },
  {
    title: 'apps/taro-webpack-tailwindcss-v4',
    projectRoot: path.resolve(repositoryRoot, 'apps/taro-webpack-tailwindcss-v4'),
    appType: 'taro',
    template: {
      entry: 'src/pages/index/index.tsx',
      closingTag: '</>',
      makeSnippet: (classLiteral, marker) => `      <View className="${classLiteral}">${marker}</View>\n`,
    },
    script: {
      entry: 'src/pages/index/index.tsx',
      applyClassLiteral(source, classLiteral) {
        return replaceExact(
          source,
          '<View className="bg-[#2e2bcc] text-[100rpx] text-white">',
          `<View className="${classLiteral}">`,
          'apps/taro-webpack-tailwindcss-v4 script anchor',
        )
      },
    },
  },
]

describe.sequential('tailwindcss v4 source hmr regression', () => {
  for (const testCase of cases) {
    it(`${testCase.title} template add/modify/delete/rollback`, async () => {
      await runMutationLifecycle(testCase, 'template')
    })

    it(`${testCase.title} script add/modify/delete/rollback`, async () => {
      await runMutationLifecycle(testCase, 'script')
    })
  }
})
