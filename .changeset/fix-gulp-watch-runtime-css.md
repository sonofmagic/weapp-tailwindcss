---
"weapp-tailwindcss": patch
---

修复 Gulp 生成模式在 dev/watch 场景下模板或脚本新增类名后，主 WXSS 复用旧 classSet 缓存导致缺少新增样式的问题。
