import type { BuildOutputCase } from './multiplatform-build-output/types'
import { DEMO_STYLE_INTEGRITY_CASES } from './demo-user-workflow/style-integrity-cases'
import {
  mpxCase,
  taroMiniCase,
  uniAppH5Case,
  uniAppMiniCase,
} from './multiplatform-build-output/case-factories'

export interface DemoUserWorkflowAssertion {
  label: string
  files: string[]
  contains?: Array<string | RegExp>
  notContains?: Array<string | RegExp>
}

export interface DemoUserWorkflowCase extends BuildOutputCase {
  userWorkflow: {
    surfaces: string[]
    styleSuffixes: string[]
    assertions: DemoUserWorkflowAssertion[]
  }
}

function workflowCase(
  item: BuildOutputCase,
  workflow: DemoUserWorkflowCase['userWorkflow'],
): DemoUserWorkflowCase {
  return {
    ...item,
    userWorkflow: workflow,
  }
}

const rawTailwindDirectiveRE = /@(import\s+["']tailwindcss|tailwind|apply|theme|source)\b/
const uniV4MiniStyle = [
  '.bg-_b_h0000ff_B',
  '.i-_bmdi--home_B',
  '.layer-card-v4',
  '.before_ccontent',
]
const uniV4Template = [
  'bg-_b_h0000ff_B',
  'i-_bmdi--home_B',
  'layer-card-v4',
  'bg-independent-subpackage-marker',
]
const taroV4Style = [
  '.h-_b300px_B',
  '.text-_b_hc31d6b_B',
  '.bg-_b_h123456_B',
  '.tw-page-style-watch-anchor',
]
const taroV4Template = [
  'h-_b300px_B',
  'text-_b_hc31d6b_B',
  'bg-_b_h123456_B',
]
const taroV4SubpackageTemplate = [
  'bg-independent-subpackage-marker',
  'before_ccontent',
]
const mpxV4Style = [
  '.bg-_b_h123456_B',
  '.w-_b300rpx_B',
  '.text-_b_hbada55_B',
  '.before_ccontent',
]
const mpxV4Template = [
  'bg-_b_h123456_B',
  'text-_b_hbada55_B',
  'bg-independent-subpackage-marker',
]

export const DEMO_USER_WORKFLOW_CORE_CASES: DemoUserWorkflowCase[] = [
  workflowCase(
    uniAppH5Case({
      project: 'uni-app-vite-tailwindcss-v4',
      styleContains: ['.i-\\[mdi--home\\]', '.layer-card-v4', '.rounded-full'],
    }),
    {
      surfaces: ['h5', 'vue-sfc-template', 'vue-sfc-script-class', 'ordinary-css', 'tailwind-layer', 'iconify'],
      styleSuffixes: ['.css'],
      assertions: [
        {
          label: 'H5 页面保留入口并生成 CSS',
          files: ['dist/build/h5/index.html'],
          contains: ['<html'],
        },
        {
          label: 'Vue SFC、脚本动态类、普通 CSS 和图标样式进入 H5 CSS',
          files: ['dist/build/h5'],
          contains: ['.i-\\[mdi--home\\]', '.layer-card-v4', '.bg-\\[\\#0000ff\\]', '.rounded-full'],
          notContains: [rawTailwindDirectiveRE],
        },
      ],
    },
  ),
  ...(['mp-alipay', 'mp-toutiao', 'mp-qq'] as const).map(platform =>
    workflowCase(
      uniAppMiniCase({
        project: 'uni-app-vite-tailwindcss-v4',
        platform,
        styleContains: uniV4MiniStyle,
      }),
      {
        surfaces: ['mini-program', 'vue-sfc-template', 'vue-sfc-script-class', 'ordinary-css', 'tailwind-layer', 'subpackage', 'iconify'],
        styleSuffixes: platform === 'mp-alipay'
          ? ['.acss']
          : platform === 'mp-toutiao'
            ? ['.ttss']
            : ['.qss'],
        assertions: [
          {
            label: 'uni-app 小程序分包样式文件生成提取样式',
            files: platform === 'mp-alipay'
              ? [`dist/build/${platform}/sub-independent/pages/index.acss`, `dist/build/${platform}/sub-normal/pages/index.acss`]
              : platform === 'mp-toutiao'
                ? [`dist/build/${platform}/sub-independent/pages/index.ttss`, `dist/build/${platform}/sub-normal/pages/index.ttss`]
                : [`dist/build/${platform}/sub-independent/pages/index.qss`, `dist/build/${platform}/sub-normal/pages/index.qss`],
            contains: [
              'view,text,::after,::before',
              'bg-independent-subpackage-marker',
              'bg-normal-subpackage-marker',
            ],
            notContains: ['@import', rawTailwindDirectiveRE],
          },
          {
            label: 'uni-app 小程序主包和分包样式都被生成',
            files: [`dist/build/${platform}`],
            contains: uniV4MiniStyle,
            notContains: [rawTailwindDirectiveRE],
          },
          {
            label: 'uni-app 小程序模板或脚本里使用转义后的类名',
            files: [`dist/build/${platform}`],
            contains: uniV4Template,
          },
        ],
      },
    ),
  ),
  workflowCase(
    taroMiniCase({
      project: 'taro-vite-react-tailwindcss-v4',
      packageName: '@weapp-tailwindcss-demo/taro-vite-react-tailwindcss-v4',
      platform: 'alipay',
      styleContains: taroV4Style,
      textContains: taroV4Template,
      status: 'ci',
    }),
    {
      surfaces: ['mini-program', 'tsx-className', 'ordinary-css', 'subpackage'],
      styleSuffixes: ['.acss'],
      assertions: [
        {
          label: 'Taro React 支付宝小程序输出真实 acss 并包含页面/分包样式',
          files: ['dist'],
          contains: taroV4Style,
          notContains: [rawTailwindDirectiveRE],
        },
        {
          label: 'Taro React 支付宝小程序脚本里保留转义 className',
          files: ['dist/pages/index/index.js'],
          contains: taroV4Template,
        },
        {
          label: 'Taro React 支付宝小程序分包脚本里保留转义 className',
          files: ['dist/sub-independent/pages/index.js'],
          contains: taroV4SubpackageTemplate,
        },
      ],
    },
  ),
  workflowCase(
    taroMiniCase({
      project: 'taro-vite-react-tailwindcss-v4',
      packageName: '@weapp-tailwindcss-demo/taro-vite-react-tailwindcss-v4',
      platform: 'tt',
      styleContains: taroV4Style,
      textContains: taroV4Template,
      status: 'ci',
    }),
    {
      surfaces: ['mini-program', 'tsx-className', 'ordinary-css', 'subpackage'],
      styleSuffixes: ['.ttss'],
      assertions: [
        {
          label: 'Taro React 头条小程序输出真实 ttss 并包含页面/分包样式',
          files: ['dist'],
          contains: taroV4Style,
          notContains: [rawTailwindDirectiveRE],
        },
        {
          label: 'Taro React 头条小程序脚本里保留转义 className',
          files: ['dist/pages/index/index.js'],
          contains: taroV4Template,
        },
        {
          label: 'Taro React 头条小程序分包脚本里保留转义 className',
          files: ['dist/sub-independent/pages/index.js'],
          contains: taroV4SubpackageTemplate,
        },
      ],
    },
  ),
  ...(['wx', 'ali', 'swan', 'tt'] as const).map(platform =>
    workflowCase(
      mpxCase({
        project: 'mpx-tailwindcss-v4',
        version: 'v4',
        platform,
        command: platform === 'wx'
          ? ['pnpm', 'exec', 'mpx-cli-service', 'build']
          : ['pnpm', 'exec', 'mpx-cli-service', 'build', '--mode', platform],
        env: {
          MPX_CURRENT_TARGET_MODE: platform,
        },
      }),
      {
        surfaces: ['mini-program', 'mpx-sfc-template', 'mpx-dynamic-class', 'ordinary-css', 'subpackage'],
        styleSuffixes: platform === 'ali'
          ? ['.acss']
          : platform === 'swan'
            ? ['.css', '.swan']
            : platform === 'tt'
              ? ['.ttss']
              : ['.wxss'],
        assertions: [
          {
            label: 'Mpx 主包样式覆盖常见模板与动态类',
            files: ['dist/wx/styles'],
            contains: mpxV4Style,
            notContains: [rawTailwindDirectiveRE],
          },
          {
            label: 'Mpx 模板里保留转义后的动态 class 与分包 class 结果',
            files: ['dist/wx'],
            contains: mpxV4Template,
          },
        ],
      },
    ),
  ),
  workflowCase(
    {
      name: 'gulp-tailwindcss-v4 tt',
      framework: 'gulp',
      projectDir: 'demo/gulp-tailwindcss-v4',
      platform: 'tt',
      command: ['pnpm', 'run', 'build:tt'],
      outputDir: 'dist',
      requiredFiles: [
        'dist/app.ttss',
        'dist/pages/index/index.ttml',
        'dist/pages/index/index.ttss',
        'dist/sub-normal/pages/index.ttml',
        'dist/sub-normal/pages/index.ttss',
      ],
      styleFiles: ['dist'],
      textFiles: ['dist'],
      styleContains: [
        '.bg-_b_hfff_B',
        '.text-_b_h123456_B',
        '.i-_bmdi--ab-testing_B',
        '.bg-normal-subpackage-marker',
        '.before_ccontent',
      ],
      textContains: [
        'bg-_burl',
        'text-_b_h123456_B',
        'bg-normal-subpackage-marker',
      ],
      notContains: [rawTailwindDirectiveRE],
      status: 'ci',
    },
    {
      surfaces: ['mini-program', 'native-template', 'script-dynamic-class', 'ordinary-scss', 'subpackage', 'iconify'],
      styleSuffixes: ['.ttss'],
      assertions: [
        {
          label: 'Gulp 头条小程序转换原生模板、脚本动态类、SCSS 和分包样式',
          files: ['dist'],
          contains: [
            '.bg-_b_hfff_B',
            '.text-_b_h123456_B',
            '.i-_bmdi--ab-testing_B',
            '.bg-normal-subpackage-marker',
            'bg-_burl',
            'text-_b_h123456_B',
          ],
          notContains: [rawTailwindDirectiveRE],
        },
      ],
    },
  ),
]

export const DEMO_USER_WORKFLOW_CASES: DemoUserWorkflowCase[] = [
  ...DEMO_USER_WORKFLOW_CORE_CASES,
  ...DEMO_STYLE_INTEGRITY_CASES,
]
