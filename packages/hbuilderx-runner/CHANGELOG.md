# @weapp-tailwindcss/hbuilderx-runner

## 0.1.1

### Patch Changes

- 🐛 **修复 uni-app x Native scoped 作者样式被通用 CSS 生成管线提前改写的问题，并统一 Windows 下 Vite 模块身份与 HMR 候选刷新顺序，确保新增、删除和回滚类名时会重新编译对应 `.uvue` 本地样式；同时细分 Harmony 构建失败、保留 HBuilderX 日志中的首个关键错误，并让 Harmony 回归基于与 HBuilderX Alpha 对齐的编译器及最终 JavaScript 产物验收样式。** [#1036](https://github.com/sonofmagic/weapp-tailwindcss/pull/1036) by @sonofmagic

## 0.1.0

### Minor Changes

- ✨ **新增 HBuilderX stable、Alpha 共存选择能力，将 CLI 路径、运行实例 host 与版本绑定到同一 runner 会话，并让仓库 HBuilderX e2e、demo 与 visual 工作流稳定使用指定版本。** [`8319746`](https://github.com/sonofmagic/weapp-tailwindcss/commit/83197469e6662c684ae30ab9bbd6b0b58ea75d20) by @sonofmagic

## 0.0.4

### Patch Changes

- 🐛 **修复多 iOS 模拟器环境下 HBuilderX 测试无法自动选择设备的问题。** [`d6c0951`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d6c0951bdd1b10b5a57dd8b6bac73850f1147e49) by @sonofmagic

## 0.0.3

### Patch Changes

- 🐛 **修复 HBuilderX 多端运行时的项目别名、工具链定位与启动参数处理，确保 uni-app、uni-app x 在 Android、iOS、Harmony 和微信小程序回归中使用正确项目与实际输出目录，并补充对应测试。** [#988](https://github.com/sonofmagic/weapp-tailwindcss/pull/988) by @sonofmagic

## 0.0.2

### Patch Changes

- 🐛 **内部按框架与打包器拆分插件分支，保持 `WeappTailwindcss` 与 PostCSS 公开入口不变。** [#969](https://github.com/sonofmagic/weapp-tailwindcss/pull/969) by @sonofmagic
  - `weapp-tailwindcss` 现在会在 Vite、Webpack、Gulp 入口提前解析 app type / bundler 分支，并进入对应 `frameworks/*` 插件工厂。uni-app Vite、uni-app x Vite、Taro、MPX、weapp-vite 与原生 Gulp 链路拥有直观的目录边界，uni-app x Vite 的额外插件组合也只保留在自己的框架分支中，降低单个框架改动影响其它打包器的风险。
  - `@weapp-tailwindcss/postcss` 增加 CSS 处理分支解析，将普通小程序、Web、`uni-app-x-css-webview` 与 `uni-app-x-css-uvue` 兼容处理拆到独立目录，避免平台兼容逻辑继续散落在通用 handler 中。
  - PostCSS 内部进一步拆出 `frameworks/*` 策略层与无框架语义的 style target profile：Taro、MPX、uni-app、uni-app x、weapp-vite 等框架先进入各自 strategy，再显式选择 `mini-program`、`web` 或 uni-app x 专属 CSS target，方便后续按框架扩展不同处理顺序，同时用互斥测试锁住“不执行其它框架后处理”的边界。
  - 新增 `@weapp-tailwindcss/hbuilderx-runner`，沉淀 HBuilderX CLI 本地运行能力。它负责解析正在运行的 HBuilderX 或 `HBUILDERX_CLI_PATH`、封装项目 open/close/launch、统一超时和进程树清理，并把项目识别错误、配置加载失败、Android/iOS/Harmony 工具链缺失等常见失败归类成可诊断错误，供 HBuilderX e2e 与后续 demo/CLI 脚本复用。

## 0.0.1

- 初始版本，提供 HBuilderX CLI 调用、日志、错误分类和工具链探测辅助能力。
