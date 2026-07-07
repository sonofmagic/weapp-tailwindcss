---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

新增 Tailwind v4 demo 的官方 PostCSS parity 验证链路，并支持 `generator: false` 关闭内置生成器但保留小程序 CSS、模板和 JS 转译。

同时让小程序端 Tailwind v4 主题颜色跟随当前安装的 Tailwind 包解析，避免内置静态颜色表与官方输出漂移。
