---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 `@source` 扫描路径未复用 `customAttributes` 的问题，使 `t-class` 等自定义模板类名属性中的工具类可以参与 CSS 生成。
