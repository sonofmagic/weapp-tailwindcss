---
"@weapp-tailwindcss/cli": patch
---

修复原生 watch 连续更新与停止清理，排除外置 source map 的重建反馈，并在写入前阻止输入、CSS 与 map 路径冲突。Refs #1262、#1263、#1264。
