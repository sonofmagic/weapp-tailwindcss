---
"weapp-tailwindcss": patch
---

修复 Vite 开发模式下模板类名热更新后，已由 Vite 处理过的 Tailwind CSS 产物可能复用旧样式的问题。现在组件模板新增 `text-[123rpx]` 等任意值类名时，WXML 转译结果和生成的 `wxss/acss` 等样式会同步刷新。

同时调整 Vite 样式入口判断，减少对 `app`、`main`、`tailwind`、`app-origin` 等文件名的硬编码依赖，改为优先依据构建图、已记住的 CSS 源、候选集变化和实际输出关系处理。
