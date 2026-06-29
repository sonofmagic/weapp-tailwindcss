import type { SidebarConfig } from './types'

/**
 * @description 指南
 */
const tutorialSidebar: SidebarConfig = [
  'intro',
  {
    type: 'doc',
    id: 'quick-start/install',
    label: '安装依赖',
  },
  {
    type: 'category',
    label: '各框架注册方式',
    collapsed: false,
    items: [
      {
        type: 'doc',
        id: 'quick-start/web',
        label: 'Web 直接使用',
      },
      {
        type: 'category',
        label: 'uni-app',
        collapsed: true,
        items: [
          {
            type: 'doc',
            label: 'CLI Vue3 Vite',
            id: 'quick-start/frameworks/uni-app-vite',
          },
          {
            type: 'doc',
            label: 'HBuilderX',
            id: 'quick-start/frameworks/hbuilderx',
          },
          {
            type: 'doc',
            label: 'CLI Vue2 Webpack（存量项目）',
            id: 'quick-start/frameworks/uni-app',
          },
          {
            type: 'doc',
            label: 'uni-app x',
            id: 'quick-start/frameworks/uni-app-x',
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
            label: 'Webpack / Vite',
            id: 'quick-start/frameworks/taro',
          },
        ],
      },
      {
        type: 'category',
        label: 'Weapp-vite',
        collapsed: true,
        items: [
          {
            type: 'doc',
            label: '快速接入',
            id: 'quick-start/native/install',
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
            label: 'Mpx',
            id: 'quick-start/frameworks/mpx',
          },
        ],
      },
      'quick-start/frameworks/api',
    ],
  },
  'quick-start/unocss',

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
