---
"weapp-tailwindcss": patch
---

升级并对齐 OXC 解析器与 AST 类型依赖，修复新版 `oxc-walker` 无法加载导致 JS 快路径回退的问题，并确保 CommonJS 构建继续兼容仅提供 ESM 导出的 walker。
