---
"weapp-tailwindcss": patch
---

修复运行时类名集合包含内容扫描候选导致 JS 普通字符串被误转译的问题，并去掉仓库里对 tailwindcss-patch 的 catalog 固定，确保依赖行为与独立仓库一致。
