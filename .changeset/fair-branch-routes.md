---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

内部按框架与打包器拆分插件分支，保持 `WeappTailwindcss` 与 PostCSS 公开入口不变。

`weapp-tailwindcss` 现在会在 Vite、Webpack、Gulp 入口提前解析 app type / bundler 分支，并进入对应 `frameworks/*` 插件工厂。uni-app Vite、uni-app x Vite、Taro、MPX、weapp-vite 与原生 Gulp 链路拥有直观的目录边界，uni-app x Vite 的额外插件组合也只保留在自己的框架分支中，降低单个框架改动影响其它打包器的风险。

`@weapp-tailwindcss/postcss` 增加 CSS 处理分支解析，将普通小程序、Web、`uni-app-x-css-webview` 与 `uni-app-x-css-uvue` 兼容处理拆到独立目录，避免平台兼容逻辑继续散落在通用 handler 中。

PostCSS 内部进一步拆出 `frameworks/*` 策略层与无框架语义的 style target profile：Taro、MPX、uni-app、uni-app x、weapp-vite 等框架先进入各自 strategy，再显式选择 `mini-program`、`web` 或 uni-app x 专属 CSS target，方便后续按框架扩展不同处理顺序，同时用互斥测试锁住“不执行其它框架后处理”的边界。
