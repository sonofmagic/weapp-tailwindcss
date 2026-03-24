import type { WatchCase } from '../types'
import path from 'node:path'
import {
  appendTrailingSnippet,
  createStyleRuleSnippet,
  insertBeforeClosingTag,
  mutateScriptByDataAnchor,
  mutateScriptByDataAnchorWithCommentCarrier,
  mutateTsxScriptByReturnAnchor,
  mutateTsxScriptByReturnAnchorWithCommentCarrier,
  replaceExactSnippet,
} from '../text'
import { buildHexScriptRoundConfigs, buildIssue33HighRiskRoundConfigs } from './round-configs'

export function buildAppCases(baseCwd: string): WatchCase[] {
  const taroWebpackCase: WatchCase = {
    name: 'taro-webpack',
    label: 'apps/taro-webpack-tailwindcss-v4',
    project: 'apps/taro-webpack-tailwindcss-v4',
    group: 'apps',
    cwd: path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4'),
    devScript: 'dev:weapp2',
    env: {
      TARO_BUILD_STRICT: '1',
    },
    outputWxml: path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          '      <View className="bg-[#2e2bcc] text-[100rpx] text-white">',
          `      <View className="${payload.classLiteral}">`,
          'apps taro-webpack jsx class anchor',
        )
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        const snippet = `      <View className='${payload.classLiteral}'>${payload.marker}-template</View>`
        return insertBeforeClosingTag(source, '    </>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/src/pages/index/index.tsx'),
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
      sourceFile: path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/src/pages/index/index.css'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const viteNativeTsCase: WatchCase = {
    name: 'vite-native-ts',
    label: 'apps/vite-native-ts',
    project: 'apps/vite-native-ts',
    group: 'apps',
    requireInitialCompileSuccess: true,
    cwd: path.resolve(baseCwd, 'apps/vite-native-ts'),
    devScript: 'dev',
    outputWxml: path.resolve(baseCwd, 'apps/vite-native-ts/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'apps/vite-native-ts/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'apps/vite-native-ts/dist/pages/index/index.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'apps/vite-native-ts/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native-ts/miniprogram/pages/index/index.ts'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          'const pageClassName = \'bg-[#d72929]\'',
          `const pageClassName = '${payload.classLiteral}'`,
          'apps vite-native-ts script class anchor',
        )
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native-ts/miniprogram/pages/index/index.wxml'),
      verifyEscapedIn: ['wxml'],
      mutate(source, payload) {
        const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</view>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native-ts/miniprogram/pages/index/index.ts'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateScriptByDataAnchor(source, '  data: {', payload)
      },
      mutateCommentCarrier(source, payload) {
        return mutateScriptByDataAnchorWithCommentCarrier(source, '  data: {', payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native-ts/miniprogram/pages/index/index.scss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const viteNativeCase: WatchCase = {
    name: 'vite-native',
    label: 'apps/vite-native',
    project: 'apps/vite-native',
    group: 'apps',
    requireInitialCompileSuccess: true,
    cwd: path.resolve(baseCwd, 'apps/vite-native'),
    devScript: 'dev',
    outputWxml: path.resolve(baseCwd, 'apps/vite-native/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'apps/vite-native/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'apps/vite-native/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'apps/vite-native/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'apps/vite-native/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native/pages/index/index.ts'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          '    message: \'Hello MINA!\',',
          `    message: '${payload.classLiteral}',`,
          'apps vite-native script class anchor',
        )
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native/pages/index/index.wxml'),
      verifyEscapedIn: ['wxml'],
      mutate(source, payload) {
        const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</scroll-view>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native/pages/index/index.ts'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateScriptByDataAnchor(source, '  data: {', payload)
      },
      mutateCommentCarrier(source, payload) {
        return mutateScriptByDataAnchorWithCommentCarrier(source, '  data: {', payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native/app.css'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const viteNativeSkylineCase: WatchCase = {
    name: 'vite-native-skyline',
    label: 'apps/vite-native-skyline',
    project: 'apps/vite-native-skyline',
    group: 'apps',
    requireInitialCompileSuccess: true,
    cwd: path.resolve(baseCwd, 'apps/vite-native-skyline'),
    devScript: 'dev',
    outputWxml: path.resolve(baseCwd, 'apps/vite-native-skyline/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'apps/vite-native-skyline/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'apps/vite-native-skyline/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'apps/vite-native-skyline/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'apps/vite-native-skyline/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'apps/vite-native-skyline/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native-skyline/pages/index/index.js'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          '    motto: \'Hello World\',',
          `    motto: '${payload.classLiteral}',`,
          'apps vite-native-skyline script class anchor',
        )
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native-skyline/pages/index/index.wxml'),
      verifyEscapedIn: ['wxml'],
      mutate(source, payload) {
        const snippet = `    <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</scroll-view>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native-skyline/pages/index/index.js'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateScriptByDataAnchor(source, '  data: {', payload)
      },
      mutateCommentCarrier(source, payload) {
        return mutateScriptByDataAnchorWithCommentCarrier(source, '  data: {', payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native-skyline/pages/index/index.wxss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const viteNativeTsSkylineCase: WatchCase = {
    name: 'vite-native-ts-skyline',
    label: 'apps/vite-native-ts-skyline',
    project: 'apps/vite-native-ts-skyline',
    group: 'apps',
    cwd: path.resolve(baseCwd, 'apps/vite-native-ts-skyline'),
    devScript: 'dev',
    outputWxml: path.resolve(baseCwd, 'apps/vite-native-ts-skyline/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'apps/vite-native-ts-skyline/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'apps/vite-native-ts-skyline/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'apps/vite-native-ts-skyline/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'apps/vite-native-ts-skyline/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'apps/vite-native-ts-skyline/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native-ts-skyline/miniprogram/pages/index/index.ts'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          '    const statusMessage = ref(\'夜间流量平稳，适合补货热门商品。\')',
          `    const statusMessage = ref('${payload.classLiteral}')`,
          'apps vite-native-ts-skyline script class anchor',
        )
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native-ts-skyline/miniprogram/pages/index/index.wxml'),
      verifyEscapedIn: ['wxml'],
      mutate(source, payload) {
        const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</view>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native-ts-skyline/miniprogram/pages/index/index.ts'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          '      statusMessage,',
          `      statusMessage,\n      ${payload.classVariableName}: '${payload.classLiteral}',\n      __twWatchScriptMarker: '${payload.marker}',`,
          'apps vite-native-ts-skyline return anchor',
        )
      },
      mutateCommentCarrier(source, payload) {
        return replaceExactSnippet(
          source,
          '      statusMessage,',
          `      statusMessage,\n      /* ${payload.classLiteral} */\n      __twWatchScriptCommentMarker: '${payload.marker}',`,
          'apps vite-native-ts-skyline return anchor',
        )
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native-ts-skyline/miniprogram/pages/index/index.wxss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  return [
    taroWebpackCase,
    viteNativeCase,
    viteNativeSkylineCase,
    viteNativeTsCase,
    viteNativeTsSkylineCase,
  ]
}
