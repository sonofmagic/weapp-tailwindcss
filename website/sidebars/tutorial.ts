import type { SidebarConfig } from './types'

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
                items: ['uni-app-vite', 'uni-app-x'].map(x => `quick-start/frameworks/${x}`),
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
                label: 'Vite Vue3 CLI（推荐）',
                id: 'quick-start/v4/uni-app-vite',
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

export default tutorialSidebar
