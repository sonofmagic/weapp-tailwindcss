---
"weapp-tailwindcss": patch
---

修复 Vite、Webpack、Gulp watch/HMR 与 Node.js `createContext` API 长生命周期场景下样式增量生成和构建适配层缓存持续增长的问题，限制 Tailwind 增量缓存、Vite 样式缓存、Webpack 处理缓存与 Gulp 流式处理缓存规模，避免 `transformWxss` 默认反复强制刷新 Tailwind 运行时；同时为 Node.js API 暴露 `ctx.getRuntimeSet()`，让自研构建器可以直接复用 Tailwind 自动提取的运行时类名集合，并为 watch-HMR 与 Node API 回归工具补充 RSS/heap 内存监控和预算守卫。

修复 weapp-vite 配置 `srcRoot` 后，Vite CSS pipeline 会额外生成 `miniprogram/app.wxss`、`miniprogram/sub-normal/pages/index.wxss` 等源码根前缀产物的问题，并避免独立分包样式被主包或普通分包候选污染。

升级 `tailwindcss-patch` 到 `9.4.4`，并重新生成 generator mode 的 CSS 输出对比快照，确保升级后的构建报告仍保持独立 CSS 文件边界。
