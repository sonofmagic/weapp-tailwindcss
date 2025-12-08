import type { SidebarConfig } from './types'

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
    type: 'doc',
    id: 'tailwindcss/bem-and-oocss',
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
    id: 'tailwindcss/style-isolation',
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

export default tailwindcssSidebar
