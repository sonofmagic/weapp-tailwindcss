---
"weapp-tailwindcss": major
"@weapp-tailwindcss/debug-uni-app-x": patch
"@weapp-tailwindcss/init": patch
"@weapp-tailwindcss/logger": patch
"@weapp-tailwindcss/postcss": patch
"@weapp-tailwindcss/reset": patch
"@weapp-tailwindcss/shared": patch
"@weapp-tailwindcss/typography": patch
"tailwindcss-config": patch
"theme-transition": patch
"weapp-style-injector": patch
---

升级核心 Babel 工具链到 Babel 8，并将 Node.js 最低版本提升到 `^22.18.0 || >=24.11.0`。相关包默认采用 ESM 语义，继续同时发布 ESM 与 CommonJS 入口；ESM 产物使用 `.js`，CommonJS 产物使用 `.cjs`，原有公开包名与子路径保持不变。同时收紧 tsdown 的依赖外置策略，避免 ESM 无条件内联可直接消费的依赖，并保证 CommonJS 不会同步加载 ESM-only 依赖。Webpack loader 与 CommonJS runtime 复用同一构建图，避免重复加载 Babel 8 等内联依赖；watch 热更新复用解析缓存并采用轻量 AST 签名遍历，降低 MPX、Taro Webpack 等链路的内存和插件处理耗时。Webpack 产物中的 harmony import 注释与 JSDoc import type 不再误触发模块图解析。
