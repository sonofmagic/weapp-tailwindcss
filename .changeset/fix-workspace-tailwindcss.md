---
'weapp-tailwindcss': patch
---

- 重构 tailwindcss 上下文，提炼出 workspace 工具模块，解决 `PNPM_PACKAGE_NAME` 场景下的 workspace 目录解析问题，并补充对应单测，确保 `rewriteCssImports` 能在过滤构建时正确生效。
