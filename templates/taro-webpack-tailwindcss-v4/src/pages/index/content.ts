export type Highlight = {
  title: string
  description: string
}

export type WorkflowStep = {
  label: string
  detail: string
  tip: string
}

export type Stat = {
  value: string
  description: string
}

export type Resource = {
  title: string
  body: string
}

export type Capability = {
  title: string
  badges: string[]
  points: string[]
  footer: string
}

export type Token = {
  title: string
  sample: string
  detail: string
}

export type ReleaseHighlight = {
  version: string
  summary: string
  bullets: string[]
}

export const highlights: Highlight[] = [
  {
    title: 'Tailwind CSS v4 Ready',
    description:
      'tailwindcss@4 的零配置调色、全新语义 token 以及更轻量的构建流程已经全部打包在脚手架中，随时开箱即用。',
  },
  {
    title: '跨端体验一致',
    description:
      'Weapp + H5 + RN 同步使用原子类，和设计稿保持 1:1 的 spacing 与字体系统，提升交付效率。',
  },
  {
    title: '组件驱动思维',
    description:
      '配合 Taro Hooks 与抽象 UI Section，可以快速积累可复用的模板，持续演进产品体验。',
  },
  {
    title: '设计到代码一体化',
    description: '借助设计 token 与 CSS 变量映射，视觉迭代不再需要重写样式，直接修改 token 即可全局生效。',
  },
]

export const workflow: WorkflowStep[] = [
  {
    label: '初始化项目',
    detail: 'pnpm dlx @tarojs/cli init my-app',
    tip: '选择 weapp-tailwindcss 模板即可获得 v4 支持',
  },
  {
    label: '编码与调试',
    detail: 'pnpm dev:weapp | pnpm dev:h5',
    tip: 'JIT 实时刷新风格，调试体验接近 Web',
  },
  {
    label: '持续交付',
    detail: 'pnpm build && pnpm test',
    tip: '结合 CI 可自动生成按需产物与依赖上报',
  },
  {
    label: '设计联动',
    detail: 'figma token → tailwind preset',
    tip: '通过 design token 流水线统一栅格、颜色与圆角',
  },
]

export const stats: Stat[] = [
  { value: '240ms', description: '平均样式生成耗时' },
  { value: '120+', description: '预置语义颜色 token' },
  { value: '98%', description: '跨端视觉一致性' },
  { value: '0 config', description: 'Tailwind 默认配置项' },
  { value: '24rpx grid', description: '默认步进与间距体系' },
  { value: 'A11y ready', description: '语义颜色保证对比度' },
]

export const quickActions = ['pnpm dev', 'pnpm build', 'pnpm preview', 'pnpm test', 'pnpm lint']

export const resources: Resource[] = [
  {
    title: '入门指南',
    body: '从环境搭建、Tailwind 设计体系到部署上线，一篇文档搞定。',
  },
  {
    title: '组件示例',
    body: '常见卡片、布局、图表全部由原子类驱动，可直接复制粘贴。',
  },
  {
    title: '设计 Token 管理',
    body: '演示如何把品牌色、圆角、阴影映射到 tailwindcss@4 的自定义属性。',
  },
  {
    title: '跨端规范',
    body: '收录 Weapp/H5 差异化样式示例，并提供推荐的原子类组合。',
  },
]

export const capabilities: Capability[] = [
  {
    title: '体验驱动',
    badges: ['JIT', 'Dark mode', 'Layered Gradient'],
    points: [
      '通过 v4 原生的 @theme token，在同一套代码下支持亮暗双模式。',
      '细粒度渐变和 blur 特效可直接映射到小程序，适合沉浸式首页。',
      '统一的 spacing/typography 刻度帮助保持设计一致性。',
    ],
    footer: 'Tailwind v4 把设计 token 变成一等公民，真实提升跨端一致性。',
  },
  {
    title: '工程效率',
    badges: ['Preset', 'CLI', 'CI-ready'],
    points: [
      'tailwindcss CLI + watch 支持 rpx 单位，无需额外配置文件。',
      '在 CI 中通过 `pnpm dlx tailwindcss -i src/app.css -o dist/index.css` 即可完成产物生成。',
      '多端样式隔离策略示例：H5 专属 hover 动效与 Weapp 保守降级。',
    ],
    footer: '工程链路开箱即用，适合快速搭建 MVP 与持续优化。',
  },
  {
    title: '可复用的 UI Section',
    badges: ['Composition', 'Slot', 'Token aware'],
    points: [
      '每个区块都可独立传入数据，复用到其他页面或营销落地页。',
      '支持通过 props 注入品牌色 token，形成多主题变体。',
      '演示如何把列表、时间轴与指标卡片封装成可迭代的 Section。',
    ],
    footer: '抽象 Section 让产品体验的演进更加平滑。',
  },
]

export const tokens: Token[] = [
  {
    title: 'Surface / Depth',
    sample: 'bg-slate-950/90 backdrop-blur-lg ring-1 ring-white/10',
    detail: '通过半透明背景与 ring 营造层次感，适合展示高价值信息的卡片。',
  },
  {
    title: 'Accent / Glow',
    sample: 'bg-gradient-to-r from-emerald-500/15 via-cyan-400/10 to-indigo-500/15 shadow-[0_24rpx_64rpx_rgba(16,185,129,0.24)]',
    detail: '高饱和度渐变与柔和阴影的组合，突出 Tailwind 的品牌氛围。',
  },
  {
    title: 'Typography Rhythm',
    sample: 'tracking-[6rpx] leading-[1.4] text-[30rpx]',
    detail: '保持舒适的字符间距和行高，针对中文与数字混排优化可读性。',
  },
  {
    title: 'Grid & Spacing',
    sample: 'grid grid-cols-2 gap-[28rpx] px-[32rpx] py-[28rpx]',
    detail: '使用固定步进 rpx 刻度，保证设计稿与真机 1:1 匹配。',
  },
]

export const releaseHighlights: ReleaseHighlight[] = [
  {
    version: 'tailwindcss@4.0',
    summary: '零配置的 CSS 变量主题化能力 + 更轻的 CLI 构建体验。',
    bullets: [
      '内置 @theme token 与语义化颜色，减少自定义配置文件。',
      '即时生成器缩短增量构建时间，适合频繁调试。',
      '新增 utilities 支持 `:where` 选择器，优化样式优先级。',
    ],
  },
  {
    version: 'taro-webpack-tailwindcss-v4 模板',
    summary: '跨端样式与脚手架整合，专为多端一致性设计。',
    bullets: [
      'Weapp/H5 共用原子类，附带 hover/active 的优雅降级示例。',
      '内置 lint + test 配置，帮助快速接入 CI/CD。',
      '提供 Section 级别的 UI 模版，便于复制扩散到其他页面。',
    ],
  },
]
