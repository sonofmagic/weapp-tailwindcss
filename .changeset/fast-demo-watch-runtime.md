---
"weapp-tailwindcss": patch
---

优化 Webpack 与 Gulp demo 的 watch 热更新路径：普通页面、组件、脚本或模板变更复用已有 Tailwind runtime class set 和依赖元数据，仅在 Tailwind 配置、CSS source 或内容依赖变化时重新刷新完整 patcher。
