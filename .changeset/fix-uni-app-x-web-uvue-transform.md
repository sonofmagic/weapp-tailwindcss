---
"weapp-tailwindcss": patch
---

修复 uni-app x 运行到 Web/H5 时 `.uvue` 模板类名未经过安全选择器转译，导致 Tailwind CSS v4 任意值样式不生效的问题，并同步更正 uniAppX 文档配置注意项。
