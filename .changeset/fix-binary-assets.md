---
'weapp-tailwindcss': patch
---

修复运行时 loader 在某些构建链路中接管图片等二进制资源时会破坏文件内容的问题，确保仅在 postcss-loader 之后注入并跳过 Buffer 处理，避免 dist/assets/logo.png 等静态资产被损坏。
