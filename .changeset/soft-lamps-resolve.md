---
"weapp-tailwindcss": patch
---

修复 Vite web/generator 模式下自动收集的 Tailwind v4 CSS source 未按源 CSS 文件目录解析相对 `@config` 路径的问题，避免 VitePress 等项目从 Vite root 错误解析配置文件。
