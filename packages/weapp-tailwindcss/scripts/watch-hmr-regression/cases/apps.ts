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
import { buildHexScriptRoundConfigs, buildIssue33BgOnlyRoundConfigs } from './round-configs'

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
      roundConfigs: buildIssue33BgOnlyRoundConfigs(),
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
      roundConfigs: buildIssue33BgOnlyRoundConfigs(),
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

  return [
    taroWebpackCase,
    viteNativeTsCase,
  ]
}
