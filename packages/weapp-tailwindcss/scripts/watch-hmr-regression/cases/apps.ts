import type { WatchCase } from '../types'
import path from 'node:path'
import { isIssue33RoundEnabled, ISSUE33_ADD_CLASS_TOKENS } from '../mutations/tokens'
import {
  appendTrailingSnippet,
  createStyleRuleSnippet,
  insertBeforeClosingTag,
  mutateScriptByDataAnchor,
  mutateScriptByDataAnchorWithCommentCarrier,
  mutateTsxScriptByReturnAnchor,
  mutateTsxScriptByReturnAnchorWithCommentCarrier,
} from '../text'

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

export function buildAppCases(baseCwd: string): WatchCase[] {
  const taroWebpackCase: WatchCase = {
    name: 'taro-webpack',
    label: 'apps/taro-webpack-tailwindcss-v4',
    project: 'apps/taro-webpack-tailwindcss-v4',
    group: 'apps',
    cwd: path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4'),
    devScript: 'dev:weapp2',
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
      sourceFile: path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/src/index.html'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: [],
      mutate(source, payload) {
        const snippet = `  <div class="${payload.classLiteral}">${payload.marker}-content</div>`
        return insertBeforeClosingTag(source, '</body>', snippet)
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
