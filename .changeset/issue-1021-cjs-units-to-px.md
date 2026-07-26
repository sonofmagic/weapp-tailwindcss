---
'@weapp-tailwindcss/postcss': patch
'weapp-tailwindcss': patch
---

修复 uni-app x 使用 `unitsToPx` 时 CommonJS 构建无法加载单位转换插件，避免 HBuilderX 编译直接中断；升级相关 PostCSS 单位转换插件并使用其兼容的 CommonJS 导出。
