---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 生成模式下 `tailwindcss/preflight.css` subpath import 的处理策略：web 目标仅在显式使用 `layer(...)` 导入时保留 Preflight，小程序目标继续裁剪浏览器标签 reset，并补充对应回归测试。
