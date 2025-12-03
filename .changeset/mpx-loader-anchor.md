---
"weapp-tailwindcss": patch
---

修复 mpx 场景下 webpack runtime loader 锚点，改为跟随 `@mpxjs/webpack-plugin/lib/style-compiler/index` 插入顺序。
