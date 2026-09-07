---
"weapp-tailwindcss": patch
---

修复 uni-app x 原生端与小程序隔离组件中单边边框显示为四边框的问题：在 SFC 作者样式前使用独立基础类承载现有 cssPreflight 边框配置。保留单边、多方向组合、显式覆盖与组件局部 @apply 的样式顺序，支持禁用 preflight。Refs #1160。
