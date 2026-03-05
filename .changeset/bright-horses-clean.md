---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/init": patch
"@weapp-tailwindcss/postcss": patch
"tailwindcss-injector": patch
"@weapp-tailwindcss/ui": patch
---

修复 Vite 集成在 dts 构建阶段替换 postcss 插件时触发的类型递归比较问题，避免 TS2321 与 TS2345 导致构建失败。

同时升级部分依赖与工作区 catalog 版本（包括 postcss、fs-extra、storybook 等），并同步更新锁文件以保持依赖解析一致性。
