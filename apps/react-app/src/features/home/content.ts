export const checklist = [
  "类名全部取自 tokens，无裸色值/尺寸",
  "variants 集中在 cva/tailwind-variants，默认值已声明",
  "使用 cn(tailwind-merge) 避免顺序冲突",
  "断点覆盖 mobile-first，关键组件在 sm/md/lg 自检",
  "content 精准匹配，避免动态字符串拼接类名",
]

export const insights = [
  {
    title: "设计 token 对齐",
    desc: "OKLCH 色板 + @theme inline，暗色模式一键切换",
    badge: "tokens",
  },
  {
    title: "变体工厂",
    desc: "cva/tailwind-variants 集中声明 variants 与 compoundVariants",
    badge: "variants",
  },
  {
    title: "AI 友好",
    desc: "提示模板 + merge 校验，产出可复制的类名",
    badge: "ai",
  },
]

export const aiNotes = [
  {
    title: "tailwind-merge 守护",
    detail: "cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'px-6')",
    status: "ready",
  },
  {
    title: "tailwind-variants 配方",
    detail: "tv({ base, slots, variants, defaultVariants }) 描述 slots",
    status: "ready",
  },
  {
    title: "lint & content",
    detail: "content 仅指向 src，禁止字符串拼接类名",
    status: "watch",
  },
]

export const styleComparisons = [
  {
    title: "Raw CSS / BEM",
    note: "全局命名，容易理解，但靠纪律控制覆盖/命名冲突。",
    output: "单一 CSS，适合一次性页面或极小应用。",
    tag: "基础",
  },
  {
    title: "Sass / Less",
    note: "变量/混入提高复用；仍是全局作用域，需要 lint 控制嵌套。",
    output: "编译期内联变量，产物体积取决于复用度。",
    tag: "预处理",
  },
  {
    title: "CSS Modules",
    note: "类名哈希隔离，易于复用，但主题切换需额外 token 管线。",
    output: "作用域隔离的 CSS，适合可发布组件库。",
    tag: "组件边界",
  },
  {
    title: "CSS-in-JS",
    note: "props 驱动样式，动态能力强；需关注运行时/SSR 注水体积。",
    output: "运行时注入样式（或编译时提取），适合高度动态场景。",
    tag: "运行时",
  },
  {
    title: "Tailwind",
    note: "类名即样式，JIT + content 精准摇树，生态齐全。",
    output: "按需生成的原子类，依赖 tokens/variants 约束。",
    tag: "utility",
  },
  {
    title: "Headless + cva/tv",
    note: "API 与样式解耦，variants/compoundVariants 集中声明。",
    output: "class builder + merge 去重，最适合设计体系与 AI 流水线。",
    tag: "headless",
  },
  {
    title: "Vue <style scoped>",
    note: "SFC 编译时加 data-v 隔离，快速落地小型模块。",
    output: "scoped CSS + 原子类可混用，适合中小型 Vue 模块。",
    tag: "SFC",
  },
]

export const tokensSummary = [
  { label: "色板", value: "OKLCH + data-theme" },
  { label: "间距", value: "4/8/12/16 阶梯" },
  { label: "半径", value: "--radius, sm/md/lg/xl" },
]
