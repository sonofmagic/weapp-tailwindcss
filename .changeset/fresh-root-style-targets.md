---
"weapp-tailwindcss": patch
---

修复 Vite 小程序样式注入在显式 root `outputFile` 存在时，误把其它根样式文件也当作主样式注入目标的问题，避免 `@layer` 或非标准根样式文件干扰输出归属。
