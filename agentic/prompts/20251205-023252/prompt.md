## 目标/产物

- 现在你要准备一个技术分享，来和大家来 深入理解原子化 CSS
- 从过去到现在的角度，讲述 样式方案, 从 raw css 到 样式预处理器，到 css in js 再到原子化 CSS 的变迁
- 把对应的组件库，也做一个历史方向的变迁，比如原先后台管理的系统 element-ui，antd 这些，到现在的 headless ui，shadcn/ui, reka-ui 这些
- 介绍 原子化 CSS 的优势 和 劣势, 到底解决了什么问题
- 介绍 Tailwind CSS 的设计理念 和 主要特性
- 为什么选择 Tailwind CSS 而不是 Unocss， 核心在于生态，以及非常重要的 tailwind-merge
- 原子化 CSS 的最佳实践
- 为什么 原子化 CSS 是 AI 友好的，如何驱动 AI 来大量编写原子化CSS来提升前端开发效率
- 需要 react 和 vue 的示例, 分别使用 shadcn/ui 和 shadcn-vue 来做一个小 demo 页面
- 需要准备各样式方案的对照 demo（raw css、sass/less、css modules、css-in-js、tailwind、headless + cva/tailwind-variants、Vue 的 `<style scoped>`/Svelte scoped），给出代码片段与预期产物说明，并补充样式隔离方案（prefix/important、CSS Modules/vanilla-extract、Vue scoped、Svelte scoped、Shadow DOM/iframe、preflight 控制）的原理与取舍

## 约束（性能/风格/兼容/不可改动范围）

- 写作风格需要偏技术风, 适合技术分享，所以需要通俗易懂，避免 AI 腔，多用真实场景和可复制代码片段，辅以案例说明

## 验收标准（要跑的命令、预期输出/文件）

- 我需要你在 website/docs/tailwindcss 目录下，生成多个文件，并在 website 上设置一个专题链接，点进去可以看到内容；文档需包含上述各样式方案 demo 对照（含 Vue scoped）、React/Vue 示例、运行命令与预期产物说明

## 仓库路径

- 就是本仓库
- 需要 react 和 vue 的示例分别在 apps/react-app 和 apps/vue-app 目录下

## 允许操作（可/不可写文件，可运行的命令清单，可否联网）

- 可以写文件，可以创建新的 md 和 mdx 文件
- 可以运行构建网站的命令
- 可以联网查阅资料
- 可以安装依赖
- 可以使用 pnpm 进行包的管理
- 可以使用 git 进行版本控制
- 可以使用 vitest 进行单元测试
- 可以使用 nodejs 进行脚本编写

## 上下文线索（日志/文件/模块/相关 issue）

- 无

## 里程碑（根因→设计→实现→验证）

- [ ] 根因：原子化 CSS 的优势 和 劣势, 到底解决了什么问题
- [ ] 设计：原子化 CSS 的最佳实践
- [ ] 实现：Tailwind CSS 的设计理念 和 主要特性
- [ ] 验证：为什么 原子化 CSS 是 AI 友好的
- 运行网站访问指定的目录可以看到文档的文字结果
- 运行单元测试，确保代码正确运行
