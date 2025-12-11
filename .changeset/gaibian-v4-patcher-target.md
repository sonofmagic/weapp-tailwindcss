---
'weapp-tailwindcss': patch
---

修复 v4 补丁目标选择，只有显式使用 tailwindcss v4 时才会额外尝试为 @tailwindcss/postcss 打补丁，避免 v3 工程被误导到 v4 包后构建失败。
