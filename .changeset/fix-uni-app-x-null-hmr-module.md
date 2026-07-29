---
"weapp-tailwindcss": patch
---

修复 uni-app x 保存 Tailwind CSS 入口时，Vite 模块的空标识进入 HMR 模块图并中断热更新的问题；同步维护开发服务器与构建监听中的权威入口源码并刷新 Tailwind 运行时，同时让组件局部 `@apply` 继承唯一的项目 Tailwind 根入口，确保新增主题类在 Web 与原生 App 中无需重新运行即可生效。
