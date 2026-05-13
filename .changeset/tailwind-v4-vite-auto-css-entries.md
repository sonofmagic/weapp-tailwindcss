---
"weapp-tailwindcss": patch
---

支持 Vite 场景下自动识别 tailwindcss v4 入口 CSS，未显式传入 cssEntries 时会在 CSS transform 阶段捕获包含 Tailwind 根指令的样式文件并刷新运行时 patcher；显式配置 cssEntries 时仍保持用户配置优先。
