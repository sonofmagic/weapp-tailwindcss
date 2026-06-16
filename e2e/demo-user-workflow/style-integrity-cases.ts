import type { DemoUserWorkflowCase } from '../demo-user-workflow-cases'
import {
  mpxCase,
  taroMiniCase,
  uniAppH5Case,
} from '../multiplatform-build-output/case-factories'
import { rawTailwindDirectiveRE } from '../multiplatform-build-output/helpers'

function styleIntegrityCase(
  item: Omit<DemoUserWorkflowCase, 'userWorkflow'>,
  userWorkflow: DemoUserWorkflowCase['userWorkflow'],
): DemoUserWorkflowCase {
  return {
    ...item,
    userWorkflow,
  }
}

export const DEMO_STYLE_INTEGRITY_CASES: DemoUserWorkflowCase[] = [
  styleIntegrityCase(
    uniAppH5Case({
      project: 'uni-app-vite-tailwindcss-v3',
      styleContains: [
        '.raw-btn',
        '.btn',
        '.u-button',
        '.u-button--primary',
        '.u-reset-button',
      ],
    }),
    {
      surfaces: [
        'h5',
        'build-style-integrity',
        'dev-hmr-style-integrity',
        'vue-sfc-template',
        'user-authored-style',
        'third-party-component-style',
        'third-party-library-style',
      ],
      styleSuffixes: ['.css'],
      assertions: [
        {
          label: 'uni-app H5 build 保留用户在 tailwind.scss 中写的普通样式',
          files: ['dist/build/h5/assets'],
          contains: [
            '.raw-btn',
            '.btn',
          ],
          notContains: [rawTailwindDirectiveRE],
        },
        {
          label: 'uni-app H5 build 保留 uview-plus 第三方组件库样式',
          files: ['dist/build/h5/assets'],
          contains: [
            '.u-button',
            '.u-button--primary',
            '.u-reset-button',
          ],
        },
      ],
    },
  ),
  styleIntegrityCase(
    mpxCase({
      project: 'mpx-tailwindcss-v3',
      version: 'v3',
      platform: 'wx',
      command: ['pnpm', 'run', 'build'],
      env: {
        MPX_CURRENT_TARGET_MODE: 'wx',
      },
    }),
    {
      surfaces: [
        'mini-program',
        'build-style-integrity',
        'dev-hmr-style-integrity',
        'mpx-sfc-template',
        'user-authored-style',
        'third-party-component-style',
        'third-party-library-style',
      ],
      styleSuffixes: ['.wxss'],
      assertions: [
        {
          label: 'Mpx 微信小程序 build 保留用户在 SFC 中写的普通样式',
          files: ['dist/wx/styles'],
          contains: [
            '.bg-_b_h123456_B',
            '.bg-_burl',
            '.before_ccontent',
          ],
          notContains: [rawTailwindDirectiveRE],
        },
        {
          label: 'Mpx 微信小程序 build 保留 Vant 和 TDesign 第三方组件样式',
          files: ['dist/wx/components'],
          contains: [
            '.van-button',
            '.van-button--default',
            '.van-icon',
            '@font-face',
            '.t-button',
            '.t-button__content',
          ],
        },
      ],
    },
  ),
  styleIntegrityCase(
    taroMiniCase({
      project: 'taro-webpack-react-tailwindcss-v4',
      packageName: '@weapp-tailwindcss-demo/taro-webpack-react-tailwindcss-v4',
      platform: 'alipay',
      styleContains: [
        '.tw-page-style-watch-anchor',
        '.bg-_b_h534312_B',
      ],
      textContains: [
        'nut-button',
        'bg-_b_h534312_B',
      ],
      status: 'ci',
    }),
    {
      surfaces: [
        'mini-program',
        'build-style-integrity',
        'dev-hmr-style-integrity',
        'tsx-className',
        'user-authored-style',
        'third-party-component-usage',
      ],
      styleSuffixes: ['.acss'],
      assertions: [
        {
          label: 'Taro Webpack 支付宝小程序 build 保留页面用户自写样式',
          files: ['dist/pages/index/index.acss'],
          contains: ['.tw-page-style-watch-anchor'],
          notContains: [rawTailwindDirectiveRE],
        },
        {
          label: 'Taro Webpack 支付宝小程序 build 保留三方组件使用代码和页面类名',
          files: ['dist/pages/index/index.js'],
          contains: [
            'nut-button',
            'bg-_b_h534312_B',
          ],
        },
      ],
    },
  ),
]
