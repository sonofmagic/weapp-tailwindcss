---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

内部按框架与打包器增加分支路由，保持 `WeappTailwindcss` 与 PostCSS 公开入口不变。

`weapp-tailwindcss` 现在会在 Vite、Webpack、Gulp 入口提前解析 app type / bundler 分支，为 uni-app Vite、uni-app x Vite、Taro、MPX、weapp-vite 与原生 Gulp 链路提供独立的内部判断边界，降低单个框架改动影响其它打包器的风险。

`@weapp-tailwindcss/postcss` 增加 CSS 处理分支解析，将普通小程序、Web、uni-app x WebView 与 uni-app x uvue 兼容处理分开，避免平台兼容逻辑继续散落在通用 handler 中。
