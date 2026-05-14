import type { SidebarConfig } from './types'

/**
 * @description 指南
 */
const tutorialSidebar: SidebarConfig = [
  'intro',
  {
    type: 'doc',
    id: 'quick-start/install',
    label: '快速使用',
  },
  {
    type: 'category',
    label: '各框架注册方式',
    collapsed: false,
    items: [
      {
        type: 'category',
        label: 'uni-app',
        collapsed: true,
        items: [
          {
            type: 'doc',
            label: 'CLI Vue3 Vite（Tailwind CSS 3.x）',
            id: 'quick-start/frameworks/uni-app-vite',
          },
          {
            type: 'doc',
            label: 'CLI Vue3 Vite（Tailwind CSS 4.x）',
            id: 'quick-start/v4/uni-app-vite',
          },
          {
            type: 'doc',
            label: 'HBuilderX Vue3 Vite（Tailwind CSS 3.x）',
            id: 'quick-start/frameworks/hbuilderx',
          },
          {
            type: 'doc',
            label: 'HBuilderX Vue3 Vite（Tailwind CSS 4.x）',
            id: 'quick-start/v4/uni-app-vite-hbuilder',
          },
          {
            type: 'link',
            label: 'HBuilderX Vue2 Webpack（存量项目）',
            href: '/docs/quick-start/frameworks/hbuilderx#hbuilderx-vue2-webpack',
          },
          {
            type: 'doc',
            label: 'CLI Vue2 Webpack（Tailwind CSS 3.x）',
            id: 'quick-start/frameworks/uni-app',
          },
          {
            type: 'doc',
            label: 'CLI Vue2 Webpack（Tailwind CSS 4.x）',
            id: 'quick-start/v4/uni-app-webpack',
          },
          {
            type: 'doc',
            label: 'uni-app x（Tailwind CSS 3.x）',
            id: 'quick-start/frameworks/uni-app-x',
          },
          {
            type: 'doc',
            label: 'uni-app x（Tailwind CSS 4.x）',
            id: 'quick-start/v4/uni-app-x',
          },
        ],
      },
      {
        type: 'category',
        label: 'Taro',
        collapsed: true,
        items: [
          {
            type: 'doc',
            label: 'Webpack（Tailwind CSS 3.x）',
            id: 'quick-start/frameworks/taro',
          },
          {
            type: 'doc',
            label: 'Webpack（Tailwind CSS 4.x）',
            id: 'quick-start/v4/taro-webpack',
          },
          {
            type: 'doc',
            label: 'Vite（Tailwind CSS 4.x）',
            id: 'quick-start/v4/taro-vite',
          },
        ],
      },
      {
        type: 'category',
        label: '原生小程序',
        collapsed: true,
        items: [
          {
            type: 'doc',
            label: 'weapp-vite（Tailwind CSS 3.x）',
            id: 'quick-start/native/install',
          },
          {
            type: 'doc',
            label: 'Weapp-vite（Tailwind CSS 4.x）',
            id: 'quick-start/v4/weapp-vite',
          },
          {
            type: 'doc',
            label: '打包方案说明',
            id: 'quick-start/frameworks/native',
          },
        ],
      },
      {
        type: 'category',
        label: 'Mpx',
        collapsed: true,
        items: [
          {
            type: 'doc',
            label: 'Tailwind CSS 3.x',
            id: 'quick-start/frameworks/mpx',
          },
          {
            type: 'doc',
            label: 'Tailwind CSS 4.x',
            id: 'quick-start/v4/mpx',
          },
        ],
      },
      'quick-start/frameworks/rax',
      'quick-start/frameworks/api',
    ],
  },
  'quick-start/this-plugin',
  'quick-start/rem2rpx',

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

export default tutorialSidebar
