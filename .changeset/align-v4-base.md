---
"weapp-tailwindcss": patch
---

修复仅有单个 CSS entry 时 v4 base 错指项目根目录，确保按 entry 所在目录生成 patcher 以避免 @config 解析错位。
