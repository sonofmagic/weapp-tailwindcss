---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复多个 CSS 入口合并后文件型 @source 的来源丢失与候选归属错误，保留空范围及主题冲突语义，并监听扫描文件变化。Refs #1241
