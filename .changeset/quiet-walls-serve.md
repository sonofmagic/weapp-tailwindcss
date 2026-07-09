---
"weapp-tailwindcss": patch
---

修复 Vite serve/HMR 下小程序根样式产物的处理策略，保留框架原生生成的本地 `@import` shell，避免 `app.wxss` 等根样式文件被 Tailwind 生成 CSS 覆盖；Tailwind 生成内容继续写入配置的样式入口产物。
