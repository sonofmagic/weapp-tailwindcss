---
"@weapp-tailwindcss/source-scan": patch
"@weapp-tailwindcss/engine": patch
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
"@weapp-tailwindcss/cli": patch
"weapp-style-injector": patch
"tailwindcss-config": patch
---

统一来源扫描基础设施与共享语义契约，修复 Windows glob、qxml、绝对来源排除及配置更新缓存；拆分 PostCSS 子路径和核心扫描职责，解除值依赖循环与核心对构建器的反向引用，CLI 与 PostCSS 复用生成会话扫描并释放资源。
