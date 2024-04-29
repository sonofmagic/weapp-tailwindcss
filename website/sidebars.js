/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '快速开始(框架类)',
      items: [
        {
          type: 'doc',
          id: 'quick-start/install'
        },

        {
          type: 'doc',
          id: 'quick-start/this-plugin'
        },
        {
          items: ['uni-app', 'uni-app-vite', 'hbuilderx', 'taro', 'rax', 'mpx', 'native', 'api'].map((x) => 'quick-start/frameworks/' + x),
          label: '3.各个框架的注册方式',
          type: 'category',
          collapsed: false
        },
        {
          type: 'doc',
          id: 'quick-start/rem2rpx'
        }
      ],
      collapsed: false
    },
    {
      type: 'category',
      label: '快速开始(纯原生)',
      items: [
        {
          type: 'doc',
          id: 'quick-start/install'
        }
      ],
      collapsed: false
    },

    {
      type: 'doc',
      id: 'community'
    },

    {
      type: 'doc',
      id: 'quick-start/intelliSense'
    },

    // {
    //   type: 'doc',
    //   label: '从 v1 迁移到 v2',
    //   id: 'migrations/v1'
    // },

    {
      type: 'doc',
      label: '深入核心原理',
      id: 'principle/index'
    },
    {
      type: 'doc',
      label: '如何贡献',
      id: 'how-to-contribute'
    },
    {
      type: 'doc',
      label: 'Tailwindcss 原子类维护指南',
      id: 'tailwindcss-maintenance-book'
    },
    {
      type: 'link',
      href: 'https://github.com/sonofmagic/weapp-tailwindcss/issues/270',
      label: '谁在使用？'
    }
  ], // [{ type: 'autogenerated', dirName: '.' }]
  optionsSidebar: [
    {
      type: 'doc',
      id: 'options/index'
    },
    {
      type: 'doc',
      id: 'api-v2/interfaces/UserDefinedOptions'
    }

    // {
    //   type: 'autogenerated',
    //   dirName: 'api', // 'api' is the 'out' directory
    // },
    // {
    //   type: 'doc',
    //   id: 'api/modules.md', // 'api' is the 'out' directory
    // },
  ],
  issuesSidebar: [
    {
      type: 'doc',
      id: 'issues/index'
    },
    {
      type: 'doc',
      id: 'issues/use-with-nutui'
    },
    {
      type: 'doc',
      id: 'issues/css-vars'
    },
    {
      type: 'doc',
      id: 'issues/rpx-ambiguities'
    },
    {
      type: 'doc',
      id: 'options/comments'
    },
    {
      type: 'doc',
      id: 'issues/group-and-peer'
    },
    {
      type: 'doc',
      id: 'issues/v1',
      label: 'v1版本常见问题'
    },
    {
      type: 'doc',
      id: 'options/arbitrary-values'
    },
    {
      type: 'doc',
      id: 'issues/native-toutiao'
    },
    {
      type: 'doc',
      id: 'issues/format'
    },
    {
      type: 'doc',
      label: '跨端应用注意事项',
      id: 'multi-platform'
    }
  ],
  API: [
    {
      type: 'autogenerated',
      dirName: 'api' // 'api' is the 'out' directory
    }
  ],
  'API-CLI': [
    {
      type: 'autogenerated',
      dirName: 'api-cli' // 'api' is the 'out' directory
    }
  ],
  communitySidebar: [
    {
      type: 'doc',
      id: 'community/templates'
    },

    {
      type: 'doc',
      id: 'community/typography'
    },
    {
      type: 'doc',
      id: 'icons/index'
    },
    {
      type: 'doc',
      id: 'quick-start/apply-themes'
    },
    {
      type: 'doc',
      id: 'quick-start/uni-app-css-macro'
    },
    {
      type: 'doc',
      id: 'quick-start/build-or-import-outside-components'
    },
    {
      type: 'doc',
      label: '独立分包',
      id: 'quick-start/independent-pkg'
    },

    {
      type: 'doc',
      id: 'mangle/index'
    },
    {
      type: 'doc',
      label: 'wxs 的转义与处理',
      id: 'quick-start/wxs'
    },
    {
      type: 'doc',
      id: 'community/group'
    },
    // {
    //   type: 'doc',
    //   id: 'community/consult'
    // },
    {
      type: 'doc',
      id: 'community/plugins'
    }
  ],
  migrationsSidebar: [
    {
      type: 'doc',
      id: 'migrations/v2'
    },
    {
      type: 'doc',
      id: 'migrations/v1'
    },
    {
      type: 'doc',
      label: '旧有uni-app项目升级webpack5',
      id: 'upgrade/uni-app'
    },
    {
      type: 'doc',
      label: "What's new in v2",
      id: 'releases/v2'
    }
  ]

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
}

module.exports = sidebars
