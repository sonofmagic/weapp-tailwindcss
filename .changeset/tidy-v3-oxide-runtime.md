---
"weapp-tailwindcss": patch
---

Vite 生成模式下 Tailwind CSS v3 默认优先使用 Oxide 扫描到的源码候选类作为运行时输入，并将 v3 CSS 生成从 `postcss([tailwindcss(...)])` 切换为内部直接引擎，减少开发热更新中对 v3 PostCSS 插件和 runtime patcher 提取链路的依赖。
