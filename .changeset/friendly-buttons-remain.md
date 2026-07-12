---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 小程序生成管线误删用户原生伪元素选择器的问题，确保 `button::after` 等无 class 规则按用户样式来源完成转换和合并，不再需要额外添加 workaround class，同时继续清理浏览器专用 preflight。
