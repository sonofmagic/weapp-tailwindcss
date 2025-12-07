import type { SidebarConfig } from './types'

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

export default communitySidebar
