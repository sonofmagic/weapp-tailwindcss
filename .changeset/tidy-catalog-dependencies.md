---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
"@weapp-tailwindcss/init": patch
"@weapp-tailwindcss/debug-uni-app-x": patch
"@weapp-tailwindcss/typography": patch
"tailwindcss-injector": patch
---

统一升级构建链路依赖，并将多个跨包复用的工具依赖提炼到 pnpm catalog，降低版本漂移和后续升级成本。
