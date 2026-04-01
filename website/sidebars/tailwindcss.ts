import type { SidebarConfig } from './types'

const tailwindcssSidebar: SidebarConfig = [
  {
    type: 'doc',
    id: 'tailwindcss/index',
    label: '◉ 专题导览',
  },
  {
    type: 'category',
    label: '◫ 样式方案与组件库演进',
    collapsed: false,
    link: { type: 'doc', id: 'tailwindcss/history/history-style-evolution' },
    items: [
      'tailwindcss/css-origin-evolution',
      'tailwindcss/history/history-component-evolution',
      {
        type: 'category',
        label: '◌ Raw CSS / BEM / OOCSS',
        collapsed: false,
        link: { type: 'doc', id: 'tailwindcss/history/history-raw-css' },
        items: [
          'tailwindcss/bem-and-oocss',
        ],
      },
      'tailwindcss/history/history-preprocessors',
      'tailwindcss/postcss',
      'tailwindcss/history/history-css-modules',
      'tailwindcss/history/history-css-in-js',
      'tailwindcss/history/history-utility-first',
      'tailwindcss/history/history-headless-tokens',
      'tailwindcss/history/history-future-generative-css',
    ],
  },
  {
    type: 'category',
    label: '◭ Tailwind 设计、生态与对比',
    collapsed: false,
    link: { type: 'doc', id: 'tailwindcss/tailwind-core' },
    items: [
      'tailwindcss/tailwind-vs-unocss',
      'tailwindcss/merge-and-variants',
      'tailwindcss/shadcn-ui',
    ],
  },
  {
    type: 'category',
    label: '◪ 工程约束与样式边界',
    collapsed: false,
    items: [
      'tailwindcss/best-practices',
      'tailwindcss/style-isolation',
    ],
  },
  {
    type: 'category',
    label: '◬ AI 与对照实验',
    collapsed: false,
    items: [
      'tailwindcss/ai-friendly-and-demos',
      'tailwindcss/demos',
    ],
  },
]

export default tailwindcssSidebar
