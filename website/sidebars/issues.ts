import type { SidebarConfig } from './types'

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

export default issuesSidebar
