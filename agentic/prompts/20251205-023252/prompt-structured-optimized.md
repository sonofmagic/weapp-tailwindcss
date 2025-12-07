## 目标/产物

- 技术分享专题：深入理解原子化 CSS，面向前端 1-3 年/全栈/设计师人群，45-60 分钟，期望带走 3-5 个核心结论（为什么出现、解决/未解决的问题、Tailwind 设计理念、与 UnoCSS 取舍、AI 友好性与实战）。
- 产出：`website/docs/tailwindcss` 下多页或单页 MDX 文档，包含导航 frontmatter（`title`/`description`/`sidebar_position`），在网站新增专题链接可直达；附 React/Vue Demo（`apps/react-app` 与 `apps/vue-app`）可本地运行，包含主题切换、响应式布局、表单/卡片/数据展示并体现 `tailwind-merge` 或 `cva` 用法；新增「样式方案对照」页，涵盖 raw css、sass/less、css modules、css-in-js、tailwind、headless + cva/tailwind-variants 以及 Vue `<style scoped>`/Svelte scoped 代码与预期产物；新增样式隔离章节（prefix/important、CSS Modules/vanilla-extract、Vue/Svelte scoped、Shadow DOM/iframe、preflight 控制）说明原理与取舍；可选导出讲稿提纲。
  - 章节建议：
  - 历史纵览：Raw CSS → 预处理器（Sass/Less + BEM/OOCSS）→ CSS Modules → CSS-in-JS → Utility-first（Tailwind/Windi/Uno）→ Token 化/下一阶段，最好用时间轴表格或 mermaid。
  - 组件库演进：Element/AntD → Headless UI/shadcn/ui/reka-ui，对比 API/样式隔离/定制性/无障碍/生态。
  - 原子化 CSS 优劣：解决的核心问题（认知负担、样式漂移、摇树优化等）与风险（可读性、class 爆炸、设计不统一等），列出“不适用场景”。
  - Tailwind 设计理念与特性：设计 tokens、JIT、分层（base/components/utilities）、variants（responsive/state/aria）、插件、`@apply` 限制、`preflight` 注意点。
  - Tailwind vs UnoCSS：生态（插件/主题/社区资产）、类型提示、`tailwind-merge` 去重边界、`clsx`/`cva` 组合范式、与 Vite/RSC/SSR/HMR 的集成差异。
  - 样式隔离：prefix/important、编译期哈希（CSS Modules/vanilla-extract）、编译期 scoped（Vue/Svelte）、作用域容器、Shadow DOM/iframe、preflight 控制，列举原理、配置示例、适用场景。
  - 最佳实践：设计体系（token、多主题、`data-*` 驱动）、工程（class 组织、`cva`/`tv`、`@layer` 隔离、`group`/`peer`/`aria`、`clamp()`/container queries）、性能（精准 `content`、避免动态类膨胀、产物体积验证）、维护（评审清单）。
  - AI 友好：为什么原子类易于生成、模型提示模板（约束/示例/禁用指令）、`tailwind-merge`/lint 校验链、常见错误案例（顺序冲突/断点误用/未注册色）。
  - 封装与变体：强调 `cva` 与 `tailwind-variants` 的核心思想（集中声明 variants/defaults/compound variants，输出 class builder，解耦数据与样式），给出按钮/表单的封装示例与复用策略。
  - Demo 要点：React + shadcn/ui、Vue + shadcn-vue，含主题切换与交互；附运行命令与截图占位；提供样式方案对照 demo 的片段与产物说明。

## 约束（性能/风格/兼容/不可改动范围）

- 写作风格：技术口吻但通俗，每节有 TL;DR，穿插代码块、对照表、FAQ、检查清单；真实类名示例，中英术语对照，避免 AI 腔，多用真实场景和可落地的代码/命令。
- 排版/素材：MDX 可用 Tabs/CodeTabs 展示 React/Vue；1-2 个 mermaid 图；命令清单可复制；截图留占位注释（如 `<!-- screenshot: homepage-light/dark -->`）。
- 不改/少改：避免引入新设计系统与大体积依赖，不修改核心构建配置除非必要；保持既有 Tailwind/工具链约定。

## 验收标准（要跑的命令、预期输出/文件）

- 文档：`website/docs/tailwindcss` 下文件含有效 frontmatter，专题链接可见，内部锚点/链接有效，无明显排版/中英空格问题；包含样式方案对照页（含 Vue scoped 示例）及产物说明。
- 代码：React/Vue 示例可运行（`pnpm --filter apps/react-app dev`，`pnpm --filter apps/vue-app dev`），展示 `tailwind-merge`/`cva` 应用；如添加测试可跑 `pnpm test`。
- 构建：必要时 `pnpm build:docs` 或等效文档构建命令通过；样式类无冲突，命令清单可复制。

## 仓库路径

- 本仓库，文档主要在 `website/docs/tailwindcss`，示例在 `apps/react-app`、`apps/vue-app`。

## 允许操作（可/不可写文件，可运行的命令清单，可否联网）

- 可写新 md/mdx 文件，编辑文档与示例；可运行/构建网站；可联网查阅资料；可安装依赖；用 pnpm 管理；可用 git；可用 vitest；可用 node 脚本。

## 上下文线索（日志/文件/模块/相关 issue）

- 暂无其他线索。

## 里程碑（根因→设计→实现→验证）

- [ ] 根因：原子化 CSS 的优势/劣势、解决/未解决的问题。
- [ ] 设计：原子化 CSS 最佳实践、章节/示例结构。
- [ ] 实现：Tailwind CSS 设计理念、主要特性、示例代码落地。
- [ ] 验证：AI 友好性说明与演示；运行网站查看文档；必要的构建/测试通过。
