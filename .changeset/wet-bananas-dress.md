---
"weapp-tailwindcss": patch
---

修复 uni-app x Web 热更新时 SFC 描述符与生成样式块不同步的问题，隔离脚本子请求的样式缓存，并正确处理已移除的生成样式请求。Refs #1144。
