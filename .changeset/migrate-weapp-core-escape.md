---
"@weapp-tailwindcss/escape": patch
"@weapp-tailwindcss/postcss": patch
"@weapp-tailwindcss/runtime": patch
"@weapp-tailwindcss/merge": patch
"weapp-tailwindcss": patch
---

将类名转义基础包源码纳入本仓库，以 @weapp-tailwindcss/escape 从新版本序列独立发布，并统一替换编译端、PostCSS 和运行时的依赖及类型引用。保留原转义 API、ESM/CJS 入口和映射行为，增加旧发布版对照与新包名打包验证。

公开 workspace 消费方统一使用 repoctl 要求的 `workspace:*`，发布 tarball 固定到同批 escape 版本，避免保留旧依赖范围策略导致 Release 协议校验失败。
