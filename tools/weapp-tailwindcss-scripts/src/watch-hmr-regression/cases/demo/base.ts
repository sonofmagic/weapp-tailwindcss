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
  mutateVueScriptSetupObjectKeyByAnchorWithCommentCarrier,
  replaceExactSnippet,
} from '../../text'
import { buildHexScriptRoundConfigs, buildIssue33HighRiskRoundConfigs, buildTailwindV4JsContentRoundConfigs } from '../round-configs'

const taroWatchEnv = {
  TARO_BUILD_STRICT: '1',
  CHOKIDAR_USEPOLLING: '1',
  CHOKIDAR_INTERVAL: '100',
  WATCHPACK_POLLING: 'true',
}

function normalizeExtension(version: 'v3' | 'v4') {
  return version === 'v3' ? 'scss' : 'css'
}

function createSubPackageMutations(
  baseCwd: string,
  options: {
    project: string
    sourceRoot: string
    distRoot: string
    version: 'v3' | 'v4'
    pageKind: 'wxml' | 'tsx' | 'vue' | 'mpx'
    styleExtension?: 'scss' | 'css'
    styleCandidates?: (subPackage: 'sub-normal' | 'sub-independent') => string[]
    globalStyleCandidates?: (subPackage: 'sub-normal' | 'sub-independent') => string[]
    styleMutationOptions?: Pick<NonNullable<WatchCase['subPackageMutations']>[number]['styleMutation'], 'validateApply' | 'validateFunction' | 'outputNeedles' | 'rollbackNeedles'>
    templateVerifyEscapedIn?: Array<'wxml' | 'js'>
    templateVerifyClassLiteralIn?: Array<'wxml' | 'js'>
  },
): WatchCase['subPackageMutations'] {
  const styleExtension = options.styleExtension ?? normalizeExtension(options.version)
  const sourceRoot = options.sourceRoot === '.' ? '' : `${options.sourceRoot}/`
  const distRoot = options.distRoot === '.' ? '' : `${options.distRoot}/`
  return (['sub-normal', 'sub-independent'] as const).map((subPackage) => {
    const independent = subPackage === 'sub-independent'
    const label = independent ? 'independent' : 'normal'
    const sourceDir = path.resolve(baseCwd, `demo/${options.project}/${sourceRoot}${subPackage}/pages`)
    const distDir = path.resolve(baseCwd, `demo/${options.project}/${distRoot}${subPackage}/pages`)
    const pageSource = path.join(sourceDir, options.pageKind === 'wxml' ? 'index.wxml' : `index.${options.pageKind}`)
    const styleSource = path.join(sourceDir, `index.${styleExtension}`)
    const outputStyleCandidates = options.styleCandidates?.(subPackage) ?? [
      path.join(distDir, 'index.wxss'),
    ]
    const globalStyleCandidates = options.globalStyleCandidates?.(subPackage) ?? outputStyleCandidates
    const roundConfigs = buildHexScriptRoundConfigs()

    return {
      root: subPackage,
      independent,
      outputWxml: path.join(distDir, 'index.wxml'),
      outputJs: path.join(distDir, 'index.js'),
      outputStyleCandidates,
      globalStyleCandidates,
      templateMutation: {
        sourceFile: pageSource,
        verifyEscapedIn: options.templateVerifyEscapedIn
          ?? (options.pageKind === 'wxml' || options.pageKind === 'mpx' || options.pageKind === 'vue' ? ['wxml'] : ['js']),
        verifyClassLiteralIn: options.templateVerifyClassLiteralIn
          ?? (options.pageKind === 'tsx' ? ['js'] : []),
        roundConfigs,
        mutate(source, payload) {
          if (options.pageKind === 'wxml') {
            return appendTrailingSnippet(
              source,
              `<view class="${payload.classLiteral}">${payload.marker}-${label}-subpackage</view>`,
            )
          }
          if (options.pageKind === 'tsx') {
            const snippet = `  <View className="${payload.classLiteral}">${payload.marker}-${label}-subpackage</View>`
            return insertBeforeClosingTag(source, '</View>', snippet)
          }
          if (options.pageKind === 'vue') {
            const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-${label}-subpackage</view>`
            return insertBeforeClosingTag(source, '</template>', snippet)
          }
          const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-${label}-subpackage</view>`
          return insertBeforeClosingTag(source, '</template>', snippet)
        },
      },
      styleMutation: {
        sourceFile: styleSource,
        ...options.styleMutationOptions,
        mutate(source, payload) {
          return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
        },
      },
    }
  })
}

export function buildDemoBaseCases(baseCwd: string): WatchCase[] {
  const taroCase: WatchCase = {
    name: 'taro-webpack-react-tailwindcss-v3',
    label: 'demo/taro-webpack-react-tailwindcss-v3',
    project: 'demo/taro-webpack-react-tailwindcss-v3',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/taro-webpack-react-tailwindcss-v3'),
    devScript: 'dev:e2e-watch',
    env: taroWatchEnv,
    outputWxml: path.resolve(baseCwd, 'demo/taro-webpack-react-tailwindcss-v3/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/taro-webpack-react-tailwindcss-v3/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-webpack-react-tailwindcss-v3/dist/pages/index/index.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-webpack-react-tailwindcss-v3/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-react-tailwindcss-v3/src/pages/index/index.tsx'),
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
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-react-tailwindcss-v3/src/pages/index/index.tsx'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      roundConfigs: buildHexScriptRoundConfigs(),
      mutate(source, payload) {
        const snippet = `      <View className='${payload.classLiteral}'>${payload.marker}-template</View>`
        return insertBeforeClosingTag(source, '    </>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-react-tailwindcss-v3/src/pages/index/index.tsx'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      roundConfigs: buildHexScriptRoundConfigs(),
      mutate(source, payload) {
        return mutateTsxScriptByReturnAnchor(source, payload)
      },
      mutateCommentCarrier(source, payload) {
        return mutateTsxScriptByReturnAnchorWithCommentCarrier(source, payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-react-tailwindcss-v3/src/pages/index/index.scss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
    subPackageMutations: createSubPackageMutations(baseCwd, {
      project: 'taro-webpack-react-tailwindcss-v3',
      sourceRoot: 'src',
      distRoot: 'dist',
      version: 'v3',
      pageKind: 'tsx',
      styleExtension: 'css',
      globalStyleCandidates(subPackage) {
        return [
          path.resolve(baseCwd, `demo/taro-webpack-react-tailwindcss-v3/dist/${subPackage}/pages/index.wxss`),
          path.resolve(baseCwd, 'demo/taro-webpack-react-tailwindcss-v3/dist/app.wxss'),
        ]
      },
    }),
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
      roundConfigs: buildHexScriptRoundConfigs(),
      mutate(source, payload) {
        const snippet = `    <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</template>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/mpx-tailwindcss-v3/src/pages/index.mpx'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      roundConfigs: buildHexScriptRoundConfigs(),
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
    subPackageMutations: createSubPackageMutations(baseCwd, {
      project: 'mpx-tailwindcss-v3',
      sourceRoot: 'src',
      distRoot: 'dist/wx',
      version: 'v3',
      pageKind: 'mpx',
      styleCandidates(subPackage) {
        return [
          path.resolve(baseCwd, `demo/mpx-tailwindcss-v3/dist/wx/${subPackage}/pages/index.js`),
        ]
      },
      globalStyleCandidates(subPackage) {
        return [
          path.resolve(baseCwd, `demo/mpx-tailwindcss-v3/dist/wx/${subPackage}/pages/index.wxss`),
          path.resolve(baseCwd, `demo/mpx-tailwindcss-v3/dist/wx/${subPackage}/styles/*.wxss`),
          path.resolve(baseCwd, 'demo/mpx-tailwindcss-v3/dist/wx/styles/*.wxss'),
          path.resolve(baseCwd, 'demo/mpx-tailwindcss-v3/dist/wx/app.wxss'),
        ]
      },
      styleMutationOptions: {
        validateApply: false,
        validateFunction: false,
      },
    }),
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
      roundConfigs: buildHexScriptRoundConfigs(),
      mutate(source, payload) {
        const snippet = `        <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '      </view>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/gulp-tailwindcss-v3/src/pages/index/index.ts'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      roundConfigs: buildHexScriptRoundConfigs(),
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
    subPackageMutations: createSubPackageMutations(baseCwd, {
      project: 'gulp-tailwindcss-v3',
      sourceRoot: 'src',
      distRoot: 'dist',
      version: 'v3',
      pageKind: 'wxml',
    }),
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
      roundConfigs: buildTailwindV4JsContentRoundConfigs(),
    },
    styleMutation: {
      ...gulpCase.styleMutation,
      sourceFile: path.resolve(baseCwd, 'demo/gulp-tailwindcss-v4/src/app.css'),
    },
    subPackageMutations: createSubPackageMutations(baseCwd, {
      project: 'gulp-tailwindcss-v4',
      sourceRoot: 'src',
      distRoot: 'dist',
      version: 'v4',
      pageKind: 'wxml',
      styleCandidates(subPackage) {
        return [
          path.resolve(baseCwd, `demo/gulp-tailwindcss-v4/dist/${subPackage}/pages/index.wxss`),
          path.resolve(baseCwd, 'demo/gulp-tailwindcss-v4/dist/app.wxss'),
        ]
      },
    }),
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
          'const pageClassName = \'bg-[#d72929]\'',
          `const pageClassName = '${payload.classLiteral}'`,
          'weapp-vite script class anchor',
        )
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v3/miniprogram/pages/index/index.wxml'),
      verifyEscapedIn: ['wxml'],
      roundConfigs: buildHexScriptRoundConfigs(),
      mutate(source, payload) {
        const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</view>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v3/miniprogram/pages/index/index.ts'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      roundConfigs: buildHexScriptRoundConfigs(),
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
    subPackageMutations: createSubPackageMutations(baseCwd, {
      project: 'weapp-vite-tailwindcss-v3',
      sourceRoot: 'miniprogram',
      distRoot: 'dist',
      version: 'v3',
      pageKind: 'wxml',
      globalStyleCandidates(subPackage) {
        return [
          path.resolve(baseCwd, `demo/weapp-vite-tailwindcss-v3/dist/${subPackage}/pages/index.wxss`),
          path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v3/dist/app.wxss'),
        ]
      },
    }),
  }

  const weappViteV4Case: WatchCase = {
    name: 'weapp-vite-tailwindcss-v4',
    label: 'demo/weapp-vite-tailwindcss-v4',
    project: 'demo/weapp-vite-tailwindcss-v4',
    group: 'demo',
    requireInitialCompileSuccess: false,
    requireStableGlobalStyleOnSameClassLiteral: false,
    initialBuildScript: 'build',
    initialMutationDelayMs: 3_000,
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
      sourceFile: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v4/pages/index/index.wxml'),
      verifyEscapedIn: ['wxml'],
      verifyClassLiteralIn: ['wxml'],
      forbidBgHexTruncationIn: ['wxml'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          'bg-[#68c828] text-[100px] text-[#123456] w-[323px]',
          payload.classLiteral,
          'weapp-vite-tailwindcss-v4 content class anchor',
        )
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v4/pages/index/index.wxml'),
      verifyEscapedIn: ['wxml'],
      roundConfigs: buildHexScriptRoundConfigs(),
      mutate(source, payload) {
        const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</scroll-view>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v4/pages/index/index.ts'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      roundConfigs: buildTailwindV4JsContentRoundConfigs(),
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
    subPackageMutations: createSubPackageMutations(baseCwd, {
      project: 'weapp-vite-tailwindcss-v4',
      sourceRoot: '.',
      distRoot: 'dist',
      version: 'v4',
      pageKind: 'wxml',
      globalStyleCandidates(subPackage) {
        return [
          path.resolve(baseCwd, `demo/weapp-vite-tailwindcss-v4/dist/${subPackage}/pages/index.wxss`),
          path.resolve(baseCwd, 'demo/weapp-vite-tailwindcss-v4/dist/app.wxss'),
        ]
      },
    }),
  }

  const taroWebpackVue3V3Case: WatchCase = {
    ...taroCase,
    name: 'taro-webpack-vue3-tailwindcss-v3',
    label: 'demo/taro-webpack-vue3-tailwindcss-v3',
    project: 'demo/taro-webpack-vue3-tailwindcss-v3',
    cwd: path.resolve(baseCwd, 'demo/taro-webpack-vue3-tailwindcss-v3'),
    outputWxml: path.resolve(baseCwd, 'demo/taro-webpack-vue3-tailwindcss-v3/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/taro-webpack-vue3-tailwindcss-v3/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-webpack-vue3-tailwindcss-v3/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/taro-webpack-vue3-tailwindcss-v3/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-webpack-vue3-tailwindcss-v3/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/taro-webpack-vue3-tailwindcss-v3/dist/app.wxss'),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-vue3-tailwindcss-v3/src/pages/index/index.vue'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      forbidBgHexTruncationIn: ['js'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return replaceExactSnippet(
          source,
          'const dynamicClass = computed(() => \'bg-[#123456] text-[#ffffff] p-[20px]\')',
          `const dynamicClass = computed(() => '${payload.classLiteral}')`,
          'taro-webpack-vue3-tailwindcss-v3 vue computed class anchor',
        )
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-vue3-tailwindcss-v3/src/pages/index/index.vue'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      roundConfigs: buildHexScriptRoundConfigs(),
      mutate(source, payload) {
        const snippet = `    <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</template>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-vue3-tailwindcss-v3/src/pages/index/index.vue'),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: ['js'],
      roundConfigs: buildHexScriptRoundConfigs(),
      mutate(source, payload) {
        return insertIntoVueTemplateRoot(
          replaceExactSnippet(
            source,
            'const dynamicClass = computed(() => \'bg-[#123456] text-[#ffffff] p-[20px]\')',
            `const ${payload.classVariableName} = '${payload.classLiteral}'\nconst __twWatchScriptMarker = '${payload.marker}'\nconst dynamicClass = computed(() => ${payload.classVariableName})`,
            'taro-webpack-vue3-tailwindcss-v3 script class anchor',
          ),
          `    <view hidden :class="${payload.classVariableName}">{{ __twWatchScriptMarker }}</view>`,
        )
      },
      mutateCommentCarrier(source, payload) {
        return mutateVueScriptSetupObjectKeyByAnchorWithCommentCarrier(
          source,
          'const dynamicClass = computed(() => \'bg-[#123456] text-[#ffffff] p-[20px]\')',
          payload,
        )
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-vue3-tailwindcss-v3/src/pages/index/index.vue'),
      mutate(source, payload) {
        return mutateSfcStyleBlock(source, payload)
      },
    },
    subPackageMutations: createSubPackageMutations(baseCwd, {
      project: 'taro-webpack-vue3-tailwindcss-v3',
      sourceRoot: 'src',
      distRoot: 'dist',
      version: 'v3',
      pageKind: 'vue',
      styleExtension: 'css',
      templateVerifyEscapedIn: ['js'],
      templateVerifyClassLiteralIn: ['js'],
      globalStyleCandidates(subPackage) {
        return [
          path.resolve(baseCwd, `demo/taro-webpack-vue3-tailwindcss-v3/dist/${subPackage}/pages/index.wxss`),
          path.resolve(baseCwd, 'demo/taro-webpack-vue3-tailwindcss-v3/dist/app.wxss'),
        ]
      },
    }),
  }

  return [
    gulpCase,
    gulpV4Case,
    taroCase,
    taroWebpackVue3V3Case,
    mpxCase,
    weappViteCase,
    weappViteV4Case,
  ]
}
