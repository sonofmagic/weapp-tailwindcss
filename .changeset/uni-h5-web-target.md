---
"weapp-tailwindcss": patch
---

修复 uni-app H5 / web 模式下 Vite 插件仍走小程序生成链路的问题。H5 会自动使用 web target，跳过小程序模板、JS、runtime class set 与 source candidate 根目录扫描，保留 Vite/Tailwind 生成的浏览器 CSS；小程序构建仍保持 class 转义和 wxss 输出。
