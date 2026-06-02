---
"weapp-tailwindcss": patch
---

修复 Taro Webpack watch 场景下输出目录被监听后，由插件改写产物反复触发重新编译的问题。Webpack 插件现在会在 watch 模式中默认把 `outputPath` 追加到 `ignored`，避免 `dist` 写入造成自循环。

同时整理 Taro Webpack v3 demo 的 Tailwind 样式入口顺序，避免 `postcss-import` 顺序警告干扰 watch 日志。
