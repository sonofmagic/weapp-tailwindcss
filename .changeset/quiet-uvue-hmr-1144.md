---
"weapp-tailwindcss": patch
---

修复 uni-app x Web 热更新将完整 `.uvue` 源码误交给 PostCSS 解析，导致模板插值触发 `Unknown word` 警告的问题。Refs #1144
