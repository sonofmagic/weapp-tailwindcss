---
"weapp-tailwindcss": patch
---

修复多端 CI 构建依赖闭包、Playwright headless 浏览器安装和小程序样式产物收尾，避免兼容性测试因缺少构建入口或残留 CSS 哨兵失败。
