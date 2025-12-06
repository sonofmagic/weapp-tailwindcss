import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

type SidebarConfig = SidebarsConfig[string]

/**
 * @description 指南
 */
const tutorialSidebar: SidebarConfig = [
  'intro',
  {
    type: 'category',
    label: '🔥Tailwind CSS @3.x',
    collapsed: false,
    items: [
      {
        type: 'category',
        label: '🔥快速开始(框架类)',
        items: [
          {
            type: 'doc',
            id: 'quick-start/install',
          },

          {
            type: 'doc',
            id: 'quick-start/this-plugin',
          },
          {
            items: [
              {
                type: 'category',
                label: 'uni-app',
                items: ['uni-app', 'uni-app-vite', 'hbuilderx', 'uni-app-x'].map(x => `quick-start/frameworks/${x}`),
              },
              ...['taro', 'rax', 'mpx', 'native', 'api'].map(x => `quick-start/frameworks/${x}`),
            ],
            label: '3. 各个框架的注册方式',
            type: 'category',
            collapsed: true,
          },
          {
            type: 'doc',
            id: 'quick-start/rem2rpx',
          },
        ],
        collapsed: false,
      },
      {
        type: 'category',
        label: '🔥快速开始(纯原生)',
        items: [
          {
            type: 'doc',
            id: 'quick-start/native/install',
          },
          {
            type: 'doc',
            id: 'quick-start/native/install-plugin',
          },
          // {
          //   type: 'doc',
          //   id: 'quick-start/native/principle',
          // },
        ],
        collapsed: false,
      },
    ],
  },
  {
    type: 'category',
    label: '🧪Tailwind CSS @4.x',
    collapsed: false,
    items: [
      {
        type: 'category',
        label: '各个框架的注册方式',
        items: [
          {
            type: 'category',
            label: 'uni-app',
            collapsed: true,
            items: [
              {
                type: 'doc',
                label: 'Vite Vue3 CLI',
                id: 'quick-start/v4/uni-app-vite',
              },
              {
                type: 'doc',
                label: 'Webpack Vue2 CLI',
                id: 'quick-start/v4/uni-app-webpack',
              },
              {
                type: 'doc',
                label: 'HBuilderX',
                id: 'quick-start/v4/uni-app-vite-hbuilder',
              },
              {
                type: 'doc',
                label: 'uni-app x',
                id: 'quick-start/v4/uni-app-x',
              },
            ],
          },
          {
            type: 'category',
            label: 'Taro',
            items: [
              {
                type: 'doc',
                label: 'Webpack',
                id: 'quick-start/v4/taro-webpack',
              },
              {
                type: 'doc',
                label: 'Vite',
                id: 'quick-start/v4/taro-vite',
              },
            ],
          },
          {
            type: 'doc',
            id: 'quick-start/v4/weapp-vite',
          },
          {
            type: 'doc',
            id: 'quick-start/v4/mpx',
          },
        ],
      },
      {
        type: 'doc',
        id: 'quick-start/v4/readme',
      },
      {
        type: 'category',
        label: '进阶攻略',
        collapsed: true,
        items: [
          {
            type: 'doc',
            id: 'quick-start/v4/tutorial/index',
          },
          {
            type: 'doc',
            id: 'quick-start/v4/tutorial/workflow',
          },
          {
            type: 'doc',
            id: 'quick-start/v4/tutorial/advanced',
          },
        ],
      },
    ],
  },

  {
    type: 'category',
    label: '🔥uni-app x 专题',
    collapsed: false,
    items: [
      // {
      //   type: 'link',
      //   label: '模板项目（推荐）',
      //   href: 'https://github.com/icebreaker-template/uni-app-x-hbuilderx',
      // },
      {
        type: 'doc',
        id: 'uni-app-x/index',
        label: '前言',
      },
      {
        type: 'doc',
        id: 'uni-app-x/install',
        label: '快速集成',
      },
    ],
  },
  {
    type: 'doc',
    id: 'community/templates',
    label: '🔥快速开始(模板项目)',
  },
  {
    type: 'category',
    label: '🛠️ 工具与 CLI',
    collapsed: false,
    items: [
      {
        type: 'doc',
        id: 'tools/weapp-tw-cli',
      },
    ],
  },
  {
    type: 'doc',
    id: 'multi-platform',
  },
  {
    type: 'doc',
    id: 'community',
  },

  {
    type: 'doc',
    id: 'quick-start/intelliSense',
  },
  {
    type: 'doc',
    id: 'quick-start/css-unit-transform',
  },
  {
    type: 'doc',
    id: 'options/exports',
    label: '包导出总览',
  },

  // {
  //   type: 'doc',
  //   label: '从 v1 迁移到 v2',
  //   id: 'migrations/v1'
  // },
  {
    type: 'doc',
    id: 'quick-start/v2/index',
    label: '🗑️Tailwind CSS @2.x',
  },
  {
    type: 'doc',
    label: '如何贡献',
    id: 'how-to-contribute',
  },

  {
    type: 'link',
    href: 'https://github.com/sonofmagic/weapp-tailwindcss/issues/270',
    label: '谁在使用？',
  },
]

