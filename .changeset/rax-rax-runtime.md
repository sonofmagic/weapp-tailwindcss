---
"weapp-tailwindcss": patch
---

优化 webpack 注入逻辑，确保 `weapp-tw-css-import-rewrite-loader` 在 Mpx 的 `@mpxjs/webpack-plugin/lib/style-compiler` 之前运行，避免重复注入导致的执行顺序混乱；同时在 Rax 场景下自动识别 `src/global.*` 作为 `cssEntries`，即使未显式配置 `appType` 也能正确收集 Tailwind 类，修复 demo `rax-app` 中 JS 类名无法转译的问题。
