---
"weapp-tailwindcss": patch
---

修复 Webpack web target 在开发态首轮构建中扫描已打包 JS/HTML 导致文档站卡在 92% asset processing 的问题，并确保显式 Tailwind CSS v4 入口在生产与开发构建中都能生成完整工具类样式。
