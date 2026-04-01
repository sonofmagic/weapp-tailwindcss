export const talkMeta = {
  title: '小程序还能这么写？',
  subtitle: 'AI 出样式，Tailwind 跑全端',
  date: '2026-04-02 Live',
}

export const slides = [
  {
    type: 'cover',
    title: '小程序还能这么写？',
    subtitle: 'AI 出样式，Tailwind 跑全端',
    tagline: '一句话描述界面 -> AI 生成 Tailwind 类名 -> weapp-tailwindcss 自动转译 -> 小程序直接预览',
  },
  {
    title: '样式时间花在哪',
    subtitle: '你到底花了多少时间在写样式',
    bullets: [
      '上周写了多少行样式？',
      '多少时间花在调间距、圆角、阴影？',
      '你是在写业务，还是在搬像素？',
      '小程序还多一层平台和多端负担。',
    ],
  },
  {
    title: '旧范式为什么慢',
    subtitle: '问题不在努力，问题在工作流',
    bullets: [
      '表达成本高：想的是界面，写的是属性。',
      '试错成本高：知道不对，但定位很慢。',
      '跨端一致性差：不同链路各有坑。',
      '反馈链路长：设计稿、IDE、开发者工具来回切。',
    ],
  },
  {
    title: '从属性切到意图',
    subtitle: '旧范式 vs 新范式',
    bullets: [
      '旧：先想 CSS 属性。',
      '新：先说界面意图。',
      '旧：人肉反复试错。',
      '新：AI 先给可运行起点。',
    ],
    highlight: '以前写的是像素，现在写的是意图。',
  },
  {
    title: '先看结果',
    subtitle: '一句话，直接出一版 UI',
    bullets: [
      '渐变卡片',
      '大圆角',
      '柔和阴影',
      '标题 / 副标题 / CTA',
    ],
    note: 'Prompt 示例：做一个渐变卡片，大圆角，柔和阴影，标题 32rpx，副标题 24rpx，底部一个高亮 CTA。',
  },
  {
    title: '为什么是 Tailwind',
    subtitle: '它比传统 CSS 更适合 AI',
    bullets: [
      '可枚举：词汇表稳定。',
      '可组合：天然适合拼装。',
      '可约束：比自由 CSS 少发散。',
      '更稳定：输出类名，不是大段 CSS。',
    ],
  },
  {
    title: '三层模型',
    subtitle: '意图 -> 原子类 -> 小程序',
    bullets: [
      '你：描述界面意图。',
      'AI：生成 Tailwind 类名。',
      'weapp-tailwindcss：翻译到小程序。',
      '职责拆开，链路才稳定。',
    ],
    highlight: 'AI 不直接对接小程序，它先对接 Tailwind 这层表达语言。',
  },
  {
    title: '它不只是插件',
    subtitle: 'weapp-tailwindcss 是一条工程链路',
    bullets: [
      '不是单点插件，是完整方案。',
      '支持多构建工具和 Node API。',
      '覆盖多框架、多端、运行时适配。',
      '把类名真正跑到小程序里。',
    ],
  },
  {
    title: '支持矩阵',
    subtitle: '覆盖主流小程序开发路线',
    bullets: [
      'webpack',
      'vite',
      'rspack',
      'rollup / rolldown',
      'gulp',
      '以及这些基底上的框架生态',
    ],
  },
  {
    title: '这不是 PPT 工程',
    subtitle: 'demo、templates、Skill、E2E、benchmark 都在仓库里',
    bullets: [
      'demo/*：真实可跑样例',
      'templates.jsonc：模板矩阵',
      'Skill：AI 工作流产品化',
      'watch / HMR：关注反馈速度',
      'benchmark：统一口径比较体验',
    ],
  },
  {
    title: '主 Demo 就选它',
    subtitle: 'demo/uni-app-tailwindcss-v4',
    bullets: [
      '直观：5 分钟就能起页。',
      '稳定：直播容错高。',
      '贴近业务：不是玩具 Demo。',
      '适合讲 patch、插件、样式入口。',
    ],
  },
  {
    title: '关键配置 1',
    subtitle: '先记住 patch',
    bullets: [
      'patch 链路不能漏。',
      '任意值问题常和它有关。',
      'JS / TS 字符串 class 也常和它有关。',
      '很多坑的根，就是 patch 没接好。',
    ],
  },
  {
    title: '关键配置 2',
    subtitle: '再看 vite 插件',
    bullets: [
      'uni()',
      'Tailwind 插件',
      'UnifiedViteWeappTailwindcssPlugin',
      'Tailwind 之后还要过一层小程序适配。',
    ],
  },
  {
    title: '关键配置 3',
    subtitle: '样式入口长什么样',
    bullets: [
      'Tailwind 入口',
      '主题变量',
      '配置承载点',
      '这里不是业务 CSS 堆叠，而是系统入口。',
    ],
  },
  {
    title: 'AI Workflow',
    subtitle: '让 AI 不只是写代码，而是按流程做事',
    bullets: [
      '先收集上下文',
      '再输出配置',
      '再给验证步骤',
      '再给回滚方案',
    ],
    highlight: 'AI 工程化的关键不是“更会写”，而是“更会按流程交付”。',
  },
  {
    title: '先把问题问对',
    subtitle: '最小上下文决定方案质量',
    bullets: [
      '框架',
      '构建器',
      '目标端',
      'Tailwind 版本',
      '包管理器',
    ],
    note: '上下文不完整，AI 就会漏风。',
  },
  {
    title: '输出的不只是代码',
    subtitle: '而是一套落地结果',
    bullets: [
      '修改文件清单',
      '可复制配置',
      '安装命令',
      '验证步骤',
      '回滚方案',
    ],
  },
  {
    title: '进阶技巧',
    subtitle: '真正容易踩坑的是这些地方',
    bullets: [
      '任意值与 rpx',
      '动态 class 要枚举',
      'space-y / space-x 的标签限制',
      'twMerge / cva / cn',
      'uni-app x 的全端故事',
    ],
  },
  {
    title: '工程信号',
    subtitle: '从能跑走向可验证',
    bullets: [
      'HMR：关注“改完多久看到结果”',
      'benchmark：用统一口径讨论体验',
      '重点不是谁必赢，而是谁更工程化',
      '今天学到的是一条工作流',
    ],
  },
  {
    type: 'closing',
    title: '最后一句话',
    subtitle: '别再把样式开发当体力活',
    bullets: [
      'AI 写意图',
      'Tailwind 做语言',
      'weapp-tailwindcss 负责翻译',
      '从下一个页面开始试',
    ],
    tagline: '先跑一个 demo，再装 Skill，再用一句真实需求试一次 AI 出样式。',
  },
]