const tailwindcssSidebar: SidebarConfig = [
  {
    type: 'doc',
    id: 'tailwindcss/index',
  },
  {
    type: 'category',
    label: '样式方案与组件库演进',
    collapsed: false,
    link: { type: 'doc', id: 'tailwindcss/history/history-and-evolution' },
    items: [
      'tailwindcss/history/history-raw-css',
      'tailwindcss/history/history-preprocessors',
      'tailwindcss/history/history-css-modules',
      'tailwindcss/history/history-css-in-js',
      'tailwindcss/history/history-utility-first',
      'tailwindcss/history/history-headless-tokens',
    ],
  },
  {
    type: 'category',
    label: 'Tailwind 设计与对比',
    collapsed: false,
    link: { type: 'doc', id: 'tailwindcss/tailwind-core' },
    items: [
      'tailwindcss/tailwind-vs-unocss',
      'tailwindcss/merge-and-variants',
    ],
  },
  {
    type: 'doc',
    id: 'tailwindcss/best-practices',
  },
  {
    type: 'doc',
    id: 'tailwindcss/ai-friendly-and-demos',
  },
  {
    type: 'doc',
    id: 'tailwindcss/demos',
  },
]

/**
 * @description 配置项(已经废弃)
 */
const optionsSidebar: SidebarConfig = [
  {
    type: 'doc',
    id: 'api/interfaces/UserDefinedOptions',
    label: '配置项(v3.x)',
  },
  {
    type: 'doc',
    id: 'api-v2/interfaces/UserDefinedOptions',
  },

  // {
  //   type: 'autogenerated',
  //   dirName: 'api', // 'api' is the 'out' directory
  // },
  // {
  //   type: 'doc',
  //   id: 'api/modules.md', // 'api' is the 'out' directory
  // },
]

/**
 * @description 常见问题
 */
const issuesSidebar: SidebarConfig = [
  {
    type: 'doc',
    id: 'issues/index',
  },
  {
    type: 'doc',
    id: 'issues/box-sizing',
  },
  {
    type: 'doc',
    id: 'issues/use-with-nutui',
  },
  {
    type: 'doc',
    id: 'issues/use-with-taroify',
  },
  {
    type: 'doc',
    id: 'issues/externalClasses',
  },
  {
    type: 'doc',
    id: 'issues/css-vars',
  },
  {
    type: 'doc',
    id: 'issues/rpx-ambiguities',
  },
  // 写在 js 中的 tailwindcss 任意值
  {
    type: 'doc',
    id: 'issues/js-string-invalid',
  },
  {
    type: 'doc',
    id: 'issues/monorepo',
  },
  {
    type: 'doc',
    id: 'issues/taro-terser',
  },
  {
    type: 'doc',
    id: 'options/comments',
  },
  {
    type: 'doc',
    id: 'issues/group-and-peer',
  },
  {
    type: 'doc',
    id: 'options/arbitrary-values',
  },
  {
    type: 'doc',
    id: 'issues/native-toutiao',
  },
  {
    type: 'doc',
    id: 'issues/format',
  },
  {
    type: 'doc',
    id: 'issues/more-tags',
  },
  {
    type: 'doc',
    id: 'issues/at-apply',
  },
  {
    type: 'doc',
    id: 'issues/toast-svg-bug',
  },
  {
    type: 'doc',
    id: 'issues/v1',
    label: 'v1版本常见问题',
  },
  {
    type: 'doc',
    label: '深入核心原理',
    id: 'principle/index',
  },
  {
    type: 'doc',
    label: 'Tailwindcss 原子类维护指南',
    id: 'tailwindcss-maintenance-book',
  },
]

/**
 * @description 新版本配置项
 */
const API: SidebarConfig = [
  {
    type: 'autogenerated',
    dirName: 'api', // 'api' is the 'out' directory
  },
]

/**
 * @description 生态以及解决方案
 */
const communitySidebar: SidebarConfig = [
  {
    type: 'doc',
    id: 'community/templates',
  },
  {
    type: 'doc',
    id: 'icons/index',
  },
  {
    type: 'category',
    label: '@weapp-tailwindcss/merge',
    collapsed: false,
    items: [
      'community/merge/overview',
      'community/merge/runtime-api',
      'community/merge/cva-and-variants',
      'community/merge/integration',
    ],
  },
  {
    type: 'doc',
    id: 'quick-start/apply-themes',
  },
  {
    type: 'doc',
    id: 'quick-start/uni-app-css-macro',
  },
  {
    type: 'doc',
    id: 'quick-start/build-or-import-outside-components',
  },
  {
    type: 'doc',
    label: '独立分包',
    id: 'quick-start/independent-pkg',
  },

  {
    type: 'doc',
    id: 'community/load-font',
  },
  {
    type: 'doc',
    label: 'wxs 的转义与处理',
    id: 'quick-start/wxs',
  },
  {
    type: 'doc',
    id: 'community/group',
  },
  // {
  //   type: 'doc',
  //   id: 'community/consult'
  // },
  {
    type: 'doc',
    id: 'community/plugins',
  },
  {
    type: 'doc',
    id: 'community/typography',
  },

]

/**
 * @description 迁移指南
 */
const migrationsSidebar: SidebarConfig = [
  {
    type: 'doc',
    id: 'migrations/v3',
  },
  {
    type: 'doc',
    id: 'migrations/v2',
  },
  {
    type: 'doc',
    id: 'migrations/v1',
  },
  {
    type: 'doc',
    label: '旧有uni-app项目升级webpack5',
    id: 'upgrade/uni-app',
  },
  {
    type: 'doc',
    label: 'What\'s new in v2',
    id: 'releases/v2',
  },
]

const sidebars: SidebarsConfig = {
  tutorialSidebar,
  optionsSidebar,
  issuesSidebar,
  API,
  communitySidebar,
  migrationsSidebar,
  tailwindcssSidebar,
}

module.exports = sidebars
