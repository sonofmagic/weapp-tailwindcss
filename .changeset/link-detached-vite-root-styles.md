---
'weapp-tailwindcss': patch
---

统一修复 Vite 小程序构建中框架根样式与运行时样式入口分离时的引用关系，并优先根据 Rollup 入口元数据识别实际运行时根样式。
