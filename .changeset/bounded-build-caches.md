---
"@weapp-tailwindcss/engine": patch
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

为跨会话 design system、模块解析、CSS 入口以及 PostCSS 配置和管线复用增加容量上限与最近使用淘汰，避免长期 watch 持续保留旧配置和旧入口；失败任务仅清除自身缓存，不影响更新后的请求。
