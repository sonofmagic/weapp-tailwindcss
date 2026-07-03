---
"weapp-tailwindcss": patch
---

修复 uni-app x 运行到 Web/H5 时 `.uvue` 模板类名未经过安全选择器转译，导致 Tailwind CSS v4 任意值样式不生效的问题；同时补充 Web 端组件默认边框重置，避免 Tailwind v4 preflight 与 uni-app x Web 运行时基础样式叠加后出现黑框；并修正 Vite dev CSS HMR module 的生成判断，避免普通组件样式重复生成 Tailwind CSS。同步更正 uniAppX 文档配置注意项。
