---
"weapp-tailwindcss": patch
---

chore: 适配 `tailwindcss-patch@8` 新接口，补充解析路径与包名配置，保障 PostCSS7 兼容项目与各构建器在升级后仍可正确加载补丁；默认从当前子项目的 `node_modules` 中解析 Tailwind 依赖，并同步移除示例工程里冗余的 `tailwindcssBasedir` 设置
