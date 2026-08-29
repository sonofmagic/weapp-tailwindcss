---
"weapp-tailwindcss": patch
---

官方 Vite、Webpack、Rspack 与 Gulp 适配器在 graph 模式下共享长期复用的 compiler session，使用同一份 snapshot 完成增量 CSS、模板和 JavaScript 转换，减少重复生成与运行时集合扫描，并在 owner 释放时完整回收 root 状态。
