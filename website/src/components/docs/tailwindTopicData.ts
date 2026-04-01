export interface TailwindTopicCard {
  title: string
  description: string
  icon: string
  href?: string
  badge?: string
}

export interface TailwindTopicEntry {
  eyebrow: string
  summary: string
  highlights: string[]
  packages?: TailwindTopicCard[]
  solutions?: TailwindTopicCard[]
}

export const tailwindTopicData: Record<string, TailwindTopicEntry> = {
  'tailwindcss/index': {
    eyebrow: '专题导览',
    summary: '把演进历史、生态底座、工程实践、AI 工作流和 Demo 对照收成一张总图，先帮读者看清全局，再决定去哪一页深挖。',
    highlights: ['先看全局脉络', '再挑方案与工具', '最后落到工程约束'],
    packages: [
      { title: 'Tailwind CSS', description: '原子类与主题 token 的主线工具。', icon: 'icon-[mdi--weather-windy]', href: 'https://tailwindcss.com/', badge: 'Core' },
      { title: 'UnoCSS', description: '适合拿来对比灵活性、自定义规则与迁移成本。', icon: 'icon-[logos--unocss]', href: 'https://unocss.dev/', badge: 'Compare' },
      { title: 'PostCSS', description: '几乎所有现代 CSS 工具链都会经过它。', icon: 'icon-[logos--postcss]', href: 'https://postcss.org/', badge: 'Base' },
    ],
    solutions: [
      { title: '样式方案演化', description: '从 Raw CSS 到 Utility-first 的演进地图。', icon: 'icon-[mdi--timeline-outline]', href: '/docs/tailwindcss/history' },
      { title: '最佳实践', description: '把 token、variants、merge、评审清单串起来。', icon: 'icon-[mdi--check-decagram-outline]', href: '/docs/tailwindcss/best-practices' },
      { title: 'AI 与 Demo', description: '把提示模板、校验链和运行示例接入工程。', icon: 'icon-[mdi--robot-outline]', href: '/docs/tailwindcss/ai-friendly-and-demos' },
    ],
  },
  'tailwindcss/history/history-style-evolution': {
    eyebrow: '演进地图',
    summary: '把 CSS 方案放回真实时间线里看，重点不是背年代，而是理解每一步在解决什么问题，又留下了什么新边界。',
    highlights: ['适合选型讨论', '适合团队分享', '适合解释为什么会走到 Tailwind'],
    packages: [
      { title: 'Bootstrap', description: '全局组件类与样式框架时代的代表。', icon: 'icon-[logos--bootstrap]', href: 'https://getbootstrap.com/' },
      { title: 'Sass', description: '变量、嵌套、混入带来的第一轮工程化提速。', icon: 'icon-[logos--sass]', href: 'https://sass-lang.com/' },
      { title: 'styled-components', description: '组件边界与运行时样式时代的代表。', icon: 'icon-[mdi--application-braces-outline]', href: 'https://styled-components.com/' },
    ],
    solutions: [
      { title: 'Raw CSS 阶段', description: '看清最原始的全局命名和 reset 逻辑。', icon: 'icon-[mdi--language-css3]', href: '/docs/tailwindcss/history/raw-css' },
      { title: 'Utility-first 阶段', description: '理解 Tailwind / UnoCSS 如何改变组织方式。', icon: 'icon-[mdi--lightning-bolt-outline]', href: '/docs/tailwindcss/history/utility-first' },
      { title: 'Headless + Tokens', description: '把样式问题升级成组件抽象与设计系统问题。', icon: 'icon-[mdi--cube-outline]', href: '/docs/tailwindcss/history/headless-tokens' },
    ],
  },
  'tailwindcss/css-origin-evolution': {
    eyebrow: '问题起点',
    summary: '先回到 CSS 原生能力与全局样式的起点，理解为什么 reset、命名规范和构建工具会不断出现。',
    highlights: ['从浏览器默认样式讲起', '看清 reset 与 normalize 的边界', '理解现代方案为何层层叠加'],
    packages: [
      { title: 'normalize.css', description: '统一浏览器默认样式的经典基线方案。', icon: 'icon-[mdi--tune-variant]', href: 'https://necolas.github.io/normalize.css/' },
      { title: 'modern-normalize', description: '更现代、更轻量的默认样式重置。', icon: 'icon-[mdi--format-align-middle]', href: 'https://github.com/sindresorhus/modern-normalize' },
    ],
    solutions: [
      { title: 'Raw CSS / BEM', description: '看最直接的命名式样式工程。', icon: 'icon-[mdi--code-braces]', href: '/docs/tailwindcss/history/raw-css' },
      { title: 'PostCSS 生态', description: '从原生 CSS 走向插件化二次加工。', icon: 'icon-[logos--postcss]', href: '/docs/tailwindcss/postcss' },
    ],
  },
  'tailwindcss/bem-and-oocss': {
    eyebrow: '命名体系',
    summary: 'BEM 与 OOCSS 是现代组件命名和可复用样式组织的关键前史，今天很多 Tailwind 约束依然能找到它们的影子。',
    highlights: ['语义命名', '组件边界', '复用模式'],
    packages: [
      { title: 'SUIT CSS', description: '把组件命名体系进一步工程化的代表。', icon: 'icon-[mdi--alphabetical-variant]', href: 'https://suitcss.github.io/' },
      { title: 'Bootstrap', description: '大量语义类和组件类命名的现实样本。', icon: 'icon-[logos--bootstrap]', href: 'https://getbootstrap.com/' },
    ],
    solutions: [
      { title: 'Raw CSS 历史页', description: '回看 BEM / OOCSS 在当时到底解决了什么。', icon: 'icon-[mdi--history]', href: '/docs/tailwindcss/history/raw-css' },
      { title: '最佳实践', description: '理解为什么现代团队转向 token 和 variants。', icon: 'icon-[mdi--check-bold]', href: '/docs/tailwindcss/best-practices' },
    ],
  },
  'tailwindcss/history/history-raw-css': {
    eyebrow: '第一阶段',
    summary: 'Raw CSS 是所有后续方案的起点。它最直接，也最容易暴露全局污染、命名冲突和维护漂移。',
    highlights: ['零构建', '全局命名', '手动控制层叠'],
    packages: [
      { title: 'normalize.css', description: '浏览器默认样式统一的经典基线。', icon: 'icon-[mdi--minus-circle-outline]', href: 'https://necolas.github.io/normalize.css/' },
      { title: 'Bulma', description: '语义类与轻量组件框架的代表。', icon: 'icon-[logos--bulma]', href: 'https://bulma.io/' },
      { title: 'Pure.css', description: '小体积全局样式框架的另一类取舍。', icon: 'icon-[mdi--feather]', href: 'https://purecss.io/' },
    ],
    solutions: [
      { title: 'BEM / OOCSS', description: '通过命名约定减轻全局污染。', icon: 'icon-[mdi--shape-outline]', href: '/docs/tailwindcss/bem-and-oocss' },
      { title: 'CSS Modules', description: '把隔离问题交给编译期处理。', icon: 'icon-[mdi--shield-outline]', href: '/docs/tailwindcss/history/css-modules' },
    ],
  },
  'tailwindcss/history/history-preprocessors': {
    eyebrow: '预处理时代',
    summary: 'Sass / Less 把变量、嵌套、混入带进前端工程，第一次系统性解决“纯 CSS 写太慢”的问题。',
    highlights: ['变量与混入', '主题定制', '脚本化编译'],
    packages: [
      { title: 'Sass', description: '最成熟的 CSS 预处理器生态。', icon: 'icon-[logos--sass]', href: 'https://sass-lang.com/' },
      { title: 'Less', description: '偏轻量、语法亲和的预处理器路线。', icon: 'icon-[logos--less]', href: 'https://lesscss.org/' },
      { title: 'Stylus', description: '更自由语法风格的另一条路线。', icon: 'icon-[mdi--language-css3]', href: 'https://stylus-lang.com/' },
    ],
    solutions: [
      { title: 'PostCSS', description: '从语法糖转向插件平台的关键拐点。', icon: 'icon-[logos--postcss]', href: '/docs/tailwindcss/postcss' },
      { title: '样式方案演化', description: '把预处理器放回整条历史线里看。', icon: 'icon-[mdi--source-branch]', href: '/docs/tailwindcss/history' },
    ],
  },
  'tailwindcss/postcss': {
    eyebrow: '插件化底座',
    summary: 'PostCSS 是 Tailwind、Autoprefixer、CSS Modules 乃至很多编译期样式方案的共同底盘，理解它能让你看清生态边界。',
    highlights: ['AST 管线', '插件顺序敏感', '构建工具通用底座'],
    packages: [
      { title: 'Autoprefixer', description: '让前缀问题从手工劳动变成构建步骤。', icon: 'icon-[mdi--auto-fix]', href: 'https://github.com/postcss/autoprefixer', badge: 'Popular' },
      { title: 'postcss-preset-env', description: '把未来 CSS 语法分阶段带进工程。', icon: 'icon-[mdi--test-tube-empty]', href: 'https://preset-env.cssdb.org/' },
      { title: 'cssnano', description: '压缩与优化阶段常见的最终一环。', icon: 'icon-[mdi--zip-box-outline]', href: 'https://cssnano.github.io/cssnano/' },
    ],
    solutions: [
      { title: 'CSS Modules', description: '看 PostCSS 如何参与模块化与隔离。', icon: 'icon-[mdi--layers-triple-outline]', href: '/docs/tailwindcss/history/css-modules' },
      { title: 'Tailwind 核心机制', description: '理解 Tailwind 为什么必须站在 PostCSS 上。', icon: 'icon-[mdi--weather-windy]', href: '/docs/tailwindcss/tailwind-core' },
      { title: '隔离策略', description: '把 preflight、作用域和构建边界接起来。', icon: 'icon-[mdi--wall]', href: '/docs/tailwindcss/style-isolation' },
    ],
  },
  'tailwindcss/history/history-css-modules': {
    eyebrow: '隔离升级',
    summary: 'CSS Modules 代表了“让构建工具而不是人脑来管作用域”的阶段，隔离明确，但抽象也更依赖组件结构。',
    highlights: ['编译期哈希', '默认局部作用域', '主题与共享变量要单独设计'],
    packages: [
      { title: 'CSS Modules', description: '作用域哈希与映射文件的事实标准。', icon: 'icon-[mdi--pound-box-outline]', href: 'https://github.com/css-modules/css-modules' },
      { title: 'vanilla-extract', description: '把类型系统和编译期样式结合起来。', icon: 'icon-[mdi--ice-pop]', href: 'https://vanilla-extract.style/' },
    ],
    solutions: [
      { title: '样式隔离', description: '把 Modules 放进一组完整隔离策略里比较。', icon: 'icon-[mdi--shield-half-full]', href: '/docs/tailwindcss/style-isolation' },
      { title: 'CSS-in-JS 阶段', description: '看下一步为什么转向更强组件边界。', icon: 'icon-[mdi--application-braces-outline]', href: '/docs/tailwindcss/history/css-in-js' },
    ],
  },
  'tailwindcss/history/history-css-in-js': {
    eyebrow: '组件边界',
    summary: 'CSS-in-JS 把样式生成和组件状态彻底绑在一起，换来强动态能力，也把运行时成本和调试复杂度一起带来。',
    highlights: ['运行时注入', '主题系统', '强动态样式'],
    packages: [
      { title: 'styled-components', description: '最具代表性的 CSS-in-JS 路线。', icon: 'icon-[mdi--application-braces-outline]', href: 'https://styled-components.com/' },
      { title: 'Emotion', description: '灵活性与性能平衡更好的另一条主流路线。', icon: 'icon-[mdi--emoticon-outline]', href: 'https://emotion.sh/' },
      { title: 'Linaria', description: '把 CSS-in-JS 往零运行时方向推。', icon: 'icon-[mdi--flash-outline]', href: 'https://linaria.dev/' },
    ],
    solutions: [
      { title: 'Tailwind vs UnoCSS', description: '对比编译期原子类与运行时样式的取舍。', icon: 'icon-[mdi--compare-horizontal]', href: '/docs/tailwindcss/tailwind-vs-unocss' },
      { title: '生成式 CSS 未来', description: '看运行时与编译期边界如何继续融合。', icon: 'icon-[mdi--timeline-clock-outline]', href: '/docs/tailwindcss/history/future-generative-css' },
    ],
  },
  'tailwindcss/history/history-utility-first': {
    eyebrow: '原子化阶段',
    summary: 'Utility-first 把样式组织重点从“命名类”改成“组织约束”。类名不再是终点，token、variants、JIT 和评审链才是重点。',
    highlights: ['JIT', '摇树优化', 'token 对齐', '工程约束'],
    packages: [
      { title: 'Tailwind CSS', description: '原子化 CSS 生态与范式的中心。', icon: 'icon-[mdi--weather-windy]', href: 'https://tailwindcss.com/' },
      { title: 'UnoCSS', description: '更灵活的规则引擎与 preset 体系。', icon: 'icon-[logos--unocss]', href: 'https://unocss.dev/' },
      { title: 'Windi CSS', description: 'JIT 原子化思路的重要推动者。', icon: 'icon-[mdi--weather-windy]', href: 'https://windicss.org/' },
    ],
    solutions: [
      { title: 'Tailwind 设计理念', description: '理解 token、JIT、组件语义如何串起来。', icon: 'icon-[mdi--head-cog-outline]', href: '/docs/tailwindcss/tailwind-core' },
      { title: '最佳实践', description: '把 Utility-first 从“能写”推到“能维护”。', icon: 'icon-[mdi--clipboard-check-outline]', href: '/docs/tailwindcss/best-practices' },
    ],
  },
  'tailwindcss/history/history-headless-tokens': {
    eyebrow: '设计系统阶段',
    summary: '当团队开始维护组件库、多品牌和设计系统时，焦点会从“类名怎么写”转向“token、headless、variants 怎么协作”。',
    highlights: ['Headless 组件', 'Design Tokens', '变体工厂'],
    packages: [
      { title: 'Radix UI', description: '无样式交互 primitives 的核心代表。', icon: 'icon-[mdi--orbit-variant]', href: 'https://www.radix-ui.com/' },
      { title: 'Headless UI', description: 'Tailwind Labs 提供的无样式交互组件。', icon: 'icon-[mdi--view-quilt-outline]', href: 'https://headlessui.com/' },
      { title: 'tailwind-variants', description: '把 slots、recipes 和 merge 组织起来。', icon: 'icon-[mdi--shape-plus-outline]', href: 'https://www.tailwind-variants.org/' },
    ],
    solutions: [
      { title: 'shadcn/ui', description: '看复制源码模式怎样成为工程事实标准。', icon: 'icon-[mdi--library-outline]', href: '/docs/tailwindcss/shadcn-ui' },
      { title: 'merge / variants', description: '理解 cva、tv 与 tailwind-merge 的闭环。', icon: 'icon-[mdi--merge]', href: '/docs/tailwindcss/merge-and-variants' },
    ],
  },
  'tailwindcss/history/history-future-generative-css': {
    eyebrow: '下一阶段',
    summary: '生成式 CSS、原生新能力和 AI 协作，正在把“写样式”变成“约束样式系统”的问题，重点转向更稳的上下文和验证链。',
    highlights: ['AI 协作', '原生能力增强', '构建期与运行时继续融合'],
    packages: [
      { title: 'Lightning CSS', description: '高性能一体化 CSS 处理器的新趋势。', icon: 'icon-[mdi--flash-triangle-outline]', href: 'https://lightningcss.dev/' },
      { title: 'StyleX', description: '把原子化与编译期约束进一步收紧。', icon: 'icon-[mdi--vector-polyline]', href: 'https://stylexjs.com/' },
      { title: 'OpenAI / Agents', description: 'AI 正在改变样式生成与审查工作流。', icon: 'icon-[mdi--robot-happy-outline]', href: '/docs/tailwindcss/ai-friendly-and-demos' },
    ],
    solutions: [
      { title: 'AI 友好工作流', description: '把 prompt、lint、build、人工抽查串起来。', icon: 'icon-[mdi--robot-excited-outline]', href: '/docs/tailwindcss/ai-friendly-and-demos' },
      { title: '对照 Demo', description: '用同一 UI 比较不同样式方案的产物。', icon: 'icon-[mdi--test-tube]', href: '/docs/tailwindcss/demos' },
    ],
  },
  'tailwindcss/history/history-component-evolution': {
    eyebrow: '组件库演进',
    summary: '组件库从“带默认皮肤的 UI 套件”走向“headless + tokens + 自己持有源码”，样式体系因此越来越像基础设施。',
    highlights: ['从 UI Kit 到 Primitives', '从包依赖到源码所有权', '从主题覆盖到 token 约束'],
    packages: [
      { title: 'Ant Design', description: '传统带皮肤 UI Kit 的典型代表。', icon: 'icon-[logos--ant-design]', href: 'https://ant.design/' },
      { title: 'Radix UI', description: 'Primitives 路线的关键里程碑。', icon: 'icon-[mdi--orbit-variant]', href: 'https://www.radix-ui.com/' },
      { title: 'shadcn/ui', description: '把源码复制模式推成默认实践。', icon: 'icon-[mdi--content-copy]', href: '/docs/tailwindcss/shadcn-ui' },
    ],
    solutions: [
      { title: 'Headless + Tokens', description: '理解组件库为何开始分层设计。', icon: 'icon-[mdi--cube-send]', href: '/docs/tailwindcss/history/headless-tokens' },
      { title: '样式隔离', description: '处理可发布组件库的边界问题。', icon: 'icon-[mdi--border-inside]', href: '/docs/tailwindcss/style-isolation' },
    ],
  },
  'tailwindcss/tailwind-core': {
    eyebrow: '核心设计',
    summary: 'Tailwind 真正的价值不在“少写 CSS”，而在把 token、JIT、组件语义和评审约束接进同一条工程流水线。',
    highlights: ['token → 原子类 → 组件语义', 'content 精准扫描', 'JIT 与插件体系'],
    packages: [
      { title: 'Tailwind CSS', description: '从主题扩展到 utility 生成的完整核心。', icon: 'icon-[mdi--weather-windy]', href: 'https://tailwindcss.com/docs/utility-first', badge: 'Core' },
      { title: 'Tailwind Typography', description: '官方插件体系的典型代表。', icon: 'icon-[mdi--format-text]', href: 'https://tailwindcss.com/docs/typography-plugin' },
      { title: 'UnoCSS', description: '适合拿来对照 Tailwind 的设计取舍。', icon: 'icon-[logos--unocss]', href: 'https://unocss.dev/' },
    ],
    solutions: [
      { title: 'Tailwind vs UnoCSS', description: '从生态、类型提示与 merge 能力做比较。', icon: 'icon-[mdi--compare]', href: '/docs/tailwindcss/tailwind-vs-unocss' },
      { title: 'Merge / Variants', description: '把 Tailwind 接进组件 API 的关键一层。', icon: 'icon-[mdi--layers-edit]', href: '/docs/tailwindcss/merge-and-variants' },
    ],
  },
  'tailwindcss/tailwind-vs-unocss': {
    eyebrow: '方案对比',
    summary: 'Tailwind 赢在生态、merge、IDE 和社区范式，UnoCSS 赢在规则自由度与定制空间，核心取舍在于团队是否愿意自养规则系统。',
    highlights: ['生态对比', '规则自由度', 'merge 与提示成本'],
    packages: [
      { title: 'Tailwind CSS', description: '现成生态、设计系统范式和 merge 规则。', icon: 'icon-[mdi--weather-windy]', href: 'https://tailwindcss.com/' },
      { title: 'UnoCSS', description: '原子化引擎化，自定义规则与 preset 更强。', icon: 'icon-[logos--unocss]', href: 'https://unocss.dev/' },
      { title: 'tailwind-merge', description: 'Tailwind 场景下高度成熟的冲突去重方案。', icon: 'icon-[mdi--merge]', href: 'https://github.com/dcastil/tailwind-merge' },
    ],
    solutions: [
      { title: 'Tailwind 核心', description: '理解为什么 Tailwind 更适合“拿来即用”。', icon: 'icon-[mdi--rocket-launch-outline]', href: '/docs/tailwindcss/tailwind-core' },
      { title: '最佳实践', description: '把“选了 Tailwind 之后怎么落地”讲清楚。', icon: 'icon-[mdi--notebook-check-outline]', href: '/docs/tailwindcss/best-practices' },
    ],
  },
  'tailwindcss/merge-and-variants': {
    eyebrow: '组件闭环',
    summary: 'tailwind-merge、cva 和 tailwind-variants 共同解决的是“怎么让原子类长成稳定的组件 API”，这一步决定了 Tailwind 最终能不能维护。',
    highlights: ['merge 去重', '单槽 / 多槽变体', '从 tokens 走到组件产物'],
    packages: [
      { title: 'tailwind-merge', description: '保证外部 class 覆盖行为可预测。', icon: 'icon-[mdi--merge]', href: 'https://github.com/dcastil/tailwind-merge', badge: 'Must-have' },
      { title: 'class-variance-authority', description: '轻量单槽变体工厂。', icon: 'icon-[mdi--alpha-c-circle-outline]', href: 'https://cva.style/' },
      { title: 'tailwind-variants', description: '适合多槽组件与设计系统 recipes。', icon: 'icon-[mdi--shape-plus]', href: 'https://www.tailwind-variants.org/' },
    ],
    solutions: [
      { title: 'shadcn/ui', description: '看复制源码模式如何依赖 merge + variants。', icon: 'icon-[mdi--content-duplicate]', href: '/docs/tailwindcss/shadcn-ui' },
      { title: '最佳实践', description: '把状态收敛、默认值和评审规则接起来。', icon: 'icon-[mdi--tune-vertical-variant]', href: '/docs/tailwindcss/best-practices' },
    ],
  },
  'tailwindcss/shadcn-ui': {
    eyebrow: '源码所有权',
    summary: 'shadcn/ui 的真正影响不是某个按钮长什么样，而是它把“复制源码 + merge + variants + headless 基座”变成了前端团队的默认组件工作流。',
    highlights: ['复制源码', 'Radix + Tailwind', '组件所有权回到团队'],
    packages: [
      { title: 'shadcn/ui', description: '复制到仓库里维护，而不是单纯安装依赖。', icon: 'icon-[mdi--content-copy]', href: 'https://ui.shadcn.com/' },
      { title: 'Radix UI', description: '提供无样式交互 primitives。', icon: 'icon-[mdi--orbit-variant]', href: 'https://www.radix-ui.com/' },
      { title: 'Ariakit', description: '另一路 headless / a11y 组件底座。', icon: 'icon-[mdi--access-point-network]', href: 'https://ariakit.org/' },
    ],
    solutions: [
      { title: 'Merge / Variants', description: '理解 shadcn/ui 为何离不开 cn、cva、tv。', icon: 'icon-[mdi--source-merge]', href: '/docs/tailwindcss/merge-and-variants' },
      { title: '组件库演进', description: '把 shadcn/ui 放回更长的组件库历史里看。', icon: 'icon-[mdi--library-shelves]', href: '/docs/tailwindcss/history/component-evolution' },
    ],
  },
  'tailwindcss/best-practices': {
    eyebrow: '工程落地',
    summary: '真正让 Tailwind 稳定落地的不是会不会写类，而是能否把 token、variants、merge、体积监控和评审清单做成团队共同语言。',
    highlights: ['token 先行', '状态集中', 'content 与体积可验证'],
    packages: [
      { title: 'class-variance-authority', description: '把组件状态集中收敛成 builder。', icon: 'icon-[mdi--tune-variant]', href: 'https://cva.style/' },
      { title: 'tailwind-merge', description: '解决冲突类与外部覆盖行为。', icon: 'icon-[mdi--merge]', href: 'https://github.com/dcastil/tailwind-merge' },
      { title: 'clsx', description: '与 merge 搭配的轻量 class 组合入口。', icon: 'icon-[mdi--code-json]', href: 'https://github.com/lukeed/clsx' },
    ],
    solutions: [
      { title: '样式隔离', description: '微前端、组件库、第三方嵌入时的下一步。', icon: 'icon-[mdi--shield-sun-outline]', href: '/docs/tailwindcss/style-isolation' },
      { title: 'AI 友好工作流', description: '把最佳实践写进 prompt、lint 和 review。', icon: 'icon-[mdi--robot-industrial-outline]', href: '/docs/tailwindcss/ai-friendly-and-demos' },
    ],
  },
  'tailwindcss/style-isolation': {
    eyebrow: '边界治理',
    summary: '当 Tailwind 进入组件库、微前端、Widget 或第三方嵌入时，问题不再是“类写得漂不漂亮”，而是“样式边界怎么建立”。',
    highlights: ['命名空间', '编译期哈希', 'Shadow DOM / iframe', 'preflight 控制'],
    packages: [
      { title: 'CSS Modules', description: '通过哈希类名做编译期隔离。', icon: 'icon-[mdi--shield-lock-outline]', href: 'https://github.com/css-modules/css-modules' },
      { title: 'vanilla-extract', description: '类型安全的编译期样式与主题变量。', icon: 'icon-[mdi--palette-swatch-variant]', href: 'https://vanilla-extract.style/' },
      { title: 'Shadow DOM', description: '浏览器原生隔离边界的最终手段。', icon: 'icon-[mdi--dock-window]', href: 'https://developer.mozilla.org/docs/Web/API/Web_components/Using_shadow_DOM' },
    ],
    solutions: [
      { title: '最佳实践', description: '先把 tokens 与 variants 管好，再上隔离策略。', icon: 'icon-[mdi--hammer-wrench]', href: '/docs/tailwindcss/best-practices' },
      { title: '组件库演进', description: '理解隔离为什么会成为组件库必答题。', icon: 'icon-[mdi--widgets-outline]', href: '/docs/tailwindcss/history/component-evolution' },
    ],
  },
  'tailwindcss/ai-friendly-and-demos': {
    eyebrow: 'AI 协作',
    summary: '原子类对模型友好，但真正可交付的前提是把 token、variants、黑名单、merge 和构建验证一起给到模型。',
    highlights: ['Prompt 模板', '边界约束', 'React / Vue Demo', '校验链'],
    packages: [
      { title: 'OpenAI / Codex', description: '代表当前 AI 代码生成与协作工作流。', icon: 'icon-[mdi--robot-happy-outline]', href: 'https://openai.com/' },
      { title: 'tailwind-merge', description: '让模型产出的 class 组合更可收敛。', icon: 'icon-[mdi--merge]', href: 'https://github.com/dcastil/tailwind-merge' },
      { title: 'class-variance-authority', description: '把动态空间从字符串拼接收敛成枚举。', icon: 'icon-[mdi--counter]', href: 'https://cva.style/' },
    ],
    solutions: [
      { title: '最佳实践', description: '把团队约束先写清，再喂给模型。', icon: 'icon-[mdi--clipboard-text-search-outline]', href: '/docs/tailwindcss/best-practices' },
      { title: 'Demo 对照', description: '把同一 UI 放到 React / Vue / 多方案里验证。', icon: 'icon-[mdi--presentation-play]', href: '/docs/tailwindcss/demos' },
    ],
  },
  'tailwindcss/demos': {
    eyebrow: '对照实验',
    summary: '把同一张 UI 用 Raw CSS、Sass、Modules、CSS-in-JS、Tailwind、Headless 方案分别实现，最适合做团队分享和真实取舍讨论。',
    highlights: ['同题对照', '代码与产物并排看', '适合分享与评审'],
    packages: [
      { title: 'React', description: '用于展示 Tailwind / Headless 方案的组件写法。', icon: 'icon-[logos--react]', href: 'https://react.dev/' },
      { title: 'Vue', description: '用于对照 scoped / utility / variants 的另一套语义。', icon: 'icon-[logos--vue]', href: 'https://vuejs.org/' },
      { title: 'styled-components', description: '作为 CSS-in-JS 路线的典型对照。', icon: 'icon-[mdi--application-braces-outline]', href: 'https://styled-components.com/' },
    ],
    solutions: [
      { title: 'AI 友好工作流', description: '把 demo 变成 AI 提示的高质量上下文。', icon: 'icon-[mdi--robot-confused-outline]', href: '/docs/tailwindcss/ai-friendly-and-demos' },
      { title: '样式方案演化', description: '把 demo 与历史阶段一一对应起来。', icon: 'icon-[mdi--source-branch]', href: '/docs/tailwindcss/history' },
    ],
  },
}
