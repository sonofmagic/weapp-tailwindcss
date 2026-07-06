---
"weapp-tailwindcss": patch
---

优化 Vite Web/WebCompat 生成性能：显式 `target: "web"` 不再在开发态额外默认执行 WebCompat，HMR 默认支持所有 target 的新增候选增量追加，WebCompat 增量路径只转换新增 CSS 片段，并减少 Web target 下不必要的 classSet 与用户 CSS 规则扫描。

新增 `generator.hmr.preserveDeletedCss` 配置，默认 `true` 以启用高性能 HMR；设置为 `false` 时开发态源码 HMR 会全量再生成 CSS，从而不保留已删除 class 的旧 CSS。正式 build 始终保持精确输出。
