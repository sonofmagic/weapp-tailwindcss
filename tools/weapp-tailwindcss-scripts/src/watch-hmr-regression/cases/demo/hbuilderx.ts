import type { WatchCase } from '../../types'
import path from 'node:path'
import { appendTrailingSnippet, createStyleRuleSnippet, insertBeforeClosingTag, replaceExactSnippet } from '../../text'
import { buildHexScriptRoundConfigs, buildIssue33HighRiskRoundConfigs } from '../round-configs'

function mutateVueOptionsDataWithTemplateConsumer(
  source: string,
  payload: Parameters<NonNullable<WatchCase['scriptMutation']>['mutate']>[1],
) {
  return insertBeforeClosingTag(
    replaceExactSnippet(
      source,
      'title: \'Hello\'',
      `title: 'Hello',\n\t\t\t\t${payload.classVariableName}: '${payload.classLiteral}',\n\t\t\t\t__twWatchScriptMarker: '${payload.marker}'`,
      'vue options data title anchor',
    ),
    '</template>',
    `\t\t<view hidden :class="${payload.classVariableName}">{{ __twWatchScriptMarker }}</view>`,
  )
}

function createUniAppHBuilderXVue3Case(baseCwd: string, version: 'v3' | 'v4'): WatchCase {
  const projectName = `uni-app-vite-vue3-hbuilderx-tailwindcss-${version}` as const

  return {
    name: projectName,
    label: `demo/${projectName}`,
    project: `demo/${projectName}`,
    group: 'demo',
    cwd: path.resolve(baseCwd, `demo/${projectName}`),
    devScript: 'dev:mp-weixin',
    outputWxml: path.resolve(baseCwd, `demo/${projectName}/dist/dev/mp-weixin/pages/index/index.wxml`),
    outputJs: path.resolve(baseCwd, `demo/${projectName}/dist/dev/mp-weixin/pages/index/index.js`),
    outputStyleCandidates: [
      path.resolve(baseCwd, `demo/${projectName}/dist/dev/mp-weixin/app.wxss`),
      path.resolve(baseCwd, `demo/${projectName}/dist/dev/mp-weixin/main.css`),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, `demo/${projectName}/dist/dev/mp-weixin/app.wxss`),
      path.resolve(baseCwd, `demo/${projectName}/dist/dev/mp-weixin/main.css`),
    ],
    contentMutation: {
      sourceFile: path.resolve(baseCwd, `demo/${projectName}/pages/index/index.vue`),
      verifyEscapedIn: ['wxml'],
      roundConfigs: buildIssue33HighRiskRoundConfigs(),
      mutate(source, payload) {
        return insertBeforeClosingTag(
          source,
          '</template>',
          `<view class="${payload.classLiteral}">${payload.marker}-content</view>`,
        )
      },
    },
    templateMutation: {
      sourceFile: path.resolve(baseCwd, `demo/${projectName}/pages/index/index.vue`),
      verifyEscapedIn: ['wxml'],
      verifyClassLiteralIn: [],
      roundConfigs: buildHexScriptRoundConfigs(),
      mutate(source, payload) {
        return insertBeforeClosingTag(source, '</template>', `\t\t<view class="${payload.classLiteral}">${payload.marker}-template</view>`)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, `demo/${projectName}/pages/index/index.vue`),
      verifyEscapedIn: ['js'],
      verifyClassLiteralIn: [],
      roundConfigs: buildHexScriptRoundConfigs(),
      mutate(source, payload) {
        return mutateVueOptionsDataWithTemplateConsumer(source, payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, `demo/${projectName}/main.css`),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }
}

export function buildUniAppHBuilderXCases(baseCwd: string): WatchCase[] {
  return [
    createUniAppHBuilderXVue3Case(baseCwd, 'v3'),
    createUniAppHBuilderXVue3Case(baseCwd, 'v4'),
  ]
}
