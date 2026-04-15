import type { WatchCase } from '../../types'
import path from 'node:path'
import {
  appendTrailingSnippet,
  createStyleRuleSnippet,
  insertBeforeClosingTag,
  insertIntoVueTemplateRoot,
  mutateScriptByDataAnchor,
  mutateScriptByDataAnchorWithCommentCarrier,
  mutateSfcStyleBlock,
  mutateTsxScriptByReturnAnchor,
  mutateTsxScriptByReturnAnchorWithCommentCarrier,
  mutateVueRefStringLiteral,
  mutateVueScriptSetupArrayByAnchor,
  mutateVueScriptSetupArrayByAnchorWithCommentCarrier,
  mutateVueScriptSetupObjectKeyByAnchor,
  replaceExactSnippet,
} from '../../text'
import { buildHexScriptRoundConfigs, buildIssue33HighRiskRoundConfigs } from '../round-configs'

export function buildDemoExtendedCases(baseCwd: string): WatchCase[] {
  const uniAppVue3ViteCase: WatchCase = {
    name: 'uni-app-vue3-vite',
    label: 'demo/uni-app-vue3-vite',
    project: 'demo/uni-app-vue3-vite',
    group: 'demo',
    minGlobalStyleEscapedClasses: 0,
    requireStableGlobalStyleOnSameClassLiteral: false,
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
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app-vue3-vite/src/pages/index/index.vue'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return mutateVueScriptSetupObjectKeyByAnchor(
          source,
          '\'bg-[#999999]\':true',
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
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4/src/pages/index/index.vue'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          'const className = ref(\'bg-[#0000ff] text-[45rpx] text-white\')',
          `const className = ref('${payload.classLiteral}')`,
          'uni-app-tailwindcss-v4 script class anchor',
        )
      },
    },
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

  const mpxTailwindcssV4Case: WatchCase = {
    name: 'mpx-tailwindcss-v4',
    label: 'demo/mpx-tailwindcss-v4',
    project: 'demo/mpx-tailwindcss-v4',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/mpx-tailwindcss-v4'),
    devScript: 'dev',
    outputWxml: path.resolve(baseCwd, 'demo/mpx-tailwindcss-v4/dist/wx/custom-tab-bar/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/mpx-tailwindcss-v4/dist/wx/custom-tab-bar/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/mpx-tailwindcss-v4/dist/wx/custom-tab-bar/index.wxss'),
      path.resolve(baseCwd, 'demo/mpx-tailwindcss-v4/dist/wx/styles/app*.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/mpx-tailwindcss-v4/dist/wx/styles/app*.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/mpx-tailwindcss-v4/src/custom-tab-bar/index.mpx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          '    clsnm: \'bg-[#010101] active:bg-[#989898]\'',
          `    clsnm: '${payload.classLiteral}'`,
          'mpx-tailwindcss-v4 script class anchor',
        )
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/mpx-tailwindcss-v4/src/custom-tab-bar/index.mpx'),
      verifyEscapedIn: ['wxml'],
      verifyClassLiteralIn: [],
      mutate(source, payload) {
        const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</template>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/mpx-tailwindcss-v4/src/custom-tab-bar/index.mpx'),
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
      sourceFile: path.resolve(baseCwd, 'demo/mpx-tailwindcss-v4/src/app.css'),
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
    initialMutationDelayMs: 5_000,
    cwd: path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4'),
    devScript: 'dev:weapp',
    env: {
      TARO_BUILD_STRICT: '1',
    },
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
      sourceFile: path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          '      <div className=\'h-[300px] text-[#c31d6b] bg-[#123456]\'>短斤少两快点撒</div>',
          `      <div className='${payload.classLiteral}'>短斤少两快点撒</div>`,
          'taro-vite-tailwindcss-v4 jsx class anchor',
        )
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
    initialMutationDelayMs: 5_000,
    cwd: path.resolve(baseCwd, 'demo/taro-app-vite'),
    devScript: 'dev:weapp',
    env: {
      TARO_BUILD_STRICT: '1',
    },
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
      sourceFile: path.resolve(baseCwd, 'demo/taro-app-vite/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          '      <View className=\'bg-[#89ab8d] flex flex-col\'>',
          `      <View className='${payload.classLiteral}'>`,
          'taro-app-vite jsx class anchor',
        )
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
    env: {
      TARO_BUILD_STRICT: '1',
    },
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
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          '      <View className=\'bg-[#534312] text-[#fff] text-[100rpx]\'>',
          `      <View className='${payload.classLiteral}'>`,
          'taro-webpack-tailwindcss-v4 jsx class anchor',
        )
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
    env: {
      TARO_BUILD_STRICT: '1',
    },
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
      sourceFile: path.resolve(baseCwd, 'demo/taro-vue3-app/src/pages/index/index.vue'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          'const classArray = [\'bg-[#543254]\', \'h-[100px]\', \'w-[300px]\', "bg-[url(\'https://xxx.com/xx.webp\')]"]',
          `const classArray = ['${payload.classLiteral}', 'w-[300px]', "bg-[url('https://xxx.com/xx.webp')]"]`,
          'taro-vue3-app script class anchor',
        )
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
    mpxTailwindcssV4Case,
    taroViteTailwindcssV4Case,
    taroAppViteCase,
    taroWebpackTailwindcssV4DemoCase,
    taroVue3AppCase,
  ]
}
