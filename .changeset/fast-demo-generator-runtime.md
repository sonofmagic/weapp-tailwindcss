---
"weapp-tailwindcss": patch
---

优化 demo 构建与热更新中的 Tailwind 生成链路：Vite/Gulp/Webpack 会更精确地复用源码候选、CSS source 与运行时 class set 缓存，避免 v3 空构建复用上一次非空候选、v4 source 文件变化未进入签名，以及 v3 PostCSS 过早过滤配置类导致的重复生成和漏生成。
