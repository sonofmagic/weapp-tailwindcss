---
"weapp-tailwindcss": patch
---

增强 Webpack web target 最终 CSS asset 的保留逻辑，避免重新生成 Tailwind CSS 时丢失无类名选择器、主题变量、字体、媒体查询和第三方组件样式，同时防止 watch 增量更新保留旧的 Tailwind 生成类。
