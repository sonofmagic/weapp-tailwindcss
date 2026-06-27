---
'@weapp-tailwindcss/postcss': patch
weapp-tailwindcss: patch
---

修复 Web 兼容模式下 Tailwind CSS v4 的渐变变量与 @property 处理，避免 H5 渐变失效，并补充 uni-app、taro、mpx、uni-app x 等场景的回归测试。
