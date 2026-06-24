---
"weapp-tailwindcss": patch
---

新增 Vite 构建下的 `transform.include` / `transform.exclude` 配置，用于控制需要进入 `weapp-tailwindcss` HTML/CSS/JS 转译流程的源码或产物，并在 JS AST 转译耗时异常时提示可排除大型生成 TS/JS chunk。
