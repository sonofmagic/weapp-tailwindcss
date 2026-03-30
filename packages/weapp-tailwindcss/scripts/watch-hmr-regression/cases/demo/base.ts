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
import { buildIssue33HighRiskRoundConfigs } from '../round-configs'

export function buildDemoBaseCases(baseCwd: string): WatchCase[] {
  const taroCase: WatchCase = {
    name: 'taro',
    label: 'demo/taro-app',
    project: 'demo/taro-app',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/taro-app'),
    devScript: 'dev:weapp',
    env: {
      TARO_BUILD_STRICT: '1',
    },
    outputWxml: path.resolve(baseCwd, 'demo/taro-app/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/taro-app/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-app/dist/pages/index/index.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-app/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-app/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
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
      sourceFile: path.resolve(baseCwd, 'demo/taro-app/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        const snippet = `      <View className='${payload.classLiteral}'>${payload.marker}-template</View>`
        return insertBeforeClosingTag(source, '    </>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-app/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateTsxScriptByReturnAnchor(source, payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-app/src/pages/index/index.scss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const mpxCase: WatchCase = {
    name: 'mpx',
    label: 'demo/mpx-app',
    project: 'demo/mpx-app',
    group: 'demo',
    // MPX watch output may keep newly introduced utility classes in page-level assets.
    // Do not hard-require hits in global utilities/app styles for this case.
    minGlobalStyleEscapedClasses: 0,
    // MPX watch pipeline may rewrite global style assets even when class literal is unchanged.
    // Keep same-class-literal timing coverage, but skip strict global style stability assertion.
    requireStableGlobalStyleOnSameClassLiteral: false,
    cwd: path.resolve(baseCwd, 'demo/mpx-app'),
    devScript: 'dev',
    outputWxml: path.resolve(baseCwd, 'demo/mpx-app/dist/wx/pages/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/mpx-app/dist/wx/pages/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/mpx-app/dist/wx/app.wxss'),
      path.resolve(baseCwd, 'demo/mpx-app/dist/wx/pages/index.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/mpx-app/dist/wx/styles/utilities*.wxss'),
      path.resolve(baseCwd, 'demo/mpx-app/dist/wx/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/mpx-app/src/pages/index.mpx'),
      verifyEscapedIn: [],
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
      sourceFile: path.resolve(baseCwd, 'demo/mpx-app/src/pages/index.mpx'),
      verifyEscapedIn: ['wxml'],
      verifyClassLiteralIn: [],
      mutate(source, payload) {
        const snippet = `    <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</template>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/mpx-app/src/pages/index.mpx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateScriptByDataAnchor(source, '    classNames: \'bg-[#123456]\',', payload)
      },
      mutateCommentCarrier(source, payload) {
        return mutateScriptByDataAnchorWithCommentCarrier(source, '    classNames: \'bg-[#123456]\',', payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/mpx-app/src/app.mpx'),
      mutate(source, payload) {
        return mutateSfcStyleBlock(source, payload)
      },
    },
  }

  const weappViteCase: WatchCase = {
    name: 'weapp-vite',
    label: 'demo/native-ts (weapp-vite)',
    project: 'demo/native-ts',
    group: 'demo',
    // weapp-vite 的 dev 日志在长链路回归里偶发缺少 ready 行，
    // 这里改为依赖初始产物 + 后续 mutation 实测，避免被日志抖动误伤。
    requireInitialCompileSuccess: false,
    requireStableGlobalStyleOnSameClassLiteral: false,
    cwd: path.resolve(baseCwd, 'demo/native-ts'),
    devScript: 'dev',
    outputWxml: path.resolve(baseCwd, 'demo/native-ts/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/native-ts/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/native-ts/dist/pages/index/index.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/native-ts/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/native-ts/miniprogram/pages/index/index.ts'),
      verifyEscapedIn: [],
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
      sourceFile: path.resolve(baseCwd, 'demo/native-ts/miniprogram/pages/index/index.wxml'),
      verifyEscapedIn: ['wxml'],
      mutate(source, payload) {
        const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</view>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/native-ts/miniprogram/pages/index/index.ts'),
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
      sourceFile: path.resolve(baseCwd, 'demo/native-ts/miniprogram/pages/index/index.scss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  return [
    weappViteCase,
    taroCase,
    mpxCase,
  ]
}
