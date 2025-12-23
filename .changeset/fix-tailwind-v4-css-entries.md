---
'weapp-tailwindcss': patch
---

修复配置 cssEntries 时默认强制覆盖 tailwind v4 base 导致 @config 解析到错误目录的问题，保持用户自定义 base 并让入口目录成为默认解析基准，避免运行时类名收集为空。
