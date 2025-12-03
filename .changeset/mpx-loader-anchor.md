---
"weapp-tailwindcss": patch
---

修复 mpx 场景下的处理：
- webpack runtime loader 锚点改为跟随 `@mpxjs/webpack-plugin/lib/style-compiler/index` 插入顺序。
- rewrite css import 时 `@import "tailwindcss";` 改写为 `@import "weapp-tailwindcss/index.css";`。
