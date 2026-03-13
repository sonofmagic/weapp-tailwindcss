import type { WatchCase } from '../../types'
import path from 'node:path'
import { isIssue33RoundEnabled, ISSUE33_ADD_CLASS_TOKENS } from '../../mutations/tokens'
import {
  appendTrailingSnippet,
  createStyleRuleSnippet,
  insertBeforeClosingTag,
  insertIntoVueTemplateRoot,
  mutateSfcStyleBlock,
  mutateTsxScriptByReturnAnchor,
  mutateTsxScriptByReturnAnchorWithCommentCarrier,
  mutateVueRefStringLiteral,
  mutateVueScriptSetupArrayByAnchor,
  mutateVueScriptSetupArrayByAnchorWithCommentCarrier,
} from '../../text'

const NON_DIGIT_RE = /\D/g

function buildHexScriptRoundConfigs() {
  const rounds = [
    {
      name: 'baseline-arbitrary' as const,
      buildClassTokens(seed: string) {
        const numericSeed = seed.replace(NON_DIGIT_RE, '').padEnd(6, '0')
        const hex = numericSeed.slice(0, 6)
        const textPx = Number(numericSeed.slice(0, 2)) + 20
        const heightPx = Number(numericSeed.slice(2, 4)) + 12
        return [
          `bg-[#${hex}]`,
          `text-[${textPx}px]`,
          `h-[${heightPx}px]`,
        ]
      },
    },
    {
      name: 'complex-corpus' as const,
      buildClassTokens(seed: string) {
        const numericSeed = seed.replace(NON_DIGIT_RE, '').padEnd(6, '0')
        const hex = numericSeed.slice(0, 4)
        const textPx = Number(numericSeed.slice(0, 2)) + 34
        const heightPx = Number(numericSeed.slice(2, 4)) + 22
        return [
          `bg-[#${hex}]`,
          `text-[${textPx}px]`,
          `h-[${heightPx}px]`,
        ]
      },
    },
    {
      name: 'hex-arbitrary' as const,
      buildClassTokens(seed: string) {
        const numericSeed = seed.replace(NON_DIGIT_RE, '').padEnd(8, '0')
        const hex = `${numericSeed.slice(0, 2)}00`
        const textPx = Number(numericSeed.slice(0, 2)) + 46
        const heightPx = Number(numericSeed.slice(2, 4)) + 28
        return [
          `bg-[#${hex}]`,
          `text-[${textPx}px]`,
          `h-[${heightPx}px]`,
        ]
      },
    },
  ]
  if (!isIssue33RoundEnabled()) {
    return rounds
  }
  return [
    ...rounds,
    {
      name: 'issue33-arbitrary' as const,
      buildClassTokens() {
        return [...ISSUE33_ADD_CLASS_TOKENS]
      },
    },
  ]
}

