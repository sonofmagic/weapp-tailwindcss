---
"weapp-tailwindcss": minor
"@weapp-tailwindcss/cli": minor
"@weapp-tailwindcss/init": major
---

改善开发体验：新增固定 Generic Web target 的 `weapp-tailwindcss/vite/web` 入口，修正 `doctor` 对官方 Tailwind 生成器和 CSS 入口的诊断，并将初始化器默认切换为 Tailwind CSS 4 CSS-first 流程；旧版初始化配置改为通过 `mode: 'legacy'` 显式启用。
