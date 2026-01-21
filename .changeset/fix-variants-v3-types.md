---
"@weapp-tailwindcss/variants-v3": patch
---

修复运行时配置合并的类型问题，避免 `twMergeConfig` 被推断为 `undefined`，并兼容严格的属性访问规则。
