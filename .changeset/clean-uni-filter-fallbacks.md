---
'@weapp-tailwindcss/postcss': patch
'weapp-tailwindcss': patch
---

修复 uni-app 的 PostCSS 兼容链展开 Tailwind CSS v4 空变量回退值后生成 `filter: ;` 与 `backdrop-filter: ;` 的问题；最终小程序样式会移除无效的普通空属性，同时保留 Tailwind 运行时所需的空自定义属性初始化。
