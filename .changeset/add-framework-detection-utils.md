---
"weapp-tailwindcss": patch
---

新增 `weapp-tailwindcss/framework` 工具入口，用于判断当前项目是 MPX、Taro、uni-app、uni-app x、uni-app Vite 还是 weapp-vite。检测逻辑支持 package.json、manifest.json、HBuilderX 运行目录以及 `UNI_PLATFORM`、`UNI_UTS_PLATFORM`、`TARO_ENV`、`MPX_CLI_MODE` 等环境变量。

Vite 插件的自动 `appType` 推断现在复用同一套检测逻辑，并补充 uni-app x 依赖标记识别。
