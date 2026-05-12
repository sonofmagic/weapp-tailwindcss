---
"tailwindcss-config": patch
---

修复发布产物的 ESM 入口文件名与 `package.json` 导出声明不一致的问题，确保依赖已发布 `weapp-tailwindcss` 的 benchmark 工作区可以正确加载 Tailwind 配置工具包。