export function buildDemoExtendedCases(baseCwd: string): WatchCase[] {
  const uniAppVue3ViteCase: WatchCase = {
    name: 'uni-app-vue3-vite',
    label: 'demo/uni-app-vue3-vite',
    project: 'demo/uni-app-vue3-vite',
    group: 'demo',
    minGlobalStyleEscapedClasses: 0,
    cwd: path.resolve(baseCwd, 'demo/uni-app-vue3-vite'),
    devScript: 'dev:mp-weixin',
    outputWxml: path.resolve(baseCwd, 'demo/uni-app-vue3-vite/dist/dev/mp-weixin/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/uni-app-vue3-vite/dist/dev/mp-weixin/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/uni-app-vue3-vite/dist/dev/mp-weixin/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/uni-app-vue3-vite/dist/dev/mp-weixin/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/uni-app-vue3-vite/dist/dev/mp-weixin/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/uni-app-vue3-vite/dist/dev/mp-weixin/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app-vue3-vite/src/pages/index/index.vue'),
      verifyEscapedIn: ['wxml'],
      verifyClassLiteralIn: [],
      mutate(source, payload) {
        const snippet = `    <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertIntoVueTemplateRoot(source, snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app-vue3-vite/src/pages/index/index.vue'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateVueScriptSetupArrayByAnchor(
          source,
          'const classArray = [',
          payload,
        )
      },
      mutateCommentCarrier(source, payload) {
        return mutateVueScriptSetupArrayByAnchorWithCommentCarrier(
          source,
          'const classArray = [',
          payload,
        )
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app-vue3-vite/src/pages/index/index.vue'),
      mutate(source, payload) {
        return mutateSfcStyleBlock(source, payload)
      },
    },
  }

  const uniAppTailwindcssV4Case: WatchCase = {
    name: 'uni-app-tailwindcss-v4',
    label: 'demo/uni-app-tailwindcss-v4',
    project: 'demo/uni-app-tailwindcss-v4',
    group: 'demo',
    minGlobalStyleEscapedClasses: 0,
    cwd: path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4'),
    devScript: 'dev:mp-weixin',
    outputWxml: path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4/dist/dev/mp-weixin/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4/dist/dev/mp-weixin/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4/dist/dev/mp-weixin/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4/dist/dev/mp-weixin/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4/src/pages/index/index.vue'),
      verifyEscapedIn: ['wxml'],
      verifyClassLiteralIn: [],
      mutate(source, payload) {
        const snippet = `    <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertIntoVueTemplateRoot(source, snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4/src/pages/index/index.vue'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateVueRefStringLiteral(
          source,
          'className',
          payload,
        )
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4/src/main.css'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const taroViteTailwindcssV4Case: WatchCase = {
    name: 'taro-vite-tailwindcss-v4',
    label: 'demo/taro-vite-tailwindcss-v4',
    project: 'demo/taro-vite-tailwindcss-v4',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4'),
    devScript: 'dev:weapp',
    outputWxml: path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/dist/app-origin.wxss'),
      path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/dist/app-origin.wxss'),
      path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/src/index.html'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: [],
      mutate(source, payload) {
        const snippet = `  <div class="${payload.classLiteral}">${payload.marker}-content</div>`
        return insertBeforeClosingTag(source, '</body>', snippet)
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        const snippet = `      <View className='${payload.classLiteral}'>${payload.marker}-template</View>`
        return insertBeforeClosingTag(source, '    </View>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateTsxScriptByReturnAnchor(source, payload)
      },
      mutateCommentCarrier(source, payload) {
        return mutateTsxScriptByReturnAnchorWithCommentCarrier(source, payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/src/pages/index/index.css'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const taroAppViteCase: WatchCase = {
    name: 'taro-app-vite',
    label: 'demo/taro-app-vite',
    project: 'demo/taro-app-vite',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/taro-app-vite'),
    devScript: 'dev:weapp',
    outputWxml: path.resolve(baseCwd, 'demo/taro-app-vite/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/taro-app-vite/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-app-vite/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/taro-app-vite/dist/app-origin.wxss'),
      path.resolve(baseCwd, 'demo/taro-app-vite/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-app-vite/dist/app-origin.wxss'),
      path.resolve(baseCwd, 'demo/taro-app-vite/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-app-vite/src/index.html'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: [],
      mutate(source, payload) {
        const snippet = `  <div class="${payload.classLiteral}">${payload.marker}-content</div>`
        return insertBeforeClosingTag(source, '</body>', snippet)
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-app-vite/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        const snippet = `      <View className='${payload.classLiteral}'>${payload.marker}-template</View>`
        return insertBeforeClosingTag(source, '    </View>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-app-vite/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateTsxScriptByReturnAnchor(source, payload)
      },
      mutateCommentCarrier(source, payload) {
        return mutateTsxScriptByReturnAnchorWithCommentCarrier(source, payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-app-vite/src/pages/index/index.scss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const taroWebpackTailwindcssV4DemoCase: WatchCase = {
    name: 'taro-webpack-tailwindcss-v4',
    label: 'demo/taro-webpack-tailwindcss-v4',
    project: 'demo/taro-webpack-tailwindcss-v4',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4'),
    devScript: 'dev:weapp',
    outputWxml: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/src/index.html'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: [],
      mutate(source, payload) {
        const snippet = `  <div class="${payload.classLiteral}">${payload.marker}-content</div>`
        return insertBeforeClosingTag(source, '</body>', snippet)
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        const snippet = `      <View className='${payload.classLiteral}'>${payload.marker}-template</View>`
        return insertBeforeClosingTag(source, '    </>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/src/pages/index/index.tsx'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildHexScriptRoundConfigs(),
      mutate(source, payload) {
        return mutateTsxScriptByReturnAnchor(source, payload)
      },
      mutateCommentCarrier(source, payload) {
        return mutateTsxScriptByReturnAnchorWithCommentCarrier(source, payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/src/pages/index/index.css'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const taroVue3AppCase: WatchCase = {
    name: 'taro-vue3-app',
    label: 'demo/taro-vue3-app',
    project: 'demo/taro-vue3-app',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/taro-vue3-app'),
    devScript: 'dev:weapp',
    outputWxml: path.resolve(baseCwd, 'demo/taro-vue3-app/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/taro-vue3-app/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-vue3-app/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/taro-vue3-app/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-vue3-app/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/taro-vue3-app/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-vue3-app/src/index.html'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: [],
      mutate(source, payload) {
        const snippet = `  <div class="${payload.classLiteral}">${payload.marker}-content</div>`
        return insertBeforeClosingTag(source, '</body>', snippet)
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-vue3-app/src/pages/index/index.vue'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertIntoVueTemplateRoot(source, snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-vue3-app/src/pages/index/index.vue'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateVueScriptSetupArrayByAnchor(
          source,
          'const classArray = [',
          payload,
        )
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-vue3-app/src/pages/index/index.scss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  return [
    uniAppVue3ViteCase,
    uniAppTailwindcssV4Case,
    taroViteTailwindcssV4Case,
    taroAppViteCase,
    taroWebpackTailwindcssV4DemoCase,
    taroVue3AppCase,
  ]
}
