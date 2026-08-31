---
"weapp-tailwindcss": patch
---

修复 Generic Vite Web 项目在 monorepo 中误继承上层框架配置的问题，并默认收敛成功构建时的 Tailwind CSS 运行时信息日志；显式日志级别和多端框架配置保持不变。
