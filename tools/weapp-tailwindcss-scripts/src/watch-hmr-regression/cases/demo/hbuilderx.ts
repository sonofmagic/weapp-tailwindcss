import type { WatchCase } from '../../types'
import path from 'node:path'
import { appendTrailingSnippet, createStyleRuleSnippet, insertBeforeClosingTag } from '../../text'
import { buildHexScriptRoundConfigs, buildIssue33HighRiskRoundConfigs } from '../round-configs'

const webDomMarkerAttr = 'data-tw-watch-web-dom="1"'

function mutateVueOptionsDataWithTemplateConsumer(
  source: string,
  payload: Parameters<NonNullable<WatchCase['scriptMutation']>['mutate']>[1],
) {
  const titleMatched = source.match(/title:\s*'[^']*'/)
  if (!titleMatched) {
    throw new Error('vue options data title anchor not found')
  }

  return insertBeforeClosingTag(
    source.replace(
      titleMatched[0],
      `${titleMatched[0]},\n\t\t\t\t${payload.classVariableName}: '${payload.classLiteral}',\n\t\t\t\t__twWatchScriptMarker: '${payload.marker}'`,
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
    webHmr: {
      devScript: 'dev:h5',
      sourceFile: path.resolve(baseCwd, `demo/${projectName}/pages/index/index.vue`),
      cssEntryFile: path.resolve(baseCwd, `demo/${projectName}/main.css`),
      readySelector: 'uni-page[data-page="pages/index/index"]',
      initialMutationDelayMs: 1500,
      injectMarkerElement: true,
      mutate(source, payload) {
        return `${source}\n<!-- ${payload.marker} ${payload.classLiteral} -->`
      },
      sourceDomReplacementSequence: [
        {
          label: 'title and color to text-[red]',
          mutate(source) {
            const classMatched = source.match(/class="text-\[(?:#[0-9a-fA-F]{6}|red)\]"/)
            const titleMatched = source.match(/title:\s*'[^']*'/)
            if (!classMatched || !titleMatched) {
              throw new Error('HBuilderX web HMR source DOM anchor not found')
            }
            const next = source
              .replace(classMatched[0], `${webDomMarkerAttr} class="text-[red]"`)
              .replace(titleMatched[0], `title: 'H5-HMR-HBUILDERX-${version.toUpperCase()}'`)
            return {
              next,
              from: `${classMatched[0]} ${titleMatched[0]}`,
              to: `${webDomMarkerAttr} class="text-[red]" title: 'H5-HMR-HBUILDERX-${version.toUpperCase()}'`,
            }
          },
          expectedText: `H5-HMR-HBUILDERX-${version.toUpperCase()}`,
          expectedStyle: {
            color: 'rgb(255, 0, 0)',
          },
        },
      ],
    },
  }
}

export function buildUniAppHBuilderXCases(baseCwd: string): WatchCase[] {
  return [
    createUniAppHBuilderXVue3Case(baseCwd, 'v3'),
    createUniAppHBuilderXVue3Case(baseCwd, 'v4'),
  ]
}
