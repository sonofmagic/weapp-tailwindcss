import type { WatchCase } from '../../types'
import path from 'node:path'
import {
  appendTrailingSnippet,
  createStyleRuleSnippet,
  insertBeforeClosingTag,
  mutateScriptByDataAnchor,
  mutateScriptByDataAnchorWithCommentCarrier,
  mutateSfcStyleBlock,
  mutateTsxScriptByReturnAnchor,
  replaceExactSnippet,
} from '../../text'
import { buildHexScriptRoundConfigs, buildIssue33HighRiskRoundConfigs } from '../round-configs'

const taroWatchEnv = {
  TARO_BUILD_STRICT: '1',
  CHOKIDAR_USEPOLLING: '1',
  CHOKIDAR_INTERVAL: '100',
  WATCHPACK_POLLING: 'true',
}

export function buildDemoBaseCases(baseCwd: string): WatchCase[] {
  const taroCase: WatchCase = {
    name: 'taro-webpack-tailwindcss-v3',
    label: 'demo/taro-webpack-tailwindcss-v3',
    project: 'demo/taro-webpack-tailwindcss-v3',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v3'),
    devScript: 'dev:e2e-watch',
    env: taroWatchEnv,
    outputWxml: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v3/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v3/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v3/dist/pages/index/index.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v3/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v3/src/pages/index/index.tsx'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          '  const className = \'bg-[#123456]\'',
          `  const className = '${payload.classLiteral}'`,
          'taro script class anchor',
        )
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v3/src/pages/index/index.tsx'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      roundConfigs: buildHexScriptRoundConfigs(),
      mutate(source, payload) {
        const snippet = `      <View className='${payload.classLiteral}'>${payload.marker}-template</View>`
        return insertBeforeClosingTag(source, '    </>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v3/src/pages/index/index.tsx'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      roundConfigs: buildHexScriptRoundConfigs(),
      mutate(source, payload) {
        return mutateTsxScriptByReturnAnchor(source, payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v3/src/pages/index/index.scss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const mpxCase: WatchCase = {
    name: 'mpx-tailwindcss-v3',
    label: 'demo/mpx-tailwindcss-v3',
    project: 'demo/mpx-tailwindcss-v3',
    group: 'demo',
    // 覆盖 MPX script-only 热更新新增类名后，utilities wxss 必须同步生成样式。
    minGlobalStyleEscapedClasses: 1,
    // MPX watch pipeline may rewrite global style assets even when class literal is unchanged.
    // Keep same-class-literal timing coverage, but skip strict global style stability assertion.
    requireStableGlobalStyleOnSameClassLiteral: false,
    initialMutationDelayMs: 5_000,
    cwd: path.resolve(baseCwd, 'demo/mpx-tailwindcss-v3'),
    devScript: 'dev',
    outputWxml: path.resolve(baseCwd, 'demo/mpx-tailwindcss-v3/dist/wx/pages/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/mpx-tailwindcss-v3/dist/wx/pages/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/mpx-tailwindcss-v3/dist/wx/app.wxss'),
      path.resolve(baseCwd, 'demo/mpx-tailwindcss-v3/dist/wx/pages/index.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/mpx-tailwindcss-v3/dist/wx/styles/utilities*.wxss'),
      path.resolve(baseCwd, 'demo/mpx-tailwindcss-v3/dist/wx/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/mpx-tailwindcss-v3/src/pages/index.mpx'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          '    classNames: \'bg-[#123456]\',',
          `    classNames: '${payload.classLiteral}',`,
          'mpx script class anchor',
        )
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/mpx-tailwindcss-v3/src/pages/index.mpx'),
      verifyEscapedIn: ['wxml'],
      verifyClassLiteralIn: [],
      mutate(source, payload) {
        const snippet = `    <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</template>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/mpx-tailwindcss-v3/src/pages/index.mpx'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateScriptByDataAnchor(source, '    classNames: \'bg-[#123456]\',', payload)
      },
      mutateCommentCarrier(source, payload) {
        return mutateScriptByDataAnchorWithCommentCarrier(source, '    classNames: \'bg-[#123456]\',', payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/mpx-tailwindcss-v3/src/app.mpx'),
      mutate(source, payload) {
        return mutateSfcStyleBlock(source, payload)
      },
    },
  }

  const gulpCase: WatchCase = {
    name: 'gulp-tailwindcss-v3',
    label: 'demo/gulp-tailwindcss-v3',
    project: 'demo/gulp-tailwindcss-v3',
    group: 'demo',
    requireInitialCompileSuccess: false,
    initialMutationDelayMs: 5_000,
    cwd: path.resolve(baseCwd, 'demo/gulp-tailwindcss-v3'),
    devScript: 'dev',
    outputWxml: path.resolve(baseCwd, 'demo/gulp-tailwindcss-v3/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/gulp-tailwindcss-v3/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/gulp-tailwindcss-v3/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/gulp-tailwindcss-v3/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/gulp-tailwindcss-v3/dist/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/gulp-tailwindcss-v3/src/pages/index/index.wxml'),
      verifyEscapedIn: ['wxml'],
      verifyClassLiteralIn: [],
      mutate(source, payload) {
        const snippet = `        <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '      </view>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/gulp-tailwindcss-v3/src/pages/index/index.ts'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateScriptByDataAnchor(source, '  data: {', payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/gulp-tailwindcss-v3/src/app.scss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const gulpV4Case: WatchCase = {
    ...gulpCase,
    name: 'gulp-tailwindcss-v4',
    label: 'demo/gulp-tailwindcss-v4',
    project: 'demo/gulp-tailwindcss-v4',
    cwd: path.resolve(baseCwd, 'demo/gulp-tailwindcss-v4'),
    outputWxml: path.resolve(baseCwd, 'demo/gulp-tailwindcss-v4/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/gulp-tailwindcss-v4/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/gulp-tailwindcss-v4/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/gulp-tailwindcss-v4/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/gulp-tailwindcss-v4/dist/app.wxss'),
    ],
    templateMutation: {
      ...gulpCase.templateMutation,
      sourceFile: path.resolve(baseCwd, 'demo/gulp-tailwindcss-v4/src/pages/index/index.wxml'),
    },
    scriptMutation: {
      ...gulpCase.scriptMutation,
      sourceFile: path.resolve(baseCwd, 'demo/gulp-tailwindcss-v4/src/pages/index/index.ts'),
      roundConfigs: buildHexScriptRoundConfigs(),
    },
    styleMutation: {
      ...gulpCase.styleMutation,
      sourceFile: path.resolve(baseCwd, 'demo/gulp-tailwindcss-v4/src/app.css'),
    },
  }

  const weappViteCase: WatchCase = {
    name: 'weapp-vite-tailwindcss-v3',
    label: 'demo/weapp-vite-tailwindcss-v3',
    project: 'demo/weapp-vite-tailwindcss-v3',
    group: 'demo',
    // weapp-vite 的 dev 日志在长链路回归里偶发缺少 ready 行，
    // 这里改为依赖初始产物 + 后续 mutation 实测，避免被日志抖动误伤。
    requireInitialCompileSuccess: false,
    requireStableGlobalStyleOnSameClassLiteral: false,
    initialBuildScript: 'build',
    cwd: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v3'),
    devScript: 'dev:e2e-watch',
    outputWxml: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v3/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v3/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v3/dist/pages/index/index.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v3/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v3/miniprogram/pages/index/index.ts'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          'const pageClassName = \'bg-[#123456]\'',
          `const pageClassName = '${payload.classLiteral}'`,
          'weapp-vite script class anchor',
        )
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v3/miniprogram/pages/index/index.wxml'),
      verifyEscapedIn: ['wxml'],
      mutate(source, payload) {
        const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</view>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v3/miniprogram/pages/index/index.ts'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateScriptByDataAnchor(source, '  data: {', payload)
      },
      mutateCommentCarrier(source, payload) {
        return mutateScriptByDataAnchorWithCommentCarrier(source, '  data: {', payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v3/miniprogram/pages/index/index.scss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const weappViteV4Case: WatchCase = {
    name: 'weapp-vite-tailwindcss-v4',
    label: 'demo/weapp-vite-tailwindcss-v4',
    project: 'demo/weapp-vite-tailwindcss-v4',
    group: 'demo',
    requireInitialCompileSuccess: false,
    requireStableGlobalStyleOnSameClassLiteral: false,
    cwd: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v4'),
    devScript: 'dev:e2e-watch',
    outputWxml: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v4/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v4/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v4/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v4/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v4/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v4/pages/index/index.ts'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          '    message: \'Hello MINA!\',',
          `    message: '${payload.classLiteral}',`,
          'weapp-vite-tailwindcss-v4 script class anchor',
        )
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v4/pages/index/index.wxml'),
      verifyEscapedIn: ['wxml'],
      mutate(source, payload) {
        const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</scroll-view>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v4/pages/index/index.ts'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateScriptByDataAnchor(source, '  data: {', payload)
      },
      mutateCommentCarrier(source, payload) {
        return mutateScriptByDataAnchorWithCommentCarrier(source, '  data: {', payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v4/app.css'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  return [
    gulpCase,
    gulpV4Case,
    taroCase,
    mpxCase,
    weappViteCase,
    weappViteV4Case,
  ]
}
